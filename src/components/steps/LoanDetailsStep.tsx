
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { useLoanData } from "@/hooks/useLoanData";
import LoanTypeSelector from "./loan-details/LoanTypeSelector";
import DownPaymentSlider from "./loan-details/DownPaymentSlider";
import DataSummary from "./loan-details/DataSummary";
import LoadingIndicator from "./loan-details/LoadingIndicator";

const LoanDetailsStep: React.FC = () => {
  const { userData, updateLoanDetails, setCurrentStep } = useMortgage();
  const [isDataReady, setIsDataReady] = useState(false);
  
  const {
    formData,
    fetchProgress,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData
  } = useLoanData();

  // Check for required data on component mount and form changes
  useEffect(() => {
    checkDataReadiness();
  }, [formData, userData.loanDetails]); 

  // Function to check if we have all necessary data to proceed
  const checkDataReadiness = () => {
    const loanType = formData.loanType;
    
    // Check if we have the required interest rate based on loan type
    const hasInterestRate = loanType === 'conventional' 
      ? formData.conventionalInterestRate !== null 
      : formData.fhaInterestRate !== null;
    
    // Check for other required data
    const hasPropertyTax = formData.propertyTax !== null;
    const hasPropertyInsurance = formData.propertyInsurance !== null;
    
    // All required data must be present
    const ready = hasInterestRate && hasPropertyTax && hasPropertyInsurance;
    setIsDataReady(ready);
    
    return ready;
  };

  // Check for cached data on component mount
  useEffect(() => {
    // Check if we need to load data from localStorage
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        
        // Check if we have valid data in the cache
        const hasValidData = parsedData.conventionalInterestRate !== null || 
                            parsedData.fhaInterestRate !== null || 
                            parsedData.propertyTax !== null || 
                            parsedData.propertyInsurance !== null;
        
        // If we have cached data but it's not in userData yet, update it
        if (hasValidData && 
            !userData.loanDetails.conventionalInterestRate && 
            !userData.loanDetails.fhaInterestRate) {
          console.log("Loading cached loan data into context", parsedData);
          updateLoanDetails(parsedData);
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
      }
    }
  }, [updateLoanDetails, userData.loanDetails]);

  // Pre-populate form with values from userData
  useEffect(() => {
    // If loan type is set in userData, use it
    if (userData.loanDetails.loanType) {
      handleLoanTypeChange(userData.loanDetails.loanType);
    }
  }, [userData.loanDetails.loanType, handleLoanTypeChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have the necessary data
    if (!checkDataReadiness()) {
      // Try to fetch data if missing
      toast.info("Fetching missing data before proceeding...");
      const fetchedData = await fetchExternalData();
      
      if (fetchedData === null || !checkDataReadiness()) {
         toast.error("Failed to retrieve necessary data. Cannot proceed.");
         return;
      }
    }

    // Determine which interest rate to use based on the selected loan type
    const interestRate = formData.loanType === 'conventional' 
      ? formData.conventionalInterestRate
      : formData.fhaInterestRate;

    // Construct the final loan details object
    const finalLoanDetails = {
      ...formData,
      ltv,
      interestRate,
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

  // Determine if we should show previously cached data or current form data
  const dataToDisplay = {
    loanType: formData.loanType,
    conventionalInterestRate: formData.conventionalInterestRate,
    fhaInterestRate: formData.fhaInterestRate,
    propertyTax: formData.propertyTax,
    propertyInsurance: formData.propertyInsurance
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
      
      {fetchProgress.isLoading ? (
        <CardContent>
          <LoadingIndicator 
            progress={fetchProgress.progress} 
            message={fetchProgress.message} 
          />
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <LoanTypeSelector 
              loanType={formData.loanType}
              upfrontMIP={formData.upfrontMIP}
              ongoingMIP={formData.ongoingMIP}
              onLoanTypeChange={handleLoanTypeChange}
            />
            
            <DownPaymentSlider 
              downPayment={formData.downPayment}
              loanType={formData.loanType}
              ltv={ltv}
              onDownPaymentChange={handleDownPaymentChange}
            />
            
            <DataSummary 
              loanType={dataToDisplay.loanType}
              conventionalInterestRate={dataToDisplay.conventionalInterestRate}
              fhaInterestRate={dataToDisplay.fhaInterestRate}
              propertyTax={dataToDisplay.propertyTax}
              propertyInsurance={dataToDisplay.propertyInsurance}
              hasAttemptedFetch={fetchProgress.hasAttemptedFetch}
              onFetchData={fetchExternalData}
            />
            
            {!isDataReady && !fetchProgress.isLoading && (
              <div className="text-center text-amber-500 flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <p>Waiting for data. Please ensure you've entered your location and income.</p>
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
              disabled={!isDataReady}
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
