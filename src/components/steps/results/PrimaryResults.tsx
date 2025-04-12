
import React, { useEffect } from "react";
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
  
  // Force recalculation if results seem inconsistent
  useEffect(() => {
    // Check if we need to force a recalculation (inconsistent or missing data)
    const needsRecalculation = !results.maxHomePrice || 
                             !results.monthlyPayment ||
                             !results.financialDetails;
    
    if (needsRecalculation && !isCalculating) {
      console.log("Forcing recalculation due to missing or inconsistent data");
      onRecalculate();
    }
  }, [results, isCalculating, onRecalculate]);
  
  if (isCalculating || !results.maxHomePrice || !results.financialDetails) {
    return <LoadingResults isCalculating={isCalculating} onRecalculate={onRecalculate} />;
  }
  
  return (
    <div className="space-y-6">
      <FinancialOverview 
        maxHomePrice={results.maxHomePrice} 
        monthlyPayment={results.monthlyPayment}
        financialDetails={results.financialDetails}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <MortgageSummary 
            loanDetails={loanDetails} 
            maxHomePrice={results.maxHomePrice} 
          />
        </div>
        
        <div>
          {results.financialDetails && (
            <FinancialBreakdown 
              financialDetails={results.financialDetails} 
              monthlyDebts={financials.monthlyDebts}
              maxHomePrice={results.maxHomePrice}
              ltv={loanDetails.ltv}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrimaryResults;
