import { Button } from "@/components/ui/button"; // Assuming you have this from your other components
import { Zap, Target, TrendingUp,Sparkles } from "lucide-react";
import { motion } from "framer-motion"; // Added framer-motion 
import Link from "next/link";

const UserPrograms = () => {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Workouts",
      description:
        "Smart algorithms create personalized workout plans that evolve with your progress",
    },
    {
      icon: Target,
      title: "Goal-Oriented Training",
      description:
        "Target specific areas and achieve your fitness goals with precision-crafted programs",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Monitor your improvements with detailed analytics and adaptive recommendations",
    },
  ];

  return (
    <>
      {/* "Why Choose FlowAI?" Section */}
      <section className="py-24 px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Flow<span className="text-primary">.AI</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform adapts to your unique fitness goals and
              preferences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card backdrop-blur-md border border-border rounded-lg p-8 hover:border-primary/50 transition-all duration-300 shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CT Section */}
      <section className="py-24 px-8 bg-secondary">
        {" "}
        {/* Used 'bg-secondary' from your theme for the light blue bg */}
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-foreground">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have already discovered the power of
              AI-driven fitness
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-lg shadow-lg"
            >
              <Link href="/generate-program">
              Get Started Now
              <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default UserPrograms;