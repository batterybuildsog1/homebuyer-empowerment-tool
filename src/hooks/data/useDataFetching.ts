
import { useState, useCallback } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { fetchAllMortgageData } from '@/services/mortgageRatesService';
import { FetchProgress } from './fetchingTypes';
import { toast } from 'sonner';

/**
 * Hook to handle data fetching for mortgage rates and property data
 */
export const useDataFetching = () => {
  const [fetchProgress, setFetchProgress] = useState<FetchProgress>({
    isLoading: false,
    progress: 0,
    message: '',
    hasAttemptedFetch: false
  });
  
  const { userData, updateLoanDetails } = useMortgage();
  
  /**
   * Fetches external mortgage data from the API
   */
  const fetchExternalData = useCallback(async () => {
    // Check if we have location data
    if (!userData.location.state || !userData.location.county) {
      toast.error('Please enter your location before fetching loan data');
      return null;
    }
    
    try {
      setFetchProgress({
        isLoading: true,
        progress: 10,
        message: 'Fetching mortgage rates...',
        hasAttemptedFetch: true
      });
      
      // Fetch all mortgage data at once
      const mortgageData = await fetchAllMortgageData(
        userData.location.state,
        userData.location.county,
        userData.location.zipCode || ''
      );
      
      if (!mortgageData) {
        throw new Error('Failed to fetch mortgage data');
      }
      
      setFetchProgress({
        isLoading: true,
        progress: 80,
        message: 'Processing data...',
        hasAttemptedFetch: true
      });
      
      // Update loan details in context
      updateLoanDetails({
        conventionalInterestRate: mortgageData.conventionalInterestRate,
        fhaInterestRate: mortgageData.fhaInterestRate,
        propertyTax: mortgageData.propertyTax,
        propertyInsurance: mortgageData.propertyInsurance,
        upfrontMIP: mortgageData.upfrontMIP,
        ongoingMIP: mortgageData.ongoingMIP
      });
      
      // Store data in cache
      const cacheData = {
        mortgageData,
        timestamp: Date.now(),
        location: `${userData.location.state}-${userData.location.county}`
      };
      
      localStorage.setItem('cached_loan_data', JSON.stringify(cacheData));
      
      setFetchProgress({
        isLoading: false,
        progress: 100,
        message: 'Data fetch complete',
        hasAttemptedFetch: true
      });
      
      toast.success('Mortgage data updated successfully');
      return mortgageData;
      
    } catch (error) {
      console.error('Error fetching mortgage data:', error);
      toast.error('Failed to fetch mortgage data');
      
      setFetchProgress({
        isLoading: false,
        progress: 0,
        message: 'Error fetching data',
        hasAttemptedFetch: true
      });
      
      return null;
    }
  }, [userData.location, updateLoanDetails]);
  
  return {
    fetchProgress,
    fetchExternalData
  };
};
