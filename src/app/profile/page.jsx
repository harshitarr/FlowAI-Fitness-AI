"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import CornerElements from "@/components/CornerElements";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppleIcon, CalendarIcon, DumbbellIcon, TrendingUpIcon, TargetIcon, FlameIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // ✅ Updated: No userId parameter needed - gets clerkId from auth context
  const allPlans = useQuery(
    api.plans.getUserPlans,
    isLoaded && user ? {} : "skip" // Skip if user not loaded or not authenticated
  );

  // Get current day for highlighting (dynamic, not hardcoded)
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return days[today.getDay()];
  };

  const currentDay = getCurrentDay();

  // Show loading state while user data is loading
  if (!isLoaded) {
    return (
      <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
        <div className="mb-10 relative backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/40 border border-border/50 rounded-xl p-6">
          <CornerElements />
          <div className="flex flex-col items-center justify-center h-24 space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary"></div>
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
            </div>
            <span className="text-muted-foreground font-mono text-sm">Loading user data...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
        <div className="mb-10 relative backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/40 border border-border/50 rounded-xl p-6">
          <CornerElements />
          <div className="flex items-center justify-center h-24">
            <span className="text-muted-foreground font-mono text-sm">Please sign in to view your profile</span>
          </div>
        </div>
      </section>
    );
  }

  const activePlan = allPlans?.find((plan) => plan.isActive);
  const currentPlan = selectedPlanId
    ? allPlans?.find((plan) => plan._id === selectedPlanId)
    : activePlan;

  return (
    <section className="relative z-10 pt-12 pb-32 flex-grow container mx-auto px-4">
      <ProfileHeader user={user} />

      {allPlans && allPlans?.length > 0 ? (
        <div className="space-y-6">
          {/* ENHANCED PLAN SELECTOR */}
          <div className="relative backdrop-blur-sm bg-gradient-to-br from-card/90 to-card/60 border border-border/50 rounded-xl p-6 shadow-lg">
            <CornerElements />
            
            {/* Header with Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Your Fitness Plans
                </h2>
                <p className="text-xs text-muted-foreground">Track your progress and manage your fitness journey</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="font-mono text-lg font-bold text-primary">{allPlans.length}</div>
                  <div className="font-mono text-xs text-muted-foreground uppercase">Total</div>
                </div>
                
                <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="font-mono text-lg font-bold text-green-500">
                    {allPlans.filter(plan => plan.isActive).length}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground uppercase">Active</div>
                </div>
              </div>
            </div>

            {/* Plan Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPlans.map((plan) => (
                  <div
                    key={plan._id}
                    onClick={() => setSelectedPlanId(plan._id)}
                    className={`
                      relative group cursor-pointer p-4 rounded-lg transition-all duration-300 hover:shadow-md
                      ${
                        selectedPlanId === plan._id
                          ? "bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary shadow-md"
                          : "bg-gradient-to-br from-background/80 to-background/40 border border-border/50 hover:border-primary/30"
                      }
                      w-full min-w-[220px] max-w-full sm:max-w-[340px] mx-auto
                    `}
                    style={{boxSizing: 'border-box'}}
                  >
                  {/* Plan Status Badge */}
                  {plan.isActive && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-200 to-green-100 text-green-900 text-xs font-semibold px-2 py-1 rounded-full shadow-sm border border-green-200" style={{letterSpacing: '0.04em'}}>
                        <div className="flex items-center gap-1">
                          <CheckCircle2Icon className="w-2 h-2 text-green-500" />
                          Active
                        </div>
                      </div>
                  )}

                  {/* Plan Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <h3 className="font-bold text-sm text-foreground truncate">{plan.name}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-mono text-primary">
                        {new Date(plan._creationTime).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3 pt-1 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DumbbellIcon className="w-3 h-3" />
                        <span>{plan.workoutPlan?.exercises?.length || 0} Days</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AppleIcon className="w-3 h-3" />
                        <span>{plan.dietPlan?.dailyCalories || 0} kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ENHANCED PLAN DETAILS */}
          {currentPlan && (
            <div className="relative backdrop-blur-sm bg-gradient-to-br from-card/95 to-card/70 border border-border/50 rounded-xl overflow-hidden shadow-lg">
              <CornerElements />

              {/* Plan Header */}
              <div className="relative p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                      <h3 className="text-xl font-bold text-foreground break-words max-w-[90vw] sm:max-w-none">
                        {currentPlan.name}
                      </h3>
                      {currentPlan.isActive && (
                        <div className="bg-gradient-to-r from-green-200 to-green-100 text-green-900 text-xs font-semibold px-2 py-1 rounded-full shadow-sm border border-green-200" style={{letterSpacing: '0.04em'}}>
                          Active Plan
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground break-words max-w-[90vw] sm:max-w-none">Your personalized fitness and nutrition program</p>
                  </div>

                  {/* Plan Stats */}
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
                    <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50 min-w-[100px] flex-1 sm:flex-none">
                      <TrendingUpIcon className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="font-mono text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-lg border border-border/50 min-w-[100px] flex-1 sm:flex-none">
                      <TargetIcon className="w-4 h-4 text-green-500 mx-auto mb-1" />
                      <div className="font-mono text-xs text-muted-foreground">Goals</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Tabs - Pill Style like in image */}
              <div className="p-6">
                <Tabs defaultValue="workout" className="w-full">
                  {/* Custom Tab Buttons - Pill Style matching the image */}
                  <div className="mb-6 flex items-center justify-center gap-3">
                    <TabsList className="bg-transparent p-0 h-auto space-x-3">
                      <TabsTrigger
                        value="workout"
                        className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:border data-[state=inactive]:border-border px-6 py-2 rounded-full transition-all duration-300 font-medium text-sm shadow-sm data-[state=active]:shadow-blue-500/20"
                      >
                        <DumbbellIcon className="mr-2 w-4 h-4" />
                        Workout Plan
                      </TabsTrigger>

                      <TabsTrigger
                        value="diet"
                        className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:border data-[state=inactive]:border-border px-6 py-2 rounded-full transition-all duration-300 font-medium text-sm shadow-sm data-[state=active]:shadow-green-600/20"
                      >
                        <AppleIcon className="mr-2 w-4 h-4" />
                        Diet Plan
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Workout Tab Content */}
                  <TabsContent value="workout" className="space-y-4">
                    {/* Workout Schedule Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/20 rounded-md">
                          <CalendarIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">Weekly Schedule</h4>
                          <span className="font-mono text-xs text-muted-foreground">
                            {currentPlan.workoutPlan.schedule.join(" • ")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold text-blue-500">
                          {currentPlan.workoutPlan.exercises.length}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground uppercase">Days</div>
                      </div>
                    </div>

                    {/* Exercise Days */}
                    <Accordion type="multiple" className="space-y-3">
                      {currentPlan.workoutPlan.exercises.map((exerciseDay, index) => {
                        const isToday = exerciseDay.day === currentDay;
                        return (
                          <AccordionItem
                            key={index}
                            value={exerciseDay.day}
                            className={`border rounded-lg overflow-hidden shadow-sm transition-all duration-300 ${
                              isToday
                                ? "border-blue-500 bg-gradient-to-r from-blue-500/10 to-blue-500/5 shadow-blue-500/10"
                                : "border-border/50 bg-gradient-to-r from-background/80 to-background/40"
                            }`}
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-500/5 transition-all duration-300">
                              <div className="flex justify-between w-full items-center">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-bold text-sm ${
                                    isToday 
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm" 
                                      : "bg-gradient-to-br from-primary to-primary/70"
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div className="text-left">
                                    <div className={`text-sm font-bold flex items-center gap-2 ${
                                      isToday ? "text-blue-600" : "text-foreground"
                                    }`}>
                                      {exerciseDay.day}
                                      {isToday && (
                                        <div className="flex items-center gap-1 bg-blue-500/20 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                          <ClockIcon className="w-2 h-2" />
                                          TODAY
                                        </div>
                                      )}
                                    </div>
                                    {isToday && (
                                      <div className="text-xs text-blue-500 font-medium">Ready to workout!</div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="text-center">
                                    <div className={`text-xs font-bold ${isToday ? "text-blue-600" : "text-primary"}`}>
                                      {exerciseDay.routines.length}
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase">Exercises</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-xs font-bold text-green-500">
                                      ~{exerciseDay.routines.reduce((acc, routine) => acc + parseInt(routine.sets), 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase">Sets</div>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>

                            <AccordionContent className="pb-4 px-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                {exerciseDay.routines.map((routine, routineIndex) => (
                                  <div
                                    key={routineIndex}
                                    className={`p-3 rounded-lg shadow-sm transition-all duration-300 border ${
                                      isToday
                                        ? "bg-gradient-to-br from-blue-50/90 to-blue-50/60 border-blue-500/20"
                                        : "bg-gradient-to-br from-background/90 to-background/60 border-border/50"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-foreground text-sm">{routine.name}</h5>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${
                                        isToday 
                                          ? "bg-blue-500/20 border-blue-500/30" 
                                          : "bg-primary/20 border-primary/30"
                                      }`}>
                                        <DumbbellIcon className={`w-3 h-3 ${isToday ? "text-blue-600" : "text-primary"}`} />
                                        <span className={`font-bold ${isToday ? "text-blue-600" : "text-primary"}`}>
                                          {routine.sets} Sets
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/20 border border-green-500/30 text-xs">
                                        <TargetIcon className="w-3 h-3 text-green-600" />
                                        <span className="font-bold text-green-600">{routine.reps} Reps</span>
                                      </div>
                                    </div>
                                    
                                    {routine.description && (
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {routine.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </TabsContent>

                  {/* Diet Tab Content */}
                  <TabsContent value="diet" className="space-y-4">
                    {/* Calorie Target Header */}
                    <div className="p-4 bg-gradient-to-r from-green-600/10 to-green-600/5 rounded-lg border border-green-600/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-600/20 rounded-md">
                            <FlameIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Daily Calorie Target</h4>
                            <p className="text-xs text-muted-foreground">Your personalized nutrition goal</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-mono text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                            {currentPlan.dietPlan.dailyCalories}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground uppercase">Calories</div>
                        </div>
                      </div>
                    </div>

                    {/* Meal Plans */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {currentPlan.dietPlan.meals.map((meal, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gradient-to-br from-background/90 to-background/60 border border-border/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {/* Meal Header */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-600 to-green-500 animate-pulse"></div>
                            <h4 className="text-sm font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                              {meal.name}
                            </h4>
                          </div>
                          
                          {/* Food Items */}
                          <div className="space-y-2">
                            {meal.foods.map((food, foodIndex) => (
                              <div
                                key={foodIndex}
                                className="flex items-center gap-2 p-2 bg-background/50 rounded-md border border-border/30 hover:border-green-600/30 transition-colors duration-200"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-green-500 rounded-md flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    {String(foodIndex + 1).padStart(2, "0")}
                                  </span>
                                </div>
                                <span className="text-xs text-foreground font-medium flex-1">
                                  {food}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      ) : allPlans === undefined ? (
        // Enhanced loading state
        <div className="relative backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/40 border border-border/50 rounded-xl p-6">
          <CornerElements />
          <div className="flex flex-col items-center justify-center h-24 space-y-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary"></div>
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
            </div>
            <span className="text-muted-foreground font-mono text-sm">Loading fitness plans...</span>
          </div>
        </div>
      ) : (
        <NoFitnessPlan />
      )}
    </section>
  );
};

export default ProfilePage;
