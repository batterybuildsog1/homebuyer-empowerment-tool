
import { useDataFetching } from "./data/useDataFetching";
import { useLoanDataCache } from "./data/useLoanDataCache";
import { useLoanSettings } from "./loan/useLoanSettings";

/**
 * Main hook that orchestrates loan data functionality
 * This hook composes all the necessary loan-related hooks
 */
export const useLoanData = () => {
  // Import all necessary hooks
  const { fetchProgress, fetchExternalData } = useDataFetching();
  const { checkCachedData, invalidateCache } = useLoanDataCache();
  const { 
    formData, 
    ltv, 
    currentInterestRate, 
    handleLoanTypeChange, 
    handleDownPaymentChange 
  } = useLoanSettings();

  return {
    formData,
    fetchProgress,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData,
    invalidateCache
  };
};
