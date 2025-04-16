
import React, { useEffect } from "react";
import FinancialOverview from "./FinancialOverview";
import FinancialBreakdown from "./FinancialBreakdown";
import MortgageSummary from "./MortgageSummary";
import LoadingResults from "./LoadingResults";
import { UserData } from "@/context/MortgageContext";
import DTIWarningTooltip from "@/components/ui/DTIWarningTooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
  
  // Check if we have any DTI warnings to display
  const hasFrontEndWarning = results.financialDetails?.frontEndDTIStatus?.status !== 'normal';
  const hasBackEndWarning = results.financialDetails?.backEndDTIStatus?.status !== 'normal';
  const hasAnyDTIWarnings = hasFrontEndWarning || hasBackEndWarning;
  
  return (
    <div className="space-y-6">
      <FinancialOverview 
        maxHomePrice={results.maxHomePrice} 
        monthlyPayment={results.monthlyPayment}
        financialDetails={results.financialDetails}
      />
      
      {/* DTI Warnings Section */}
      {hasAnyDTIWarnings && (
        <Alert variant="default" className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertTitle>Affordability Considerations</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {hasFrontEndWarning && results.financialDetails?.frontEndDTIStatus && (
                <DTIWarningTooltip 
                  dtiStatus={results.financialDetails.frontEndDTIStatus} 
                  useHoverCard={true}
                  tooltipWidth="wide"
                />
              )}
              
              {hasBackEndWarning && results.financialDetails?.backEndDTIStatus && (
                <DTIWarningTooltip 
                  dtiStatus={results.financialDetails.backEndDTIStatus}
                  useHoverCard={true}
                  tooltipWidth="wide"
                />
              )}
              
              <p className="text-sm mt-2">
                Having strong compensating factors can help qualify for higher DTI ratios. 
                {results.financialDetails?.strongFactorCount >= 2 
                  ? " You have multiple strong factors which may help with approval."
                  : " Consider improving your compensating factors to strengthen your application."}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
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
