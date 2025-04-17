
import { useCallback } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { fetchAllMortgageData, MortgageDataResponse } from '@/services/mortgageRatesService';
import { toast } from 'sonner';

// Cache duration in milliseconds (4 hours)
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;

/**
 * Hook to manage loan data caching
 */
export const useLoanDataCache = () => {
  const { userData, updateLoanDetails } = useMortgage();
  
  /**
   * Checks if there's valid cached data and loads it if available
   * @returns Boolean indicating if valid data was loaded from cache
   */
  const checkCachedData = useCallback(async (): Promise<boolean> => {
    // Check for cached loan data
    const cachedDataString = localStorage.getItem('cached_loan_data');
    
    if (!cachedDataString) {
      console.log('No cached loan data found');
      return false;
    }
    
    try {
      // Parse and validate cached data
      const cachedData = JSON.parse(cachedDataString);
      const now = Date.now();
      const dataAge = now - cachedData.timestamp;
      
      // Check if data is for current location
      const currentLocation = `${userData.location.state}-${userData.location.county}`;
      const isSameLocation = cachedData.location === currentLocation;
      
      // If data is recent (within 4 hours) and for same location, use it
      if (dataAge < CACHE_DURATION_MS && isSameLocation) {
        console.log('Using cached loan data (within 4 hours)');
        
        // Apply cached mortgage data to context
        const mortgageData: MortgageDataResponse = cachedData.mortgageData;
        
        updateLoanDetails({
          conventionalInterestRate: mortgageData.conventionalInterestRate,
          fhaInterestRate: mortgageData.fhaInterestRate,
          propertyTax: mortgageData.propertyTax,
          propertyInsurance: mortgageData.propertyInsurance,
          upfrontMIP: mortgageData.upfrontMIP,
          ongoingMIP: mortgageData.ongoingMIP
        });
        
        return true;
      }
      
      console.log('Cached data expired or location changed, fetching new data');
      return false;
    } catch (error) {
      console.error('Error parsing cached loan data:', error);
      return false;
    }
  }, [userData.location, updateLoanDetails]);
  
  /**
   * Invalidates the loan data cache
   */
  const invalidateCache = useCallback(() => {
    localStorage.removeItem('cached_loan_data');
    toast.success('Mortgage data cache cleared');
  }, []);
  
  return {
    checkCachedData,
    invalidateCache
  };
};
