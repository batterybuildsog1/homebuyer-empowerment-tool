
import { useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import PerplexityApiForm from "./PerplexityApiForm";
import PerplexityApiFormMock from "./PerplexityApiFormMock";
import LocationStep from "./steps/LocationStep";
import FinancialStep from "./steps/FinancialStep";
import CompensatingFactorsStep from "./steps/CompensatingFactorsStep";
import LoanDetailsStep from "./steps/LoanDetailsStep";
import ResultsStep from "./steps/ResultsStep";
import GoalSettingStep from "./steps/GoalSettingStep";
import { Card, CardContent } from "./ui/card";
import { StepIndicator } from "./ui/StepIndicator";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const MortgageCalculator: React.FC = () => {
  const { currentStep, setCurrentStep, userData } = useMortgage();
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is already in localStorage
    const storedApiKey = localStorage.getItem("perplexity_api_key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Validate step progression
  useEffect(() => {
    if (currentStep === 1 && (!userData.location.city || !userData.location.state)) {
      setCurrentStep(0);
    } else if (currentStep === 2 && !userData.financials.annualIncome) {
      setCurrentStep(1);
    } else if (currentStep === 3 && (!userData.financials.selectedFactors || Object.keys(userData.financials.selectedFactors).length === 0)) {
      setCurrentStep(2);
    } else if (currentStep === 4 && (!userData.loanDetails.interestRate || !userData.loanDetails.propertyTax)) {
      setCurrentStep(3);
    } else if (currentStep === 5 && !userData.results.maxHomePrice) {
      setCurrentStep(4);
    }
  }, [currentStep, userData, setCurrentStep]);

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    localStorage.setItem("perplexity_api_key", key);
  };

  // Map step components with their titles
  const steps = [
    { component: <LocationStep />, title: "Location" },
    { component: <FinancialStep />, title: "Finances" },
    { component: <CompensatingFactorsStep />, title: "Factors" },
    { component: <LoanDetailsStep />, title: "Loan Details" },
    { component: <ResultsStep />, title: "Results" },
    { component: <GoalSettingStep />, title: "Goal Setting" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if we need to show the API form
  if (!apiKey) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <PerplexityApiForm onApiKeySet={handleApiKeySet} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Step Indicators */}
      <div className="relative">
        <div className="grid grid-cols-6 gap-1 md:gap-0">
          {steps.map((step, index) => (
            <StepIndicator 
              key={index}
              step={index}
              currentStep={currentStep}
              label={step.title}
              totalSteps={steps.length}
            />
          ))}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-border -z-10 hidden md:block"></div>
        </div>
      </div>
      
      {/* Step Content */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep].component}
          </motion.div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="gap-2"
        >
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MortgageCalculator;
