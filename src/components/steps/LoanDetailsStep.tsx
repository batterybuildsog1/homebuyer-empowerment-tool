
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
  
  const checkDataReadiness = useCallback(() => {
    const loanType = formData.loanType;
    
    const hasInterestRate = loanType === 'conventional' 
      ? formData.conventionalInterestRate !== null 
      : formData.fhaInterestRate !== null;
    
    const hasPropertyTax = formData.propertyTax !== null;
    const hasPropertyInsurance = formData.propertyInsurance !== null;
    
    const ready = hasInterestRate && hasPropertyTax && hasPropertyInsurance;
    setIsDataReady(ready);
    
    return ready;
  }, [formData]);

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

  const cachedDataExists = Boolean(localStorage.getItem("cached_loan_data"));
  
  const debtItemsLegacy = convertDebtItemsToLegacy(userData.financials.debtItems || []);

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#8b76e0]" />
          Loan Details
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Select your preferred loan type and down payment amount.
        </CardDescription>
      </CardHeader>
      
      <DataFetchingManager 
        checkDataReadiness={checkDataReadiness}
        cachedDataExists={cachedDataExists}
      />
      
      <CardContent>
        {fetchProgress.isLoading ? (
          <LoadingIndicator 
            message={fetchProgress.message || 'Fetching latest loan data...'}
            progress={fetchProgress.progress || 0}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <LoanDetailsForm 
                isDataReady={isDataReady}
                setIsDataReady={setIsDataReady}
                checkDataReadiness={checkDataReadiness}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-lg pointer-events-none" />
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
