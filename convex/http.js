const { httpRouter } = require("convex/server");
const { Webhook } = require("svix");
const { api } = require("./_generated/api");
const { httpAction } = require("./_generated/server");
const Groq = require("groq-sdk");

const http = httpRouter();

// <--- Initialize Groq 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          email,
          name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    return new Response("Webhooks processed successfully", { status: 200 });
  }),
});

// validate and fix workout plan to ensure it has proper numeric types
function validateWorkoutPlan(plan) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine) => ({
        name: routine.name,
        sets: typeof routine.sets === "number" ? routine.sets : parseInt(routine.sets) || 1,
        reps: typeof routine.reps === "number" ? routine.reps : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// validate diet plan to ensure it strictly follows schema
function validateDietPlan(plan) {
  // only keep the fields we want
  const validatedPlan = {
    dailyCalories: plan.dailyCalories,
    meals: plan.meals.map((meal) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      // ✅ Remove user_identifier - only extract fitness data
      const {
        age,
        gender,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
        // ✅ No user_identifier - we get it dynamically from session
      } = payload;

      console.log("Payload received:", payload);

      // ✅ Get clerkId from the most recent active user session
      const currentUser = await ctx.runQuery(api.sessions.getCurrentVapiUser);

      if (!currentUser) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No active user session found. Please refresh and try again.",
          }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      const clerkId = currentUser.clerkId;
      console.log("Using dynamic clerkId from active session:", clerkId);

      // ✅ Verify user exists in database
      const existingUser = await ctx.runQuery(api.users.getUserByClerkId, {
        clerkId: clerkId
      });

      if (!existingUser) {
        console.error("User not found in database for clerkId:", clerkId);
        return new Response(
          JSON.stringify({
            success: false,
            error: "User not found in database",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      console.log("User found in database:", existingUser);

      // <--- Select Groq Model (Env var or fallback)
      const modelId = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

      const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
      Age: ${age}
      Gender: ${gender}
      Height: ${height}
      Weight: ${weight}
      Injuries or limitations: ${injuries}
      Available days for workout: ${workout_days}
      Fitness goal: ${fitness_goal}
      Fitness level: ${fitness_level}
      
      As a professional coach:
      - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
      - Design exercises that match the fitness level and account for any injuries
      - Structure the workouts to specifically target the user's fitness goal
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
      - For example: "sets": 3, "reps": 10
      - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
      - Instead use specific numbers like "reps": 12 or "reps": 15
      - For cardio, use "sets": 1, "reps": 1 or another appropriate number
      - NEVER include strings for numerical fields
      - NEVER add extra fields not shown in the example below
      
      Return a JSON object with this EXACT structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10
              }
            ]
          }
        ]
      }
      
      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      console.log("Generating workout plan...");
      
      // <--- Updated to Groq API Call
      const workoutCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: workoutPrompt }],
        model: modelId,
        response_format: { type: "json_object" }, // Ensures strictly valid JSON
        temperature: 0.4,
      });

      const workoutPlanText = workoutCompletion.choices[0]?.message?.content || "{}";

      // VALIDATE THE INPUT COMING FROM AI
      let workoutPlan = JSON.parse(workoutPlanText);
      workoutPlan = validateWorkoutPlan(workoutPlan);
      console.log("Workout plan generated and validated");

      const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Gender: ${gender}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${dietary_restrictions}
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      console.log("Generating diet plan...");
      
      // <--- Updated to Groq API Call
      const dietCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: dietPrompt }],
        model: modelId,
        response_format: { type: "json_object" }, // Ensures strictly valid JSON
        temperature: 0.4,
      });

      const dietPlanText = dietCompletion.choices[0]?.message?.content || "{}";

      // VALIDATE THE INPUT COMING FROM AI
      let dietPlan = JSON.parse(dietPlanText);
      dietPlan = validateDietPlan(dietPlan);
      console.log("Diet plan generated and validated");

      // ✅ Save plan with dynamic clerkId from session
      console.log("Creating plan in database for userId:", clerkId);
      const planId = await ctx.runMutation(api.plans.createPlanWithUserId, {
        userId: clerkId, // ✅ Dynamic clerkId from active session
        dietPlan,
        isActive: true,
        workoutPlan,
        name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
      });

      console.log("Plan created successfully with ID:", planId);

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
            userId: clerkId, // ✅ Dynamic clerkId in response
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

module.exports = http;