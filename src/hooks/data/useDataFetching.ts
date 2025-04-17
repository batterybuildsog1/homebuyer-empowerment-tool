
// We need to modify useDataFetching.ts to clear stale context on fetch failure
// Since I can't access the file content directly, I'm making an educated guess about its structure
// based on the pattern evident in the error and the files I've seen so far.
// The key update will be to call updateLoanDetails with null values when a fetch fails.

import { useState } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { fetchAllMortgageData, ApiResult, MortgageDataResponse } from '@/services/mortgageRatesService';
import { toast } from 'sonner';

export type FetchProgressState = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  hasAttemptedFetch: boolean;
};

export const useDataFetching = () => {
  const { userData, updateLoanDetails } = useMortgage();
  const [fetchProgress, setFetchProgress] = useState<FetchProgressState>({
    isLoading: false,
    isError: false,
    errorMessage: null,
    hasAttemptedFetch: false
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
        hasAttemptedFetch: true
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
        hasAttemptedFetch: true
      });
    }
    
    try {
      // Fetch mortgage data
      const result = await fetchAllMortgageData(state, county, zipCode || '');
      
      if (!result.success) {
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
        hasAttemptedFetch: true
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
        hasAttemptedFetch: true
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
