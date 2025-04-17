
import { useState, useCallback } from 'react';
import { useMortgage } from '@/context/MortgageContext';
import { fetchAllMortgageData } from '@/services/mortgageRatesService';
import { FetchProgressState } from './fetchingTypes';
import { toast } from 'sonner';

/**
 * Hook to handle data fetching for mortgage rates and property data
 */
export const useDataFetching = () => {
  const [fetchProgress, setFetchProgress] = useState<FetchProgressState>({
    isLoading: false,
    progress: 0,
    message: '',
    hasAttemptedFetch: false
  });
  
  const { userData, updateLoanDetails } = useMortgage();
  
  /**
   * Fetches external mortgage data from the API
   * @param silent If true, don't show loading states or toasts
   * @returns The fetched mortgage data or null if the fetch failed
   */
  const fetchExternalData = useCallback(async (silent = false) => {
    // Check if we have location data
    if (!userData.location.state || !userData.location.county) {
      if (!silent) {
        toast.error('Please enter your location before fetching loan data');
      }
      return null;
    }
    
    try {
      if (!silent) {
        setFetchProgress({
          isLoading: true,
          progress: 10,
          message: 'Checking for cached data...',
          hasAttemptedFetch: true
        });
      } else {
        // Just mark as loading without UI updates
        setFetchProgress(prev => ({
          ...prev,
          isLoading: true,
          hasAttemptedFetch: true
        }));
      }
      
      // Fetch all mortgage data at once - the edge function will check Supabase first
      const mortgageData = await fetchAllMortgageData(
        userData.location.state,
        userData.location.county,
        userData.location.zipCode || ''
      );
      
      if (!mortgageData) {
        throw new Error('Failed to fetch mortgage data');
      }
      
      if (!silent) {
        setFetchProgress({
          isLoading: true,
          progress: 80,
          message: 'Processing data...',
          hasAttemptedFetch: true
        });
      }
      
      // Update loan details in context
      updateLoanDetails({
        conventionalInterestRate: mortgageData.conventionalInterestRate,
        fhaInterestRate: mortgageData.fhaInterestRate,
        propertyTax: mortgageData.propertyTax,
        propertyInsurance: mortgageData.propertyInsurance,
        upfrontMIP: mortgageData.upfrontMIP,
        ongoingMIP: mortgageData.ongoingMIP,
        dataSource: mortgageData.source || 'api',
        dataTimestamp: Date.now()
      });
      
      // Store data in cache
      const cacheData = {
        mortgageData,
        timestamp: Date.now(),
        location: `${userData.location.state}-${userData.location.county}`
      };
      
      localStorage.setItem('cached_loan_data', JSON.stringify(cacheData));
      
      if (!silent) {
        setFetchProgress({
          isLoading: false,
          progress: 100,
          message: 'Data fetch complete',
          hasAttemptedFetch: true
        });
        
        toast.success('Mortgage data updated successfully');
      } else {
        setFetchProgress(prev => ({
          ...prev,
          isLoading: false,
          progress: 100,
          message: 'Data fetch complete',
        }));
      }
      
      return mortgageData;
      
    } catch (error) {
      console.error('Error fetching mortgage data:', error);
      
      if (!silent) {
        toast.error('Failed to fetch mortgage data');
        
        setFetchProgress({
          isLoading: false,
          progress: 0,
          message: 'Error fetching data',
          hasAttemptedFetch: true
        });
      } else {
        setFetchProgress(prev => ({
          ...prev,
          isLoading: false,
          progress: 0,
          message: 'Error fetching data',
        }));
      }
      
      return null;
    }
  }, [userData.location, updateLoanDetails]);
  
  return {
    fetchProgress,
    fetchExternalData
  };
};
