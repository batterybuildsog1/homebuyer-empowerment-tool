
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMortgage } from "@/context/MortgageContext";
import { Home, ArrowLeft, ArrowRightCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResultsCalculation } from "@/hooks/useResultsCalculation";
import ValidationError from "./results/ValidationError";
import PrimaryResults from "./results/PrimaryResults";
import ImprovementScenarios from "./results/ImprovementScenarios";

const ResultsStep: React.FC = () => {
  const { userData, setCurrentStep } = useMortgage();
  const [currentTab, setCurrentTab] = useState("primary");
  const { isCalculating, validationError, runCalculations } = useResultsCalculation();
  
  const goToPreviousStep = () => {
    setCurrentStep(2); // Go back to Loan Details step
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="primary">Your Results</TabsTrigger>
              <TabsTrigger value="scenarios">Improvement Scenarios</TabsTrigger>
            </TabsList>
            <TabsContent value="primary" className="space-y-6 pt-4">
              <PrimaryResults 
                userData={userData} 
                isCalculating={isCalculating} 
                onRecalculate={runCalculations} 
              />
            </TabsContent>
            
            <TabsContent value="scenarios" className="pt-4">
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
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {!validationError && (
          <Button 
            onClick={() => setCurrentStep(4)}
            className="flex items-center gap-1"
          >
            Goal Setting <ArrowRightCircle className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ResultsStep;
