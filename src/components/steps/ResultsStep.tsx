
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMortgage } from "@/context/MortgageContext";
import { Home, ArrowLeft, ArrowRightCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResultsCalculation } from "@/hooks/useResultsCalculation";
import ValidationError from "./results/ValidationError";
import PrimaryResults from "./results/PrimaryResults";
import ImprovementScenarios from "./results/ImprovementScenarios";
import { toast } from "sonner";

const ResultsStep: React.FC = () => {
  const { userData, setCurrentStep } = useMortgage();
  const [currentTab, setCurrentTab] = useState("primary");
  const { isCalculating, validationError, runCalculations } = useResultsCalculation();
  
  // Force an initial calculation when the component mounts
  useEffect(() => {
    if (!userData.results.maxHomePrice || !userData.results.monthlyPayment) {
      console.log("Initial calculation on component mount");
      runCalculations();
    }
  }, [runCalculations, userData.results]);
  
  const goToPreviousStep = () => {
    setCurrentStep(2); // Go back to Loan Details step
  };

  const handleRecalculate = () => {
    toast.info("Recalculating mortgage results...");
    runCalculations();
  };
  
  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Your Mortgage Results
        </CardTitle>
        <CardDescription>
          Based on your inputs, here's what you can afford.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationError ? (
          <ValidationError errorMessage={validationError} onGoBack={goToPreviousStep} />
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="primary">Your Results</TabsTrigger>
              <TabsTrigger value="scenarios">Improvement Scenarios</TabsTrigger>
            </TabsList>
            <TabsContent value="primary" className="space-y-6">
              <PrimaryResults 
                userData={userData} 
                isCalculating={isCalculating} 
                onRecalculate={handleRecalculate} 
              />
            </TabsContent>
            
            <TabsContent value="scenarios">
              <div className="space-y-6">
                <ImprovementScenarios 
                  scenarios={userData.results.scenarios} 
                  maxHomePrice={userData.results.maxHomePrice} 
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={goToPreviousStep}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {!validationError && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRecalculate}
              className="flex items-center gap-1"
              disabled={isCalculating}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isCalculating ? 'animate-spin' : ''}`} /> 
              Recalculate
            </Button>
            <Button 
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-1"
            >
              Goal Setting <ArrowRightCircle className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResultsStep;
