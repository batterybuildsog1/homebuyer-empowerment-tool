import { useState } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { fetchAllMortgageData } from '@/services/mortgageRatesService';
import { toast } from 'sonner';
import type { FetchProgressState } from '@/types';

export const useDataFetching = () => {
  const { userData, updateLoanDetails } = useMortgage();
  const [fetchProgress, setFetchProgress] = useState<FetchProgressState>({
    isLoading: false,
    isError: false,
    errorMessage: null,
    hasAttemptedFetch: false,
    progress: 0,
    message: ''
  });

  /**
   * Clear all loan data in context to prevent displaying stale values
   */
  const clearLoanData = () => {
    updateLoanDetails({
      conventionalInterestRate: null,
      fhaInterestRate: null,
      propertyTax: null,
      propertyInsurance: null,
      upfrontMIP: null,
      ongoingMIP: null,
      dataSource: null,
      dataTimestamp: null
    });
  };

  /**
   * Fetch loan data from external sources
   */
  const fetchExternalData = async (silent = false): Promise<boolean> => {
    // Get location data from context
    const { state, county, zipCode } = userData.location;
    
    // Validate location data
    if (!state || !county) {
      console.log("Missing location data, can't fetch mortgage data");
      if (!silent) {
        toast.error("Please set your location first");
      }
      
      // Update fetch progress state
      setFetchProgress({
        isLoading: false,
        isError: true,
        errorMessage: "Location data missing",
        hasAttemptedFetch: true,
        progress: 0,
        message: "Location data missing"
      });
      
      // Clear any stale data
      clearLoanData();
      
      return false;
    }
    
    // Start loading
    if (!silent) {
      setFetchProgress({
        isLoading: true,
        isError: false,
        errorMessage: null,
        hasAttemptedFetch: true,
        progress: 10, 
        message: "Fetching mortgage data..."
      });
    }
    
    try {
      // Fetch mortgage data
      const result = await fetchAllMortgageData(state, county, zipCode || '');
      
      if (!result.success && 'error' in result) {
        throw new Error(result.error);
      }
      
      // Extract data from result
      const data = result.data;
      
      // Get current timestamp for cache tracking
      const currentTimestamp = Date.now();
      
      // Update mortgage data in context
      updateLoanDetails({
        conventionalInterestRate: data.conventionalInterestRate,
        fhaInterestRate: data.fhaInterestRate,
        propertyTax: data.propertyTax,
        propertyInsurance: data.propertyInsurance,
        upfrontMIP: data.upfrontMIP,
        ongoingMIP: data.ongoingMIP,
        dataSource: result.source || 'api',
        dataTimestamp: currentTimestamp
      });
      
      // Only show success message for manual refreshes
      if (!silent) {
        toast.success("Mortgage data updated");
      }
      
      // Update fetch progress state
      setFetchProgress({
        isLoading: false,
        isError: false,
        errorMessage: null,
        hasAttemptedFetch: true,
        progress: 100,
        message: "Data successfully fetched"
      });
      
      return true;
    } catch (error) {
      console.error("Error fetching mortgage data:", error);
      
      // Only show error toast for manual refreshes
      if (!silent) {
        toast.error("Failed to fetch mortgage data");
      }
      
      // Update fetch progress state
      setFetchProgress({
        isLoading: false,
        isError: true,
        errorMessage: error.message || "Unknown error",
        hasAttemptedFetch: true,
        progress: 0,
        message: `Error: ${error.message || "Unknown error"}`
      });
      
      // Clear stale data when fetch fails
      clearLoanData();
      
      return false;
    }
  };

  return {
    fetchProgress,
    fetchExternalData,
    clearLoanData
  };
};
