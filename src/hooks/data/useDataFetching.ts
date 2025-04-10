
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { fetchAllMortgageData } from "@/services/perplexityService";
import { useMortgage } from "@/context/MortgageContext";
import { FetchProgressState, CachedLoanData } from "./fetchingTypes";

/**
 * Hook for handling all external data fetching operations
 */
export const useDataFetching = () => {
  const { userData, setIsLoadingData, updateLoanDetails } = useMortgage();
  
  const [fetchProgress, setFetchProgress] = useState<FetchProgressState>({
    isLoading: false,
    progress: 0,
    message: "Initializing...",
    hasAttemptedFetch: false,
  });

  /**
   * Fetches mortgage data from external API
   * @param isBackgroundFetch Whether this is a background fetch (no UI feedback)
   * @returns The fetched data or null if fetch failed
   */
  const fetchExternalData = useCallback(async (isBackgroundFetch = false) => {
    // Check for recent fetch in localStorage
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    const cachedData = localStorage.getItem("cached_loan_data");
    
    // Only use cached data if it's less than 1 hour old
    if (lastFetchTime && cachedData) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastFetchTime) > oneHourAgo) {
        try {
          const parsedData = JSON.parse(cachedData);
          
          // Only use cached data if it's valid (not all null values)
          const hasValidData = parsedData.conventionalInterestRate !== null || 
                              parsedData.fhaInterestRate !== null || 
                              parsedData.propertyTax !== null || 
                              parsedData.propertyInsurance !== null;
          
          if (hasValidData) {
            console.log("Using cached loan data within the last hour", parsedData);
            
            // Mark that we've attempted a fetch
            setFetchProgress(prev => ({
              ...prev,
              hasAttemptedFetch: true
            }));
            
            // Update context
            updateLoanDetails(parsedData);
            
            return parsedData;
          }
        } catch (e) {
          console.error("Error parsing cached data", e);
        }
      }
    }
    
    // Ensure we have location data before attempting fetch
    if (!userData.location.state || !userData.location.city || !userData.location.zipCode) {
      if (!isBackgroundFetch) {
        toast.error("Location information is incomplete. Please go back and complete it.");
      }
      return null;
    }
    
    // Set loading state only if this is not a background fetch
    if (!isBackgroundFetch) {
      setIsLoadingData(true);
      setFetchProgress(prev => ({ 
        ...prev, 
        isLoading: true, 
        progress: 20,
        message: "Fetching mortgage data...",
      }));
    }
    
    // Always mark that we've attempted a fetch
    setFetchProgress(prev => ({
      ...prev,
      hasAttemptedFetch: true
    }));
    
    try {
      // Consolidated fetch for all mortgage data
      const result = await fetchAllMortgageData(
        userData.location.state,
        userData.location.county || userData.location.city,
        userData.location.zipCode
      );

      // Update progress
      if (!isBackgroundFetch) {
        setFetchProgress(prev => ({ 
          ...prev, 
          progress: 80, 
          message: "Processing data..." 
        }));
      }

      // Log the fetched data
      console.log("Fetched mortgage data:", result);

      // Check if at least some data was fetched successfully
      const anyDataReceived = result.conventionalInterestRate !== null || 
                            result.fhaInterestRate !== null || 
                            result.propertyTax !== null || 
                            result.propertyInsurance !== null;
                            
      if (!anyDataReceived) {
        throw new Error("No data was successfully fetched");
      }

      // Transform the result data to match the expected structure
      const fetchedData: CachedLoanData = {
        conventionalInterestRate: result.conventionalInterestRate,
        fhaInterestRate: result.fhaInterestRate,
        propertyTax: result.propertyTax,
        propertyInsurance: result.propertyInsurance,
        upfrontMIP: result.upfrontMIP || null,
        ongoingMIP: result.ongoingMIP || null
      };
      
      // Cache the results in localStorage with a timestamp
      localStorage.setItem("data_fetch_timestamp", Date.now().toString());
      localStorage.setItem("cached_loan_data", JSON.stringify(fetchedData));

      // Update the context with the fetched data
      updateLoanDetails(fetchedData);

      // Only show success if all necessary data was fetched and this is not a background fetch
      if (!isBackgroundFetch) {
        if (result.conventionalInterestRate !== null && result.fhaInterestRate !== null && 
            result.propertyTax !== null && result.propertyInsurance !== null) {
          toast.success("Successfully processed mortgage data!");
        } else if (anyDataReceived) {
          toast.warning("Some data could not be fetched. You may proceed, but results might be inaccurate.");
        } else {
          toast.error("Failed to fetch any data. Please check your location information and try again.");
        }
        
        // Complete the progress
        setFetchProgress(prev => ({ 
          ...prev, 
          progress: 100, 
          message: "Data processing complete" 
        }));
      }
      
      // Return the fetched data
      return fetchedData;

    } catch (error) {
      console.error("Error fetching data:", error);
      if (!isBackgroundFetch) {
        toast.error("An error occurred while fetching data. Please check your location information and try again.");
      }
      return null; // Return null on error
    } finally {
      // Only update loading state if this is not a background fetch
      if (!isBackgroundFetch) {
        setIsLoadingData(false);
        setFetchProgress(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [userData.location, setIsLoadingData, updateLoanDetails]);

  return {
    fetchProgress,
    fetchExternalData
  };
};
