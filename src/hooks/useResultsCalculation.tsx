
import { useCallback, useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { toast } from "sonner";
import { validateMortgageData, calculateMortgageResults } from "@/utils/mortgageResultsCalculator";

export const useResultsCalculation = () => {
  const { userData, updateResults } = useMortgage();
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Memoized calculation function
  const runCalculations = useCallback(async () => {
    console.log("Running mortgage calculations...");
    setIsCalculating(true);
    
    try {
      // First validate all required data
      const validationError = validateMortgageData(userData);
      
      if (validationError) {
        setValidationError(validationError);
        console.log("Validation failed:", validationError);
        setIsCalculating(false);
        return;
      }
      
      setValidationError(null);
      
      // Calculate mortgage results
      const results = calculateMortgageResults(userData);
      
      if (!results) {
        toast.error("Calculation failed. Please check your inputs.");
        console.error("Calculation returned null results");
        setIsCalculating(false);
        return;
      }
      
      console.log("Calculation completed successfully:", results);
      
      // Update results in context
      updateResults(results);
      toast.success("Mortgage calculation completed!");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("An error occurred during calculation. Please try again.");
      setValidationError("There was a problem with the calculation. Please check your inputs.");
    } finally {
      setIsCalculating(false);
    }
  }, [userData, updateResults]);
  
  // Run calculations when dependent data changes
  useEffect(() => {
    // Only run calculations if we don't have results or if critical values have changed
    const shouldRecalculate = !userData.results.maxHomePrice || 
      !userData.results.monthlyPayment;
      
    if (shouldRecalculate) {
      console.log("Triggering calculation due to missing results or data changes");
      runCalculations();
    }
  // The key dependencies that should trigger a recalculation
  }, [
    userData.financials.annualIncome,
    userData.financials.monthlyDebts,
    userData.financials.ficoScore,
    userData.loanDetails.ltv,
    userData.loanDetails.loanType,
    userData.loanDetails.interestRate,
    userData.loanDetails.propertyTax,
    runCalculations
  ]);

  return {
    isCalculating,
    validationError,
    runCalculations
  };
};
