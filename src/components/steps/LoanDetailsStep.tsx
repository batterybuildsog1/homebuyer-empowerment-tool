
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

  // Check for cached data on component mount
  useEffect(() => {
    // Check if we need to load data from localStorage
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        
        // If we have cached data but it's not in userData yet, update it
        if (!userData.loanDetails.conventionalInterestRate && 
            !userData.loanDetails.fhaInterestRate &&
            parsedData.conventionalInterestRate && 
            parsedData.fhaInterestRate) {
          console.log("Loading cached loan data into context", parsedData);
          updateLoanDetails(parsedData);
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
      }
    }
  }, [updateLoanDetails, userData.loanDetails]);

  // Pre-populate form with values from userData or cached values
  useEffect(() => {
    if (userData.loanDetails.conventionalInterestRate || userData.loanDetails.fhaInterestRate) {
      // Pre-populate formData with values from userData if they exist
      handleLoanTypeChange(userData.loanDetails.loanType || 'conventional');
    }
  }, [userData.loanDetails, handleLoanTypeChange]);

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

  // Determine if we should show previously cached data or current form data
  const dataToDisplay = (formData.conventionalInterestRate || formData.fhaInterestRate || 
    formData.propertyTax || formData.propertyInsurance) ? formData : userData.loanDetails;
    
  // Determine if button should be enabled - if we have the necessary data in either formData or userData
  const hasNecessaryData = (formData.loanType === 'conventional' ? formData.conventionalInterestRate : formData.fhaInterestRate) !== null &&
                          formData.propertyTax !== null && 
                          formData.propertyInsurance !== null;
                          
  const hasUserData = (userData.loanDetails.loanType === 'conventional' ? userData.loanDetails.conventionalInterestRate : userData.loanDetails.fhaInterestRate) !== null &&
                     userData.loanDetails.propertyTax !== null && 
                     userData.loanDetails.propertyInsurance !== null;

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
              disabled={!hasNecessaryData && !hasUserData}
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
