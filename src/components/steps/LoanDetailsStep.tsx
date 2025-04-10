
import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useLoanData } from "@/hooks/useLoanData";
import LoanDetailsForm from "./loan-details/LoanDetailsForm";
import LoadingIndicator from "./loan-details/LoadingIndicator";
import DataFetchingManager from "./loan-details/DataFetchingManager";

const LoanDetailsStep: React.FC = () => {
  const [isDataReady, setIsDataReady] = useState(false);
  const { fetchProgress, formData } = useLoanData();
  
  // Function to check if we have all necessary data to proceed
  const checkDataReadiness = useCallback(() => {
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
  }, [formData]);

  // Check if we have cached data
  const cachedDataExists = Boolean(localStorage.getItem("cached_loan_data"));
  
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
      
      {/* Invisible component that manages data loading */}
      <DataFetchingManager 
        checkDataReadiness={checkDataReadiness}
        cachedDataExists={cachedDataExists}
      />
      
      <CardContent>
        {fetchProgress.isLoading ? (
          <LoadingIndicator 
            progress={fetchProgress.progress} 
            message={fetchProgress.message} 
          />
        ) : (
          <LoanDetailsForm 
            isDataReady={isDataReady}
            setIsDataReady={setIsDataReady}
            checkDataReadiness={checkDataReadiness}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default LoanDetailsStep;
