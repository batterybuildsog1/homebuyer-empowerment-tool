
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useMortgage } from "@/context/MortgageContext";
import { getInterestRates, getFhaInterestRates, getPropertyTaxRate, getPropertyInsurance } from "@/services/perplexityService";
import { getFhaMipRates } from "@/utils/mortgageCalculations";

interface LoanDataState {
  loanType: 'conventional' | 'fha';
  downPayment: number;
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null; 
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP: number | null;
  ongoingMIP: number | null;
}

interface FetchProgressState {
  isLoading: boolean;
  progress: number;
  message: string;
  hasAttemptedFetch: boolean;
}

export const useLoanData = () => {
  const { userData, setIsLoadingData, isLoadingData, updateLoanDetails } = useMortgage();
  
  // Convert initial LTV to down payment percentage for initial state
  const initialDownPayment = userData.loanDetails.ltv ? 100 - userData.loanDetails.ltv : 20;

  const [formData, setFormData] = useState<LoanDataState>({
    loanType: userData.loanDetails.loanType || 'conventional',
    downPayment: initialDownPayment,
    conventionalInterestRate: userData.loanDetails.conventionalInterestRate || null,
    fhaInterestRate: userData.loanDetails.fhaInterestRate || null,
    propertyTax: userData.loanDetails.propertyTax || null,
    propertyInsurance: userData.loanDetails.propertyInsurance || null,
    upfrontMIP: userData.loanDetails.upfrontMIP || null,
    ongoingMIP: userData.loanDetails.ongoingMIP || null,
  });
  
  const [fetchProgress, setFetchProgress] = useState<FetchProgressState>({
    isLoading: false,
    progress: 0,
    message: "Initializing...",
    hasAttemptedFetch: false,
  });

  // Initialize from localStorage on mount
  useEffect(() => {
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    const cachedData = localStorage.getItem("cached_loan_data");
    
    if (lastFetchTime && cachedData) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastFetchTime) > oneHourAgo) {
        // If we have cached data less than an hour old, use it
        try {
          const parsedData = JSON.parse(cachedData);
          setFormData(prev => ({
            ...prev,
            conventionalInterestRate: parsedData.conventionalInterestRate,
            fhaInterestRate: parsedData.fhaInterestRate,
            propertyTax: parsedData.propertyTax,
            propertyInsurance: parsedData.propertyInsurance,
          }));
          
          // Mark that we've already fetched data
          setFetchProgress(prev => ({
            ...prev,
            hasAttemptedFetch: true
          }));
          
          // Update context with cached data
          updateLoanDetails(parsedData);
          
          console.log("Using cached loan data", parsedData);
        } catch (e) {
          console.error("Error parsing cached loan data", e);
        }
      }
    }
  }, [updateLoanDetails]);
  
  // Calculate LTV from down payment
  const ltv = 100 - formData.downPayment;

  // Get the current interest rate based on loan type
  const currentInterestRate = formData.loanType === 'conventional' 
    ? formData.conventionalInterestRate 
    : formData.fhaInterestRate;

  const handleLoanTypeChange = (loanType: 'conventional' | 'fha') => {
    setFormData(prev => ({ ...prev, loanType }));
    
    // Update MIP rates when loan type changes
    if (loanType === 'fha') {
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(
        1000, // Placeholder loan amount
        ltv
      );
      
      setFormData(prev => ({
        ...prev,
        loanType,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
    } else {
      // For conventional loans, clear MIP values
      setFormData(prev => ({
        ...prev,
        loanType,
        upfrontMIP: null,
        ongoingMIP: null,
      }));
    }
  };

  const handleDownPaymentChange = (downPayment: number) => {
    setFormData(prev => ({ ...prev, downPayment }));
    
    // If FHA loan, recalculate MIP rates based on new LTV
    if (formData.loanType === 'fha') {
      const newLtv = 100 - downPayment;
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(1000, newLtv);
      
      setFormData(prev => ({
        ...prev,
        downPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
    }
  };

  const fetchExternalData = useCallback(async (isBackgroundFetch = false) => {
    // Check for recent fetch in localStorage
    const lastFetchTime = localStorage.getItem("data_fetch_timestamp");
    if (lastFetchTime) {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      if (parseInt(lastFetchTime) > oneHourAgo) {
        console.log("Skipping fetch - already fetched within the last hour");
        
        // Mark that we've attempted a fetch
        setFetchProgress(prev => ({
          ...prev,
          hasAttemptedFetch: true
        }));
        
        // Try to use cached data
        const cachedData = localStorage.getItem("cached_loan_data");
        if (cachedData) {
          try {
            return JSON.parse(cachedData);
          } catch (e) {
            console.error("Error parsing cached data", e);
          }
        }
        
        return null;
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

      // Create a data object to store results
      const fetchedData = {
        conventionalInterestRate,
        fhaInterestRate,
        propertyTax: propertyTaxRate,
        propertyInsurance: annualInsurance,
      };
      
      // Cache the results in localStorage with a timestamp
      localStorage.setItem("data_fetch_timestamp", Date.now().toString());
      localStorage.setItem("cached_loan_data", JSON.stringify(fetchedData));

      // Update local form state immediately for display
      setFormData(prev => ({
        ...prev,
        conventionalInterestRate: conventionalInterestRate,
        fhaInterestRate: fhaInterestRate,
        propertyTax: propertyTaxRate,
        propertyInsurance: annualInsurance,
      }));

      // If it's an FHA loan, calculate MIP
      if (formData.loanType === 'fha') {
        const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(
          1000, // Placeholder loan amount, will be calculated based on actual home price later
          ltv // Use calculated LTV here
        );
        setFormData(prev => ({
          ...prev,
          upfrontMIP: upfrontMipPercent,
          ongoingMIP: annualMipPercent,
        }));
      }

      // Only show success if we got all necessary data and this is not a background fetch
      if (!isBackgroundFetch) {
        if (conventionalInterestRate !== null && fhaInterestRate !== null && 
            propertyTaxRate !== null && annualInsurance !== null) {
          toast.success("Successfully processed mortgage data!");
        } else {
          toast.warning("Some data could not be fetched. Please try again.");
        }
      }
      
      // Return the fetched data (which may include nulls)
      return fetchedData;

    } catch (error) {
      console.error("Error fetching data:", error);
      if (!isBackgroundFetch) {
        toast.error("An error occurred while fetching data. Please check console and try again.");
      }
      return null; // Return null on error
    } finally {
      // Only update loading state if this is not a background fetch
      if (!isBackgroundFetch) {
        setIsLoadingData(false);
        setFetchProgress(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [userData.location, formData.loanType, ltv, setIsLoadingData, updateLoanDetails]);

  return {
    formData,
    fetchProgress,
    ltv,
    currentInterestRate,
    handleLoanTypeChange,
    handleDownPaymentChange,
    fetchExternalData
  };
};
