
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMortgage } from "@/context/MortgageContext";
import { Home, ArrowLeft, TrendingUp, ArrowRightCircle, AlertTriangle, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/formatters";
import { validateMortgageData, calculateMortgageResults } from "@/utils/mortgageResultsCalculator";

const ResultsStep: React.FC = () => {
  const { userData, updateResults, setCurrentStep } = useMortgage();
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentTab, setCurrentTab] = useState("primary");
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Memoized calculation function to avoid recreating on every render
  const runCalculations = useCallback(async () => {
    console.log("Running mortgage calculations...");
    setIsCalculating(true);
    
    try {
      // First validate all required data
      const validationError = validateMortgageData(userData);
      
      if (validationError) {
        setValidationError(validationError);
        console.log("Validation failed:", validationError);
        setIsCalculating(false);
        return;
      }
      
      setValidationError(null);
      
      // Calculate mortgage results
      const results = calculateMortgageResults(userData);
      
      if (!results) {
        toast.error("Calculation failed. Please check your inputs.");
        console.error("Calculation returned null results");
        setIsCalculating(false);
        return;
      }
      
      console.log("Calculation completed successfully:", results);
      
      // Update results in context
      updateResults(results);
      toast.success("Mortgage calculation completed!");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("An error occurred during calculation. Please try again.");
      setValidationError("There was a problem with the calculation. Please check your inputs.");
    } finally {
      setIsCalculating(false);
    }
  }, [userData, updateResults]);
  
  // Run calculations when dependent data changes
  useEffect(() => {
    // Only run calculations if we don't have results or if critical values have changed
    const shouldRecalculate = !userData.results.maxHomePrice || 
      !userData.results.monthlyPayment;
      
    if (shouldRecalculate) {
      console.log("Triggering calculation due to missing results or data changes");
      runCalculations();
    }
  // The key dependencies that should trigger a recalculation
  }, [
    userData.financials.annualIncome,
    userData.financials.monthlyDebts,
    userData.financials.ficoScore,
    userData.loanDetails.ltv,
    userData.loanDetails.loanType,
    userData.loanDetails.interestRate,
    userData.loanDetails.propertyTax,
    runCalculations
  ]);
  
  const goToPreviousStep = () => {
    setCurrentStep(2); // Go back to Loan Details step
  };
  
  // Rendering various sections of the results
  const renderFinancialBreakdown = () => {
    if (!userData.results.financialDetails) return null;
    
    const { financialDetails } = userData.results;
    
    return (
      <div className="financial-card">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Financial Breakdown
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b">
            <span>Maximum DTI Used:</span>
            <span className="font-medium">{financialDetails.maxDTI}%</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Monthly Income:</span>
            <span className="font-medium">{formatCurrency(financialDetails.monthlyIncome)}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Maximum Monthly Debt Payment:</span>
            <span className="font-medium">{formatCurrency(financialDetails.maxMonthlyDebtPayment)}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Current Monthly Debts:</span>
            <span className="font-medium">{formatCurrency(userData.financials.monthlyDebts)}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b bg-slate-50 dark:bg-slate-900">
            <span className="font-medium">Available for Mortgage Payment:</span>
            <span className="font-medium text-finance-green">{formatCurrency(financialDetails.availableForMortgage)}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Adjusted Interest Rate:</span>
            <span className="font-medium">{financialDetails.adjustedRate.toFixed(3)}%</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Maximum Loan Amount:</span>
            <span className="font-medium">{formatCurrency(userData.results.maxHomePrice ? userData.results.maxHomePrice * (userData.loanDetails.ltv / 100) : 0)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  const renderMortgageSummary = () => {
    return (
      <div className="financial-card">
        <h3 className="text-lg font-medium mb-3">Mortgage Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b">
            <span>Loan Type:</span>
            <span className="font-medium">{userData.loanDetails.loanType === 'conventional' ? 'Conventional' : 'FHA'}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Down Payment:</span>
            <span className="font-medium">{100 - userData.loanDetails.ltv}% ({formatCurrency(userData.results.maxHomePrice ? userData.results.maxHomePrice * ((100 - userData.loanDetails.ltv) / 100) : null)})</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Loan Amount:</span>
            <span className="font-medium">{formatCurrency(userData.results.maxHomePrice ? userData.results.maxHomePrice * (userData.loanDetails.ltv / 100) : null)}</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Interest Rate:</span>
            <span className="font-medium">{userData.loanDetails.interestRate ? userData.loanDetails.interestRate.toFixed(2) : 'N/A'}%</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Loan Term:</span>
            <span className="font-medium">30 Years</span>
          </div>
          
          <div className="flex justify-between py-1 border-b">
            <span>Property Tax:</span>
            <span className="font-medium">${userData.loanDetails.propertyTax ? ((userData.loanDetails.propertyTax / 100) * (userData.results.maxHomePrice || 0) / 12).toFixed(0) : 'N/A'}/month</span>
          </div>
          
          <div className="flex justify-between py-1">
            <span>Property Insurance:</span>
            <span className="font-medium">${userData.loanDetails.propertyInsurance ? (userData.loanDetails.propertyInsurance / 12).toFixed(0) : 'N/A'}/month</span>
          </div>
          
          {userData.loanDetails.loanType === 'fha' && (
            <div className="flex justify-between py-1 border-t">
              <span>Upfront MIP:</span>
              <span className="font-medium">{formatCurrency(userData.results.maxHomePrice && userData.loanDetails.upfrontMIP ? 
                (userData.results.maxHomePrice * (userData.loanDetails.ltv / 100) * (userData.loanDetails.upfrontMIP / 100)) : null)}
              </span>
            </div>
          )}
          
          {userData.loanDetails.ltv > 80 && (
            <div className="flex justify-between py-1 border-t">
              <span>{userData.loanDetails.loanType === 'fha' ? 'Monthly MIP:' : 'Monthly PMI:'}</span>
              <span className="font-medium">Included in payment</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderImprovementScenarios = () => {
    return (
      <div className="financial-card">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Ways to Increase Your Buying Power
        </h3>
        
        {userData.results.scenarios && userData.results.scenarios.length > 0 ? (
          <div className="space-y-6">
            {userData.results.scenarios.map((scenario, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-finance-blue">
                  {scenario.loanType !== userData.loanDetails.loanType
                    ? `Switch to ${scenario.loanType === 'conventional' ? 'Conventional' : 'FHA'} Loan`
                    : scenario.ficoChange > 0
                    ? `Increase FICO Score by ${scenario.ficoChange} points`
                    : scenario.ltvChange < 0
                    ? `Increase Down Payment to ${100 - (userData.loanDetails.ltv + scenario.ltvChange)}%`
                    : 'Alternative Scenario'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">New Home Price</p>
                    <p className="font-medium">{formatCurrency(scenario.maxHomePrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Monthly Payment</p>
                    <p className="font-medium">{formatCurrency(scenario.monthlyPayment)}</p>
                  </div>
                </div>
                
                <div className="pt-1">
                  <p className="text-sm font-medium flex items-center gap-1">
                    <span className={scenario.maxHomePrice > (userData.results.maxHomePrice || 0) ? "text-finance-green" : "text-destructive"}>
                      {scenario.maxHomePrice > (userData.results.maxHomePrice || 0)
                        ? `+${formatCurrency(scenario.maxHomePrice - (userData.results.maxHomePrice || 0))} buying power`
                        : `${formatCurrency(scenario.maxHomePrice - (userData.results.maxHomePrice || 0))} buying power`}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            
            <div className="text-sm text-muted-foreground pt-2">
              <p>These scenarios are estimates based on current rates and your inputs. Actual loan terms may vary.</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No alternative scenarios available.</p>
        )}
      </div>
    );
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
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Missing Information</AlertTitle>
            <AlertDescription>{validationError}</AlertDescription>
            <div className="mt-4">
              <Button onClick={goToPreviousStep} variant="outline" className="mt-2">
                Go Back to Previous Step
              </Button>
            </div>
          </Alert>
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="primary">Your Results</TabsTrigger>
              <TabsTrigger value="scenarios">Improvement Scenarios</TabsTrigger>
            </TabsList>
            <TabsContent value="primary" className="space-y-6 pt-4">
              {userData.results.maxHomePrice ? (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="financial-card text-center">
                      <h3 className="text-lg font-medium mb-2">Maximum Home Price</h3>
                      <p className="text-3xl font-bold text-finance-blue">
                        {formatCurrency(userData.results.maxHomePrice)}
                      </p>
                    </div>
                    
                    <div className="financial-card text-center">
                      <h3 className="text-lg font-medium mb-2">Monthly Payment</h3>
                      <p className="text-3xl font-bold text-finance-navy">
                        {formatCurrency(userData.results.monthlyPayment)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Financial Analysis Section */}
                  {renderFinancialBreakdown()}
                  
                  {/* Mortgage Summary Section */}
                  {renderMortgageSummary()}
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-lg text-muted-foreground mb-4">Calculating your results...</p>
                  <Button onClick={runCalculations} disabled={isCalculating}>
                    {isCalculating ? "Calculating..." : "Recalculate"}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scenarios" className="pt-4">
              <div className="space-y-6">
                {renderImprovementScenarios()}
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
