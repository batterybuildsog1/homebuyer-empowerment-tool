
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
// Import service functions but NOT fallbackData
import { getInterestRates, getFhaInterestRates, getPropertyTaxRate, getPropertyInsurance } from "@/services/perplexityService";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getFhaMipRates } from "@/utils/mortgageCalculations";
import { Progress } from "@/components/ui/progress";

interface LoanDetailsStepProps {
  // No apiKey prop required anymore
}

interface FetchedData {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
}

const LoanDetailsStep: React.FC<LoanDetailsStepProps> = () => {
  const { userData, updateLoanDetails, setCurrentStep, setIsLoadingData, isLoadingData } = useMortgage();

  // Convert initial LTV to down payment percentage for initial state
  const initialDownPayment = userData.loanDetails.ltv ? 100 - userData.loanDetails.ltv : 20;

  const [formData, setFormData] = useState({
    loanType: userData.loanDetails.loanType || 'conventional',
    downPayment: initialDownPayment, // Store down payment percentage instead of LTV
    conventionalInterestRate: userData.loanDetails.interestRate || null,
    fhaInterestRate: null, // Add separate field for FHA interest rate
    propertyTax: userData.loanDetails.propertyTax || null,
    propertyInsurance: userData.loanDetails.propertyInsurance || null,
    upfrontMIP: userData.loanDetails.upfrontMIP || null,
    ongoingMIP: userData.loanDetails.ongoingMIP || null,
  });
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Calculate LTV from down payment
  const ltv = 100 - formData.downPayment;

  // Get the current interest rate based on loan type
  const currentInterestRate = formData.loanType === 'conventional' 
    ? formData.conventionalInterestRate 
    : formData.fhaInterestRate;

  // Modified to handle API errors without fallback and fetch both interest rates
  const fetchExternalData = async (): Promise<FetchedData | null> => {
    if (!userData.location.state || !userData.location.city || !userData.location.zipCode) {
      toast.error("Location information is incomplete. Please go back and complete it.");
      return null;
    }
    
    setIsLoadingData(true);
    setHasAttemptedFetch(true);
    
    try {
      setLoadingMessage("Fetching current interest rates...");
      setLoadingProgress(10);
      
      // Get conventional interest rate data
      const conventionalInterestRate = await getInterestRates(userData.location.state);

      if (conventionalInterestRate === null) {
        toast.error("Failed to fetch conventional interest rate data. Please try again.");
      }

      setLoadingProgress(25);
      setLoadingMessage("Fetching FHA interest rates...");

      // Get FHA interest rate data
      const fhaInterestRate = await getFhaInterestRates(userData.location.state);

      if (fhaInterestRate === null) {
        toast.error("Failed to fetch FHA interest rate data. Please try again.");
      }

      setLoadingProgress(40);
      setLoadingMessage("Fetching property tax information...");

      // Get property tax data
      const propertyTaxRate = await getPropertyTaxRate(userData.location.state, userData.location.county || userData.location.city);

      if (propertyTaxRate === null) {
        toast.error("Failed to fetch property tax data. Please try again.");
      }

      setLoadingProgress(70);
      setLoadingMessage("Fetching insurance estimates...");

      // Get property insurance data
      const annualInsurance = await getPropertyInsurance(userData.location.state, userData.location.zipCode);

      if (annualInsurance === null) {
        toast.error("Failed to fetch property insurance data. Please try again.");
      }

      setLoadingProgress(100);
      setLoadingMessage("Processing data...");

      // Update local form state immediately for display
      setFormData(prev => ({
        ...prev,
        conventionalInterestRate: conventionalInterestRate,
        fhaInterestRate: fhaInterestRate,
        propertyTax: propertyTaxRate,
        propertyInsurance: annualInsurance,
      }));

      // If it's an FHA loan, calculate MIP
      if (formData.loanType === 'fha') {
        const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(
          1000, // Placeholder loan amount, will be calculated based on actual home price later
          ltv // Use calculated LTV here
        );
        setFormData(prev => ({
          ...prev,
          upfrontMIP: upfrontMipPercent,
          ongoingMIP: annualMipPercent,
        }));
      }

      // Only show success if we got all necessary data
      if (conventionalInterestRate !== null && fhaInterestRate !== null && 
          propertyTaxRate !== null && annualInsurance !== null) {
        toast.success("Successfully processed mortgage data!");
      } else {
        toast.warning("Some data could not be fetched. Please try again.");
      }
      
      // Return the fetched data (which may include nulls)
      return {
        conventionalInterestRate,
        fhaInterestRate,
        propertyTax: propertyTaxRate,
        propertyInsurance: annualInsurance,
      };

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while fetching data. Please check console and try again.");
      return null; // Return null on error
    } finally {
      setIsLoadingData(false);
    }
  };
  
  useEffect(() => {
    if (formData.loanType === 'fha') {
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(
        1000, // Placeholder loan amount
        ltv // Use calculated LTV
      );
      
      setFormData(prev => ({
        ...prev,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
    } else {
      // For conventional loans, clear MIP values
      setFormData(prev => ({
        ...prev,
        upfrontMIP: null,
        ongoingMIP: null,
      }));
    }
  }, [formData.loanType, ltv]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let fetchedData: FetchedData | null = null;

    // If any required data hasn't been fetched yet (or needs refresh), fetch it first
    if (!formData.conventionalInterestRate || !formData.fhaInterestRate || 
        !formData.propertyTax || !formData.propertyInsurance) {
      fetchedData = await fetchExternalData();
      if (fetchedData === null) {
         toast.error("Failed to retrieve necessary data. Cannot proceed.");
         return; // Stop if fetching failed critically
      }
    }

    // Determine which interest rate to use based on the selected loan type
    const interestRate = formData.loanType === 'conventional' 
      ? (fetchedData?.conventionalInterestRate ?? formData.conventionalInterestRate)
      : (fetchedData?.fhaInterestRate ?? formData.fhaInterestRate);

    // Construct the final loan details object
    const finalLoanDetails = {
      ...formData, // Includes loanType, downPayment, potentially MIP from state
      ltv: ltv, // Add calculated LTV
      // Store the correct interest rate based on loan type
      interestRate: interestRate,
      // Store both rates for future reference
      conventionalInterestRate: fetchedData?.conventionalInterestRate ?? formData.conventionalInterestRate,
      fhaInterestRate: fetchedData?.fhaInterestRate ?? formData.fhaInterestRate,
      propertyTax: fetchedData?.propertyTax ?? formData.propertyTax,
      propertyInsurance: fetchedData?.propertyInsurance ?? formData.propertyInsurance,
    };

    // Validate essential data before proceeding
    if (interestRate === null || finalLoanDetails.propertyTax === null || finalLoanDetails.propertyInsurance === null) {
        toast.error("Missing essential rate/tax/insurance data. Cannot calculate results.");
        return;
    }

    // Save the complete, validated form data to context
    updateLoanDetails(finalLoanDetails);
    setCurrentStep(3); // Navigate to the next step (Results)
  };

  // Helper function to format interest rates with two decimal places
  const formatInterestRate = (rate: number | null): string => {
    if (rate === null) return "N/A";
    return rate.toFixed(2) + "%";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Loan Details
        </CardTitle>
        <CardDescription>
          Select your preferred loan type and down payment amount.
        </CardDescription>
      </CardHeader>
      
      {isLoadingData ? (
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center font-medium">{loadingMessage}</p>
          <Progress value={loadingProgress} className="w-full" />
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Loan Type</Label>
              <RadioGroup
                value={formData.loanType}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  loanType: value as 'conventional' | 'fha' 
                })}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="conventional" 
                    id="conventional" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="conventional"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="font-semibold">Conventional</span>
                    <span className="text-sm text-muted-foreground">3-20% Down</span>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="fha" 
                    id="fha" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="fha"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="font-semibold">FHA</span>
                    <span className="text-sm text-muted-foreground">3.5-10% Down</span>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="text-sm pt-2">
                <p className="font-medium">Selected Option Features:</p>
                {formData.loanType === 'conventional' ? (
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1 pt-1">
                    <li>Typically requires higher credit scores (620+)</li>
                    <li>No upfront mortgage insurance</li>
                    <li>PMI can be removed at 80% LTV</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-5 text-muted-foreground space-y-1 pt-1">
                    <li>More flexible credit requirements (580+)</li>
                    <li>Upfront mortgage insurance premium (MIP): {formData.upfrontMIP}%</li>
                    <li>Annual MIP: {formData.ongoingMIP}% (for the life of the loan)</li>
                  </ul>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label htmlFor="downPayment">Down Payment: {formData.downPayment}%</Label>
                <span className="text-sm font-medium">
                  LTV: {ltv}%
                </span>
              </div>
              <Slider
                id="downPayment"
                min={formData.loanType === 'conventional' ? 3 : 3.5}
                max={formData.loanType === 'conventional' ? 20 : 10}
                step={0.5}
                value={[formData.downPayment]}
                onValueChange={(value) => setFormData({ ...formData, downPayment: value[0] })}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Min: {formData.loanType === 'conventional' ? '3%' : '3.5%'}</span>
                <span>Max: {formData.loanType === 'conventional' ? '20%' : '10%'}</span>
              </div>
            </div>
            
            {(currentInterestRate || formData.propertyTax || formData.propertyInsurance) && (
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Data Summary</h3>
                
                {currentInterestRate && (
                  <div className="flex justify-between text-sm">
                    <span>Base Interest Rate ({formData.loanType === 'conventional' ? 'Conventional' : 'FHA'}):</span>
                    <span className="font-medium">{formatInterestRate(currentInterestRate)}</span>
                  </div>
                )}
                
                {formData.propertyTax && (
                  <div className="flex justify-between text-sm">
                    <span>Property Tax Rate:</span>
                    <span className="font-medium">{formData.propertyTax.toFixed(2)}%</span>
                  </div>
                )}
                
                {formData.propertyInsurance && (
                  <div className="flex justify-between text-sm">
                    <span>Annual Insurance Estimate:</span>
                    <span className="font-medium">${formData.propertyInsurance.toLocaleString()}</span>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={fetchExternalData}
                >
                  {hasAttemptedFetch ? "Retry Data Fetch" : "Fetch Data"}
                </Button>
              </div>
            )}
            
            {!currentInterestRate && !formData.propertyTax && !formData.propertyInsurance && !isLoadingData && (
              <div className="text-center py-4">
                <p className="mb-3 text-muted-foreground">No data fetched yet. Please fetch current rates and tax data.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchExternalData}
                >
                  Fetch Current Data
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button 
              type="submit" 
              disabled={!currentInterestRate || !formData.propertyTax || !formData.propertyInsurance}
            >
              Continue
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default LoanDetailsStep;
