
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Home, Target, ShieldCheck } from "lucide-react";
import { Heading } from "@/components/ui/Heading";
import { useMortgage } from "@/context/MortgageContext";

const WelcomeStep = () => {
  const { setCurrentStep } = useMortgage();

  const features = [
    {
      icon: Home,
      title: "Understand your buying power",
      description: "Get insights into how much home you can afford"
    },
    {
      icon: Target,
      title: "Set clear goals",
      description: "Create a roadmap to homeownership"
    },
    {
      icon: ShieldCheck,
      title: "Improve your chances",
      description: "Learn about factors that can help your approval"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Center aligned welcome content */}
      <div className="text-center">
        <Heading as="h2" size="2xl" className="mb-4">
          Let's Find Your Dream Home
        </Heading>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
          We'll guide you through understanding your finances and planning for your future home.
        </p>
      </div>
      
      {/* Feature list */}
      <div className="max-w-md mx-auto space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-primary/10 p-2 rounded-full">
                <Check className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-lg">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={() => setCurrentStep(1)} 
          size="lg"
          className="gap-2"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
