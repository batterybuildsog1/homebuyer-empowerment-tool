
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { useLoanDataCache } from "@/hooks/data/useLoanDataCache";
import { useDataFetching } from "@/hooks/data/useDataFetching";

interface DataFetchingManagerProps {
  checkDataReadiness: () => boolean;
  cachedDataExists: boolean;
}

const DataFetchingManager: React.FC<DataFetchingManagerProps> = ({
  checkDataReadiness,
  cachedDataExists
}) => {
  const { userData, updateLoanDetails } = useMortgage();
  const { checkCachedData } = useLoanDataCache();
  const { fetchExternalData } = useDataFetching();
  const [isInitialized, setIsInitialized] = useState(false);

  // Automatically fetch data when component mounts if we have location data
  useEffect(() => {
    const initializeData = async () => {
      // Only proceed if we have location data
      if (!userData.location.state || !userData.location.county) {
        console.log("Location data missing, skipping data fetch");
        return;
      }

      console.log("Checking for cached loan data");
      
      // First try to load from local cache
      const localCacheLoaded = await checkCachedData();
      
      if (localCacheLoaded) {
        console.log("Using data from local cache");
        checkDataReadiness();
        setIsInitialized(true);
        return;
      }
      
      // If no local cache, try to fetch from Supabase via edge function
      // The edge function will check Supabase first before calling external APIs
      console.log("No valid local cache, fetching from backend");
      const data = await fetchExternalData(true); // Silent mode
      
      if (data) {
        console.log("Successfully fetched loan data");
        toast.success("Mortgage data updated successfully");
      } else {
        console.log("Failed to fetch loan data or no data needed");
      }
      
      checkDataReadiness();
      setIsInitialized(true);
    };

    if (!isInitialized && userData.location.state && userData.location.county) {
      initializeData();
    }
  }, [
    userData.location.state, 
    userData.location.county, 
    checkCachedData, 
    fetchExternalData, 
    checkDataReadiness, 
    isInitialized
  ]);

  // Check for cached data on component mount
  useEffect(() => {
    // Check if we need to load data from localStorage
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        
        // Check if we have valid data in the cache
        const hasValidData = parsedData.conventionalInterestRate !== null || 
                            parsedData.fhaInterestRate !== null || 
                            parsedData.propertyTax !== null || 
                            parsedData.propertyInsurance !== null;
        
        // If we have cached data but it's not in userData yet, update it
        if (hasValidData && 
            !userData.loanDetails.conventionalInterestRate && 
            !userData.loanDetails.fhaInterestRate) {
          console.log("Loading cached loan data into context", parsedData);
          updateLoanDetails(parsedData);
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
      }
    }
  }, [updateLoanDetails, userData.loanDetails]);

  // Pre-populate form with values from userData
  useEffect(() => {
    // Initial data readiness check
    checkDataReadiness();
  }, []); 

  return null; // This is a non-visual component
};

export default DataFetchingManager;
