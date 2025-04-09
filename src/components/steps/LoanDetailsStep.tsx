
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { FileText, ArrowLeft } from "lucide-react";
import { useLoanData } from "@/hooks/useLoanData";
import LoanTypeSelector from "./loan-details/LoanTypeSelector";
import DownPaymentSlider from "./loan-details/DownPaymentSlider";
import DataSummary from "./loan-details/DataSummary";
import LoadingIndicator from "./loan-details/LoadingIndicator";

const LoanDetailsStep: React.FC = () => {
  const { userData, updateLoanDetails, setCurrentStep } = useMortgage();
  
  const {
    formData,
    fetchProgress,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData
  } = useLoanData();

  // Check if data was already fetched in the previous step
  useEffect(() => {
    if (userData.loanDetails.conventionalInterestRate || userData.loanDetails.fhaInterestRate) {
      // Pre-populate formData with values from userData if they exist
      handleLoanTypeChange(userData.loanDetails.loanType || 'conventional');
    }
  }, [userData.loanDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If any required data hasn't been fetched yet (or needs refresh), fetch it first
    if (!formData.conventionalInterestRate || !formData.fhaInterestRate || 
        !formData.propertyTax || !formData.propertyInsurance) {
      const fetchedData = await fetchExternalData();
      if (fetchedData === null) {
         toast.error("Failed to retrieve necessary data. Cannot proceed.");
         return; // Stop if fetching failed critically
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
            
            {(formData.conventionalInterestRate || formData.fhaInterestRate || 
              formData.propertyTax || formData.propertyInsurance) ? (
              <DataSummary 
                loanType={formData.loanType}
                conventionalInterestRate={formData.conventionalInterestRate}
                fhaInterestRate={formData.fhaInterestRate}
                propertyTax={formData.propertyTax}
                propertyInsurance={formData.propertyInsurance}
                hasAttemptedFetch={fetchProgress.hasAttemptedFetch}
                onFetchData={fetchExternalData}
              />
            ) : (
              <DataSummary 
                loanType={formData.loanType}
                conventionalInterestRate={userData.loanDetails.conventionalInterestRate}
                fhaInterestRate={userData.loanDetails.fhaInterestRate}
                propertyTax={userData.loanDetails.propertyTax}
                propertyInsurance={userData.loanDetails.propertyInsurance}
                hasAttemptedFetch={fetchProgress.hasAttemptedFetch}
                onFetchData={fetchExternalData}
              />
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
