
import { useDataFetching } from "./data/useDataFetching";
import { useLoanDataCache } from "./data/useLoanDataCache";
import { useLoanSettings } from "./loan/useLoanSettings";
import { usePropertyData } from "./data/usePropertyData";
import { useMortgage } from "@/context/MortgageContext";

/**
 * Main hook that orchestrates loan data functionality
 * This hook composes all the necessary loan-related hooks
 */
export const useLoanData = () => {
  // Get userData from context to access location
  const { userData } = useMortgage();
  
  // Import all necessary hooks
  const { fetchProgress, fetchExternalData, clearLoanData: clearFetcherData } = useDataFetching();
  const { checkCachedData, invalidateCache, clearLoanData: clearCacheData } = useLoanDataCache();
  const { 
    formData, 
    ltv, 
    currentInterestRate, 
    handleLoanTypeChange, 
    handleDownPaymentChange 
  } = useLoanSettings();
  
  // Use the property data hook
  const propertyData = usePropertyData(
    userData.location.state,
    userData.location.county || ''
  );

  // Combine clear functions for easier access
  const clearAllLoanData = () => {
    clearFetcherData();
    clearCacheData();
  };

  return {
    formData,
    fetchProgress,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData,
    invalidateCache,
    clearAllLoanData,
    propertyData
  };
};
