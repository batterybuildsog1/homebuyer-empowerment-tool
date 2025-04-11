import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heading } from "@/components/ui/Heading";
import { Check, ChevronRight, Home, CreditCard, Target } from "lucide-react";
import { toast } from "sonner";

// Step components
import FinancialStep from "@/components/steps/FinancialStep";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      id: "welcome",
      title: "Welcome",
      description: "Let's get started with your financial journey",
      icon: Home
    },
    {
      id: "finance",
      title: "Financial Details",
      description: "Tell us about your income and expenses",
      icon: CreditCard
    },
    {
      id: "goals",
      title: "Your Goals",
      description: "What are you looking to achieve?",
      icon: Target
    }
  ];
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      toast.success("Onboarding complete! Let's check your mortgage planning options.");
      navigate("/mortgage-planning");
    }
  };
  
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Render different content based on the current step
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <Heading as="h2" size="xl" className="mb-2">Welcome to Finance Empowerment</Heading>
              <p className="text-muted-foreground">We'll help you understand your finances and plan for your future home.</p>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-1 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Understand your finances</h3>
                  <p className="text-sm text-muted-foreground">Get insights into your income, expenses, and savings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-1 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Plan for homeownership</h3>
                  <p className="text-sm text-muted-foreground">Discover your buying power and mortgage options</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-1 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Set financial goals</h3>
                  <p className="text-sm text-muted-foreground">Create measurable targets to improve your finances</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "finance":
        return <FinancialStep />;
      
      case "goals":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <Heading as="h2" size="xl" className="mb-2">Set Your Financial Goals</Heading>
              <p className="text-muted-foreground">What would you like to achieve with our help?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Home className="h-10 w-10 text-primary mb-4" />
                    <h3 className="font-medium text-lg">Buy a Home</h3>
                    <p className="text-sm text-muted-foreground mt-2">I want to purchase my first or next home</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CreditCard className="h-10 w-10 text-finance-green mb-4" />
                    <h3 className="font-medium text-lg">Manage Debt</h3>
                    <p className="text-sm text-muted-foreground mt-2">I want to reduce my debts and improve my credit</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <header className="w-full p-4 border-b">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-primary-500 to-finance-purple flex items-center justify-center text-white font-bold">
                FE
              </div>
              <span className="text-sm font-semibold">Finance Empowerment</span>
            </div>
            <div className="text-sm">{currentStep + 1} of {steps.length}</div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              {/* Fixed syntax error - using the appropriate JSX syntax for dynamic component rendering */}
              {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 text-primary" })}
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </div>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {renderStepContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              disabled={currentStep === 0}
            >
              Skip for now
            </Button>
            <Button onClick={handleNextStep}>
              {currentStep < steps.length - 1 ? (
                <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
              ) : (
                <>Complete <Check className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default OnboardingPage;
