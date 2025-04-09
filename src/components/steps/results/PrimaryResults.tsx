
import React from "react";
import FinancialOverview from "./FinancialOverview";
import FinancialBreakdown from "./FinancialBreakdown";
import MortgageSummary from "./MortgageSummary";
import LoadingResults from "./LoadingResults";
import { UserData } from "@/context/MortgageContext";

interface PrimaryResultsProps {
  userData: UserData;
  isCalculating: boolean;
  onRecalculate: () => void;
}

const PrimaryResults: React.FC<PrimaryResultsProps> = ({
  userData,
  isCalculating,
  onRecalculate
}) => {
  const { results, financials, loanDetails } = userData;
  
  if (!results.maxHomePrice) {
    return <LoadingResults isCalculating={isCalculating} onRecalculate={onRecalculate} />;
  }
  
  return (
    <>
      <FinancialOverview 
        maxHomePrice={results.maxHomePrice} 
        monthlyPayment={results.monthlyPayment} 
      />
      
      {results.financialDetails && (
        <FinancialBreakdown 
          financialDetails={results.financialDetails} 
          monthlyDebts={financials.monthlyDebts}
          maxHomePrice={results.maxHomePrice}
          ltv={loanDetails.ltv}
        />
      )}
      
      <MortgageSummary 
        loanDetails={loanDetails} 
        maxHomePrice={results.maxHomePrice} 
      />
    </>
  );
};

export default PrimaryResults;
