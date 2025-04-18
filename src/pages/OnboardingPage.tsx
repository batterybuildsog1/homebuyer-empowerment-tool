
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heading } from "@/components/ui/Heading";
import { Check, ChevronRight, Home, CreditCard, Target, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { MortgageProvider } from "@/context/MortgageContext";

// Step components
import FinancialStep from "@/components/steps/FinancialStep";
import CompensatingFactorsStep from "@/components/steps/CompensatingFactorsStep";

const OnboardingSteps = () => {
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
      id: "factors",
      title: "Compensating Factors",
      description: "Factors that may improve your mortgage eligibility",
      icon: ShieldCheck
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
          <div className="space-y-8">
            {/* Center aligned welcome content */}
            <div className="text-center">
              {/* Improved icon styling with gradient background */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-finance-purple rounded-full flex items-center justify-center mb-6">
                <Home className="h-10 w-10 text-white" />
              </div>
              <Heading as="h2" size="2xl" className="mb-4">Welcome to Finance Empowerment</Heading>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                We'll help you understand your finances and plan for your future home.
              </p>
            </div>
            
            {/* Feature list with improved styling */}
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Understand your finances</h3>
                  <p className="text-muted-foreground">Get insights into your income, expenses, and savings</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Plan for homeownership</h3>
                  <p className="text-muted-foreground">Discover your buying power and mortgage options</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">Set financial goals</h3>
                  <p className="text-muted-foreground">Create measurable targets to improve your finances</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "finance":
        return <FinancialStep />;
      
      case "factors":
        return <CompensatingFactorsStep />;
      
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
      
      {/* Main content with improved card styling */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl shadow-md border-primary/10">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              {React.createElement(steps[currentStep].icon, { className: "h-5 w-5 text-primary" })}
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </div>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            {renderStepContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between py-4 border-t bg-muted/20">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              disabled={currentStep === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
            <Button onClick={handleNextStep} className="gap-1 px-6">
              {currentStep < steps.length - 1 ? (
                <>Next <ChevronRight className="h-4 w-4" /></>
              ) : (
                <>Complete <Check className="h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

// Wrap the OnboardingSteps component with MortgageProvider
const OnboardingPage = () => {
  return (
    <MortgageProvider>
      <OnboardingSteps />
    </MortgageProvider>
  );
};

export default OnboardingPage;
