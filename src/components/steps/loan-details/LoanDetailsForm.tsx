
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useMortgage } from "@/context/MortgageContext";
import { useLoanData } from "@/hooks/useLoanData";
import LoanTypeSelector from "./LoanTypeSelector";
import DownPaymentSlider from "./DownPaymentSlider";
import DataSummary from "./DataSummary";

interface LoanDetailsFormProps {
  isDataReady: boolean;
  setIsDataReady: (ready: boolean) => void;
  checkDataReadiness: () => boolean;
}

const LoanDetailsForm: React.FC<LoanDetailsFormProps> = ({ 
  isDataReady, 
  setIsDataReady,
  checkDataReadiness
}) => {
  const { userData, updateLoanDetails, setCurrentStep } = useMortgage();
  
  const {
    formData,
    fetchProgress,
    ltv,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData
  } = useLoanData();

  // Update data readiness when formData changes
  useEffect(() => {
    const isReady = checkDataReadiness();
    setIsDataReady(isReady);
  }, [formData, userData.loanDetails, checkDataReadiness, setIsDataReady]);

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
    setCurrentStep(4); // Navigate to the next step (Results)
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
    <div className="space-y-6">
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
      
      <div className="flex justify-between mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep(2)}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={!isDataReady}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default LoanDetailsForm;
