
// Since I can't see the current content of useLoanDataCache.ts, I'm making an educated guess
// about its structure based on the other files and implementing the needed changes to clear context
// when cache is invalid or expired.

import { useMortgage } from '@/context/MortgageContext';
import { MortgageDataResponse } from '@/services/mortgageRatesService';

// Cache keys
const MORTGAGE_DATA_CACHE_KEY = 'mortgage_data_cache';
const CACHE_EXPIRY_TIME = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export interface CachedMortgageData extends MortgageDataResponse {
  state: string;
  county: string;
  zipCode?: string;
  timestamp: number;
}

export const useLoanDataCache = () => {
  const { userData, updateLoanDetails } = useMortgage();
  
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
   * Check if we have valid cached mortgage data
   */
  const checkCachedData = async (): Promise<boolean> => {
    try {
      // Get the current location from context
      const { state, county, zipCode } = userData.location;
      
      // If we don't have location data, we can't use or validate cached data
      if (!state || !county) {
        console.log("Missing location data, can't use cached mortgage data");
        clearLoanData(); // Clear any stale data
        return false;
      }
      
      // Try to get cached data from localStorage
      const cachedDataStr = localStorage.getItem(MORTGAGE_DATA_CACHE_KEY);
      if (!cachedDataStr) {
        console.log("No cached mortgage data found");
        clearLoanData(); // Clear any stale data
        return false;
      }
      
      // Parse cached data
      const cachedData = JSON.parse(cachedDataStr) as CachedMortgageData;
      
      // Get current timestamp
      const currentTime = Date.now();
      
      // Check if cache is expired (older than 4 hours)
      if (currentTime - cachedData.timestamp > CACHE_EXPIRY_TIME) {
        console.log("Cached mortgage data is expired");
        clearLoanData(); // Clear stale data on cache expiry
        return false;
      }
      
      // Check if location has changed
      if (cachedData.state !== state || cachedData.county !== county) {
        console.log("Location changed, cached mortgage data is invalid");
        clearLoanData(); // Clear stale data on location change
        return false;
      }
      
      // Cache is valid, update mortgage data in context
      console.log("Using cached mortgage data");
      updateLoanDetails({
        conventionalInterestRate: cachedData.conventionalInterestRate,
        fhaInterestRate: cachedData.fhaInterestRate,
        propertyTax: cachedData.propertyTax,
        propertyInsurance: cachedData.propertyInsurance,
        upfrontMIP: cachedData.upfrontMIP,
        ongoingMIP: cachedData.ongoingMIP,
        dataSource: 'cache',
        dataTimestamp: cachedData.timestamp
      });
      
      return true;
    } catch (error) {
      console.error("Error checking cached mortgage data:", error);
      clearLoanData(); // Clear stale data on error
      return false;
    }
  };
  
  /**
   * Save mortgage data to cache
   */
  const cacheData = (data: MortgageDataResponse): void => {
    try {
      // Get the current location from context
      const { state, county, zipCode } = userData.location;
      
      // Don't cache if we don't have location data
      if (!state || !county) {
        console.log("Missing location data, skipping cache");
        return;
      }
      
      // Create cache object
      const cacheObject: CachedMortgageData = {
        ...data,
        state,
        county,
        zipCode,
        timestamp: Date.now()
      };
      
      // Save to localStorage
      localStorage.setItem(MORTGAGE_DATA_CACHE_KEY, JSON.stringify(cacheObject));
      console.log("Mortgage data cached");
    } catch (error) {
      console.error("Error caching mortgage data:", error);
    }
  };
  
  /**
   * Invalidate the cache
   */
  const invalidateCache = (): void => {
    try {
      localStorage.removeItem(MORTGAGE_DATA_CACHE_KEY);
      clearLoanData(); // Clear context data when invalidating cache
      console.log("Mortgage data cache invalidated");
    } catch (error) {
      console.error("Error invalidating mortgage data cache:", error);
    }
  };
  
  return {
    checkCachedData,
    cacheData,
    invalidateCache,
    clearLoanData
  };
};
