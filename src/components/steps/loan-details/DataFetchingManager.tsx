
import { useEffect, useState, useRef } from "react";
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
  const { userData } = useMortgage();
  const { checkCachedData, clearLoanData } = useLoanDataCache();
  const { fetchExternalData, clearLoanData: fetcherClearLoanData } = useDataFetching();
  const [isInitialized, setIsInitialized] = useState(false);
  const initializingRef = useRef(false);

  // Automatically fetch data when component mounts if we have location data
  useEffect(() => {
    const initializeData = async () => {
      // Prevent multiple initializations
      if (initializingRef.current) {
        return;
      }
      
      initializingRef.current = true;
      
      // Only proceed if we have location data
      if (!userData.location.state || !userData.location.county) {
        console.log("Location data missing, skipping data fetch");
        // Clear any stale data when location is missing
        clearLoanData();
        initializingRef.current = false;
        return;
      }

      console.log("Checking for cached loan data");
      
      try {
        // Clear any stale data before attempting to load cache or fetch
        clearLoanData();
        
        // First try to load from local cache
        const localCacheLoaded = await checkCachedData();
        
        if (localCacheLoaded) {
          console.log("Using data from local cache");
          checkDataReadiness();
          setIsInitialized(true);
          initializingRef.current = false;
          return;
        }
        
        // If no local cache, try to fetch from Supabase via edge function
        console.log("No valid local cache, fetching from backend");
        // Use false for silent mode on initial load to show loading states
        const data = await fetchExternalData(false);
        
        if (data) {
          console.log("Successfully fetched loan data");
          // Toast message already shown by fetchExternalData
        } else {
          console.log("Failed to fetch loan data or no data needed");
          // Error toast already shown by fetchExternalData
        }
      } catch (error) {
        console.error("Error during data initialization:", error);
        clearLoanData(); // Ensure data is cleared on error
      } finally {
        checkDataReadiness();
        setIsInitialized(true);
        initializingRef.current = false;
      }
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
    isInitialized,
    clearLoanData,
    fetcherClearLoanData
  ]);

  // Handle location changes to clear stale data
  useEffect(() => {
    // Clear loan data when location changes
    clearLoanData();
    
    // Initial data readiness check
    checkDataReadiness();
  }, [userData.location.state, userData.location.county, clearLoanData, checkDataReadiness]); 

  return null; // This is a non-visual component
};

export default DataFetchingManager;
