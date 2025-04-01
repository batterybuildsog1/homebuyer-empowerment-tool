
import { useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import PerplexityApiForm from "./PerplexityApiForm";
import LocationStep from "./steps/LocationStep";
import FinancialStep from "./steps/FinancialStep";
import LoanDetailsStep from "./steps/LoanDetailsStep";
import ResultsStep from "./steps/ResultsStep";
import GoalSettingStep from "./steps/GoalSettingStep";
import { Heading } from "./ui/Heading";

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
    } else if (currentStep === 3 && (!userData.loanDetails.interestRate || !userData.loanDetails.propertyTax)) {
      setCurrentStep(2);
    } else if (currentStep === 4 && !userData.results.maxHomePrice) {
      setCurrentStep(3);
    }
  }, [currentStep, userData]);

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
  };

  // Render API key form if no API key is found
  if (!apiKey) {
    return <PerplexityApiForm onApiKeySet={handleApiKeySet} />;
  }

  // Map step components with their titles
  const steps = [
    { component: <LocationStep />, title: "Your Location" },
    { component: <FinancialStep />, title: "Financial Information" },
    { component: <LoanDetailsStep apiKey={apiKey} />, title: "Loan Details" },
    { component: <ResultsStep />, title: "Results" },
    { component: <GoalSettingStep />, title: "Goal Setting" },
  ];

  return (
    <div className="container py-8 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center space-y-2">
          <Heading as="h1" size="3xl">Homebuyer Empowerment Tool</Heading>
          <p className="text-muted-foreground text-lg">
            Calculate how much home you can afford and create a roadmap to homeownership
          </p>
        </div>
        
        <div className="pb-8">
          <div className="flex items-center justify-center mb-8">
            <ol className="flex items-center w-full max-w-3xl">
              {steps.map((step, index) => (
                <li key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep === index 
                      ? "bg-primary text-primary-foreground" 
                      : currentStep > index 
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-gray-200 text-muted-foreground"
                  }`}>
                    <span>{index + 1}</span>
                  </div>
                  <div 
                    className={`hidden sm:flex items-center w-full ${
                      index === steps.length - 1 ? 'hidden' : ''
                    }`}
                  >
                    <div className={`w-full h-1 ${
                      currentStep > index 
                        ? "bg-primary" 
                        : "bg-gray-200"
                    }`}></div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="py-4">
            {steps[currentStep].component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
