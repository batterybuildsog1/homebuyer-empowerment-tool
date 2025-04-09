
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
          console.log("Using cached loan data", parsedData);
          
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

  const checkCachedData = () => {
    // Check if we have data in localStorage
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error("Error parsing cached loan data", e);
        return null;
      }
    }
    
    return null;
  };

  return {
    checkCachedData
  };
};
