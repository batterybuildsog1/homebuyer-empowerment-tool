
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useLoanData } from "@/hooks/useLoanData";
import LoanDetailsForm from "./loan-details/LoanDetailsForm";
import LoadingIndicator from "./loan-details/LoadingIndicator";
import DataFetchingManager from "./loan-details/DataFetchingManager";
import BorrowingPowerChart from "./financial/BorrowingPowerChart";
import { useMortgage } from "@/context/MortgageContext";
import { useFinancialForm } from "@/hooks/financial/useFinancialForm";

const LoanDetailsStep: React.FC = () => {
  const [isDataReady, setIsDataReady] = useState(false);
  const { fetchProgress, formData } = useLoanData();
  const { userData, updateLoanDetails } = useMortgage();
  const { convertDebtItemsToLegacy } = useFinancialForm();
  
  // Check if we have all necessary data to proceed
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

  // Update interest rate in context whenever it changes
  useEffect(() => {
    if (isDataReady) {
      const interestRate = formData.loanType === 'conventional' 
        ? formData.conventionalInterestRate 
        : formData.fhaInterestRate;
      
      if (interestRate !== null && interestRate !== userData.loanDetails.interestRate) {
        updateLoanDetails({ 
          interestRate,
          propertyTax: formData.propertyTax,
          propertyInsurance: formData.propertyInsurance
        });
      }
    }
  }, [formData, isDataReady, userData.loanDetails.interestRate, updateLoanDetails]);

  // Check if we have cached data
  const cachedDataExists = Boolean(localStorage.getItem("cached_loan_data"));
  
  // Convert DebtItem[] to DebtItems format for the BorrowingPowerChart component
  const debtItemsLegacy = convertDebtItemsToLegacy(userData.financials.debtItems || []);
  
  return (
    <Card className="w-full mx-auto">
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
            message={fetchProgress.message || 'Loading...'}
            progress={fetchProgress.progress || 0}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <LoanDetailsForm 
                isDataReady={isDataReady}
                setIsDataReady={setIsDataReady}
                checkDataReadiness={checkDataReadiness}
              />
            </div>
            <div>
              <BorrowingPowerChart 
                annualIncome={userData.financials.annualIncome}
                ficoScore={userData.financials.ficoScore}
                debtItems={debtItemsLegacy}
                selectedFactors={userData.financials.selectedFactors || {}}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanDetailsStep;
