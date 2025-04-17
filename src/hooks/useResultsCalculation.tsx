import { useCallback, useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { toast } from "sonner";
import { validateMortgageData, calculateMortgageResults, MortgageResults } from "@/utils/mortgageResultsCalculator";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SelectedFactors, DebtItem } from "@/context/mortgage/types";

export const useResultsCalculation = () => {
  const { userData, updateResults } = useMortgage();
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();
  
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
      
      // Default factors definition
      const defaultFactors: SelectedFactors = {
        cashReserves: "none",
        residualIncome: "does not meet",
        housingPaymentIncrease: ">20%",
        employmentHistory: "<2 years",
        creditUtilization: ">30%",
        downPayment: "<5%"
      };
      
      // Ensure debt items is an array, fallback to empty array
      const safeDebtItems: DebtItem[] = Array.isArray(userData.financials.debtItems)
        ? userData.financials.debtItems
        : [];
      
      // Create enriched user data with safe default values
      const enrichedUserData = {
        ...userData,
        financials: {
          ...userData.financials,
          debtItems: safeDebtItems,
          selectedFactors: userData.financials.selectedFactors || defaultFactors
        }
      };
      
      // Calculate mortgage results with the enhanced data
      const results = calculateMortgageResults(enrichedUserData);
      
      if (!results) {
        toast.error("Calculation failed. Please check your inputs.");
        console.error("Calculation returned null results");
        setIsCalculating(false);
        return;
      }
      
      console.log("Calculation completed successfully:", results);

      // Calculate strong factor count locally for analytics
      const strongFactorCount = Object.values(userData.financials.selectedFactors || {}).filter(value => 
        value !== 'none' && 
        value !== 'does not meet' && 
        value !== '>20%' &&
        value !== '<2 years' &&
        value !== '>30%' &&
        value !== '<5%'
      ).length;
      
      // Track the calculation event
      trackEvent('results_calculated', {
        loanType: userData.loanDetails.loanType,
        ltv: userData.loanDetails.ltv,
        ficoScore: userData.financials.ficoScore,
        maxHomePrice: results.maxHomePrice,
        // Track compensating factors data for analytics
        hasStrongFactors: strongFactorCount >= 2
      });
      
      // Update results in context
      updateResults({
        maxHomePrice: results.maxHomePrice,
        monthlyPayment: results.monthlyPayment,
        financialDetails: results.financialDetails,
        scenarios: results.scenarios
      });
      
      toast.success("Mortgage calculation completed!");
    } catch (error) {
      console.error("Calculation error:", error);
      toast.error("An error occurred during calculation. Please try again.");
      setValidationError("There was a problem with the calculation. Please check your inputs.");
    } finally {
      setIsCalculating(false);
    }
  }, [userData, updateResults, trackEvent]);
  
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
    userData.financials.selectedFactors,
    userData.financials.currentHousingPayment,
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
