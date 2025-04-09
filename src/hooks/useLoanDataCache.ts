
import { useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";

export const useLoanDataCache = () => {
  const { updateLoanDetails } = useMortgage();

  // Initialize from localStorage on mount
  useEffect(() => {
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (lastFetchTime && cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        
        // Only use cached data if it's valid (not all null values)
        const hasValidData = parsedData.conventionalInterestRate !== null || 
                              parsedData.fhaInterestRate !== null || 
                              parsedData.propertyTax !== null || 
                              parsedData.propertyInsurance !== null;
        
        if (hasValidData) {
          console.log("Using cached loan data from localStorage", parsedData);
          
          // Update context with cached data
          updateLoanDetails({
            conventionalInterestRate: parsedData.conventionalInterestRate,
            fhaInterestRate: parsedData.fhaInterestRate,
            propertyTax: parsedData.propertyTax, 
            propertyInsurance: parsedData.propertyInsurance,
            upfrontMIP: parsedData.upfrontMIP,
            ongoingMIP: parsedData.ongoingMIP
          });
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
      }
    }
  }, [updateLoanDetails]);

  /**
   * Check for valid cached data
   * @returns The cached data object or null if no valid cache exists
   */
  const checkCachedData = () => {
    // Check if we have data in localStorage
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (lastFetchTime && cachedData) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      // Check if cache is still valid (less than 1 hour old)
      if (parseInt(lastFetchTime) > oneHourAgo) {
        try {
          const parsedData = JSON.parse(cachedData);
          
          // Verify we have some valid data
          if (parsedData.conventionalInterestRate !== null || 
              parsedData.fhaInterestRate !== null || 
              parsedData.propertyTax !== null || 
              parsedData.propertyInsurance !== null) {
            
            return parsedData;
          }
        } catch (e) {
          console.error("Error parsing cached loan data", e);
        }
      }
    }
    
    return null;
  };

  /**
   * Forces cache invalidation
   */
  const invalidateCache = () => {
    localStorage.removeItem("data_fetch_timestamp");
    localStorage.removeItem("cached_loan_data");
  };

  return {
    checkCachedData,
    invalidateCache
  };
};
