
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
  
  // Set appropriate initial values based on loan type
  const getInitialDownPayment = () => {
    if (userData.loanDetails.ltv) {
      return 100 - userData.loanDetails.ltv;
    }
    
    return userData.loanDetails.loanType === 'conventional' ? 20 : 3.5;
  };

  const [formData, setFormData] = useState<LoanDataState>({
    loanType: userData.loanDetails.loanType || 'conventional',
    downPayment: getInitialDownPayment(),
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
      try {
        const parsedData = JSON.parse(cachedData);
        
        // Only use cached data if it's valid (not all null values)
        const hasValidData = parsedData.conventionalInterestRate !== null || 
                              parsedData.fhaInterestRate !== null || 
                              parsedData.propertyTax !== null || 
                              parsedData.propertyInsurance !== null;
        
        if (hasValidData) {
          console.log("Using cached loan data", parsedData);
          
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
          updateLoanDetails({
            conventionalInterestRate: parsedData.conventionalInterestRate,
            fhaInterestRate: parsedData.fhaInterestRate,
            propertyTax: parsedData.propertyTax, 
            propertyInsurance: parsedData.propertyInsurance
          });
        }
      } catch (e) {
        console.error("Error parsing cached loan data", e);
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
    // If switching loan types, set appropriate default down payment
    let newDownPayment = formData.downPayment;
    
    // If current down payment is outside the valid range for the new loan type,
    // set it to a default value for that loan type
    if (loanType === 'conventional' && (formData.downPayment < 3 || formData.downPayment > 20)) {
      newDownPayment = 20;
    } else if (loanType === 'fha' && (formData.downPayment < 3.5 || formData.downPayment > 10)) {
      newDownPayment = 3.5;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      loanType,
      downPayment: newDownPayment 
    }));
    
    // Update MIP rates when loan type changes
    if (loanType === 'fha') {
      const newLtv = 100 - newDownPayment;
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(
        1000, // Placeholder loan amount
        newLtv
      );
      
      setFormData(prev => ({
        ...prev,
        loanType,
        downPayment: newDownPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
      
      // Also update context with new values
      updateLoanDetails({
        loanType,
        ltv: newLtv,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent
      });
    } else {
      // For conventional loans, clear MIP values
      setFormData(prev => ({
        ...prev,
        loanType,
        downPayment: newDownPayment,
        upfrontMIP: null,
        ongoingMIP: null,
      }));
      
      // Update context
      updateLoanDetails({
        loanType,
        ltv: 100 - newDownPayment,
        upfrontMIP: null,
        ongoingMIP: null
      });
    }
  };

  const handleDownPaymentChange = (downPayment: number) => {
    setFormData(prev => ({ ...prev, downPayment }));
    
    // Calculate new LTV
    const newLtv = 100 - downPayment;
    
    // Update context with new LTV
    updateLoanDetails({ ltv: newLtv });
    
    // If FHA loan, recalculate MIP rates based on new LTV
    if (formData.loanType === 'fha') {
      const { upfrontMipPercent, annualMipPercent } = getFhaMipRates(1000, newLtv);
      
      setFormData(prev => ({
        ...prev,
        downPayment,
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent,
      }));
      
      // Update context with new MIP rates
      updateLoanDetails({
        upfrontMIP: upfrontMipPercent,
        ongoingMIP: annualMipPercent
      });
    }
  };

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
            
            // Update local state
            setFormData(prev => ({
              ...prev,
              conventionalInterestRate: parsedData.conventionalInterestRate,
              fhaInterestRate: parsedData.fhaInterestRate,
              propertyTax: parsedData.propertyTax,
              propertyInsurance: parsedData.propertyInsurance,
            }));
            
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
        conventionalInterestRate,
        fhaInterestRate,
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
        
        // Update these in the context too
        fetchedData.upfrontMIP = upfrontMipPercent;
        fetchedData.ongoingMIP = annualMipPercent;
      }
      
      // Update the context with all the fetched data
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
