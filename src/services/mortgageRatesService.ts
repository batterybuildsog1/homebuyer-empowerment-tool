
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CountyPropertyData } from "@/hooks/data/usePropertyData";

export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
  rateDate?: string;
  source?: string;
  fromCache?: boolean;
}

// Fallback test values for development - used only if API calls fail
const TEST_DATA = {
  conventionalInterestRate: 6.75,
  fhaInterestRate: 6.25,
  propertyTax: 1.1,
  propertyInsurance: 1200,
  upfrontMIP: 1.75,
  ongoingMIP: 0.55
};

/**
 * Fetches mortgage interest rates from the get-mortgage-rates edge function
 */
export const fetchMortgageRates = async (): Promise<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  source?: string;
  fromCache?: boolean;
}> => {
  try {
    console.log("Fetching mortgage rates from edge function...");
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('get-mortgage-rates');
    
    if (error) {
      console.error("Error fetching mortgage rates:", error);
      throw error;
    }
    
    if (!data || !data.success) {
      console.error("Unsuccessful mortgage rates response:", data);
      throw new Error("Failed to fetch mortgage rates");
    }
    
    console.log("Received mortgage rates:", data);
    
    return {
      conventionalInterestRate: data.data.conventionalInterestRate,
      fhaInterestRate: data.data.fhaInterestRate,
      source: data.data.source,
      fromCache: data.data.fromCache || false
    };
  } catch (error) {
    console.error("Error fetching mortgage rates:", error);
    toast.error("Failed to fetch mortgage rates. Using test data.");
    
    // Return test values if the API call fails
    return {
      conventionalInterestRate: TEST_DATA.conventionalInterestRate,
      fhaInterestRate: TEST_DATA.fhaInterestRate,
      source: 'test_data'
    };
  }
};

/**
 * Fetches property tax rate and insurance premium from county data
 */
export const fetchPropertyData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<{
  propertyTax: number | null;
  propertyInsurance: number | null;
  source?: string;
  fromCache?: boolean;
}> => {
  try {
    console.log(`Fetching property data for ${county}, ${state}`);
    
    if (!state || !county) {
      throw new Error("State and county are required");
    }
    
    // Call the get-county-data edge function
    const { data, error } = await supabase.functions.invoke('get-county-data', {
      body: { state, county }
    });
    
    if (error) {
      throw new Error(`Error calling get-county-data: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error(data?.error || "Failed to fetch property data");
    }
    
    const countyData = data.data as CountyPropertyData;
    
    // Use primary tax rate, assuming all users are primary residents
    return {
      propertyTax: countyData.primary_tax,
      propertyInsurance: countyData.insurance,
      source: 'supabase',
      fromCache: data.fromCache || false
    };
    
  } catch (error) {
    console.error(`Error fetching property data:`, error);
    toast.error("Error retrieving property data. Using estimates.");
    
    // Return test values if the API call fails
    return {
      propertyTax: TEST_DATA.propertyTax,
      propertyInsurance: TEST_DATA.propertyInsurance,
      source: 'test_data'
    };
  }
};

/**
 * Fetches all mortgage-related data
 */
export const fetchAllMortgageData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<MortgageDataResponse | null> => {
  try {
    console.log(`Getting mortgage data for ${state}, ${county}, ${zipCode}`);
    
    // First, get the interest rates from the edge function
    const rates = await fetchMortgageRates();
    
    // Then, get property data
    const propertyData = await fetchPropertyData(state, county, zipCode);
    
    // Return combined data
    return {
      conventionalInterestRate: rates.conventionalInterestRate,
      fhaInterestRate: rates.fhaInterestRate,
      propertyTax: propertyData.propertyTax,
      propertyInsurance: propertyData.propertyInsurance,
      upfrontMIP: TEST_DATA.upfrontMIP,
      ongoingMIP: TEST_DATA.ongoingMIP,
      source: propertyData.fromCache && rates.fromCache ? 'cache' : 'api',
      fromCache: propertyData.fromCache && rates.fromCache
    };
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    toast.error("Error retrieving mortgage data.");
    return null;
  }
};
