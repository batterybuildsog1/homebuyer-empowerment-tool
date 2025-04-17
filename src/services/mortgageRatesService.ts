
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
    toast.error("Failed to fetch mortgage rates. No data available.");
    throw error;
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
      source: data.source || 'supabase',
      fromCache: data.fromCache || false
    };
    
  } catch (error) {
    console.error(`Error fetching property data:`, error);
    toast.error("Error retrieving property data. No data available.");
    throw error;
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
      upfrontMIP: rates.fromCache ? 1.75 : 1.75, // FHA upfront mortgage insurance is typically 1.75%
      ongoingMIP: rates.fromCache ? 0.55 : 0.55, // FHA annual mortgage insurance is typically 0.55%
      source: propertyData.fromCache && rates.fromCache ? 'cache' : 'api',
      fromCache: propertyData.fromCache && rates.fromCache
    };
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    toast.error("Error retrieving mortgage data. No data available.");
    return null;
  }
};
