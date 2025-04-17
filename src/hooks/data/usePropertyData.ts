import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CountyPropertyData } from '@/types';

export interface PropertyDataState {
  isLoading: boolean;
  error: string | null;
  data: CountyPropertyData | null;
}

/**
 * Hook to fetch property tax and insurance data by state and county
 */
export const usePropertyData = (state: string, county: string) => {
  const [propertyData, setPropertyData] = useState<PropertyDataState>({
    isLoading: false,
    error: null,
    data: null
  });

  const fetchPropertyData = useCallback(async (silent = false) => {
    if (!state || !county) {
      if (!silent) {
        setPropertyData(prev => ({
          ...prev,
          error: 'State and county are required',
          isLoading: false
        }));
      }
      return null;
    }

    if (!silent) {
      setPropertyData(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));
    }

    try {
      console.log(`Fetching property data for ${county}, ${state}`);
      
      const { data, error } = await supabase.functions.invoke('get-county-data', {
        body: { state, county }
      });

      if (error) {
        throw new Error(`Error fetching property data: ${error.message}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch property data');
      }

      console.log('Property data received:', data.data);
      
      // Update state with the fetched data
      if (!silent) {
        setPropertyData({
          isLoading: false,
          error: null,
          data: data.data
        });
      }
      
      return data.data as CountyPropertyData;
      
    } catch (error) {
      console.error('Error in fetchPropertyData:', error);
      
      if (!silent) {
        setPropertyData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'An unknown error occurred'
        }));
        
        toast.error('Failed to fetch property tax and insurance data');
      }
      
      return null;
    }
  }, [state, county]);

  // Fetch data when state and county change
  useEffect(() => {
    if (state && county) {
      fetchPropertyData();
    }
  }, [state, county, fetchPropertyData]);

  return {
    ...propertyData,
    fetchPropertyData
  };
};
