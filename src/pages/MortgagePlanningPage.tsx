
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/Heading";
import MortgageCalculator from "@/components/MortgageCalculator";
import PageLayout from "@/components/layouts/PageLayout";
import { useMortgage } from "@/context/MortgageContext";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { ROUTES } from "@/utils/routes";
import ScenarioManager from "@/components/scenarios/ScenarioManager";
import { useAutoSaveScenario } from "@/hooks/useAutoSaveScenario";

const MortgagePlanningPage = () => {
  const { isMortgageWorkflowCompleted } = useMortgage();
  const isCompleted = isMortgageWorkflowCompleted();

  // Initialize auto-save functionality
  useAutoSaveScenario();

  const renderCompletedView = () => (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 text-green-600">✓</div>
        </div>
        <Heading as="h2" size="xl" className="text-center mb-4">
          Mortgage Planning Completed
        </Heading>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-center">
          You've successfully completed the mortgage planning workflow. 
          You can save your scenario.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ScenarioManager />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout>
      <Helmet>
        <title>Mortgage Planning | Finance Empowerment Tool</title>
        <meta name="description" content="Plan your mortgage and calculate your buying power" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Heading as="h1" size="2xl" className="mb-2">Mortgage Planning</Heading>
            <p className="text-muted-foreground">
              Calculate your buying power and plan your path to homeownership
            </p>
          </div>
          
          {isCompleted ? renderCompletedView() : <MortgageCalculator />}
        </div>
      </div>
    </PageLayout>
  );
};

export default MortgagePlanningPage;

