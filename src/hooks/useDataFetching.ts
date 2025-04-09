
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getInterestRates, getFhaInterestRates, getPropertyTaxRate, getPropertyInsurance } from "@/services/perplexityService";
import { getFhaMipRates } from "@/utils/mortgageCalculations";
import { useMortgage } from "@/context/MortgageContext";

interface FetchedData {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

interface FetchProgressState {
  isLoading: boolean;
  progress: number;
  message: string;
  hasAttemptedFetch: boolean;
}

export const useDataFetching = () => {
  const { userData, setIsLoadingData, updateLoanDetails } = useMortgage();
  
  const [fetchProgress, setFetchProgress] = useState<FetchProgressState>({
    isLoading: false,
    progress: 0,
    message: "Initializing...",
    hasAttemptedFetch: false,
  });

  const fetchExternalData = useCallback(async (isBackgroundFetch = false) => {
    // Check for recent fetch in localStorage
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    const cachedData = localStorage.getItem("cached_loan_data");
    
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
            updateLoanDetails({
              conventionalInterestRate: parsedData.conventionalInterestRate,
              fhaInterestRate: parsedData.fhaInterestRate,
              propertyTax: parsedData.propertyTax,
              propertyInsurance: parsedData.propertyInsurance,
              upfrontMIP: parsedData.upfrontMIP,
              ongoingMIP: parsedData.ongoingMIP
            });
            
            return parsedData;
          }
        } catch (e) {
          console.error("Error parsing cached data", e);
        }
      }
    }
    
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
        progress: 10,
        message: "Fetching conventional interest rates...",
      }));
    }
    
    // Always mark that we've attempted a fetch
    setFetchProgress(prev => ({
      ...prev,
      hasAttemptedFetch: true
    }));
    
    try {
      // Get conventional interest rate data
      const conventionalInterestRate = await getInterestRates(userData.location.state);

      if (conventionalInterestRate === null && !isBackgroundFetch) {
        toast.error("Failed to fetch conventional interest rate data. Please try again.");
      }

      if (!isBackgroundFetch) {
        setFetchProgress(prev => ({ ...prev, progress: 25, message: "Fetching FHA interest rates..." }));
      }

      // Get FHA interest rate data
      const fhaInterestRate = await getFhaInterestRates(userData.location.state);

      if (fhaInterestRate === null && !isBackgroundFetch) {
        toast.error("Failed to fetch FHA interest rate data. Please try again.");
      }

      if (!isBackgroundFetch) {
        setFetchProgress(prev => ({ ...prev, progress: 40, message: "Fetching property tax information..." }));
      }

      // Get property tax data
      const propertyTaxRate = await getPropertyTaxRate(userData.location.state, userData.location.county || userData.location.city);

      if (propertyTaxRate === null && !isBackgroundFetch) {
        toast.error("Failed to fetch property tax data. Please try again.");
      }

      if (!isBackgroundFetch) {
        setFetchProgress(prev => ({ ...prev, progress: 70, message: "Fetching insurance estimates..." }));
      }

      // Get property insurance data
      const annualInsurance = await getPropertyInsurance(userData.location.state, userData.location.zipCode);

      if (annualInsurance === null && !isBackgroundFetch) {
        toast.error("Failed to fetch property insurance data. Please try again.");
      }

      if (!isBackgroundFetch) {
        setFetchProgress(prev => ({ ...prev, progress: 100, message: "Processing data..." }));
      }

      console.log("Fetched data:", {
        conventionalRate: conventionalInterestRate,
        fhaRate: fhaInterestRate,
        propertyTax: propertyTaxRate,
        insurance: annualInsurance
      });

      // Check if at least some data was fetched successfully
      const anyDataReceived = conventionalInterestRate !== null || 
                            fhaInterestRate !== null || 
                            propertyTaxRate !== null || 
                            annualInsurance !== null;
                            
      if (!anyDataReceived) {
        throw new Error("No data was successfully fetched");
      }

      // Create a data object to store results
      const fetchedData: FetchedData = {
        conventionalInterestRate,
        fhaInterestRate,
        propertyTax: propertyTaxRate,
        propertyInsurance: annualInsurance,
      };
      
      // Cache the results in localStorage with a timestamp
      localStorage.setItem("data_fetch_timestamp", Date.now().toString());
      localStorage.setItem("cached_loan_data", JSON.stringify(fetchedData));

      // Update the context with the fetched data
      updateLoanDetails(fetchedData);

      // Only show success if all necessary data was fetched and this is not a background fetch
      if (!isBackgroundFetch) {
        if (conventionalInterestRate !== null && fhaInterestRate !== null && 
            propertyTaxRate !== null && annualInsurance !== null) {
          toast.success("Successfully processed mortgage data!");
        } else if (anyDataReceived) {
          toast.warning("Some data could not be fetched. You may proceed, but results might be inaccurate.");
        } else {
          toast.error("Failed to fetch any data. Please check your location information and try again.");
        }
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
