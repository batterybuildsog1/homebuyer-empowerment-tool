
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CountyPropertyData } from "@/hooks/data/usePropertyData";
import { MortgageDataResponse, ApiResult } from "@/hooks/data/fetchingTypes";

/**
 * Fetches mortgage interest rates from the get-mortgage-rates edge function
 */
export const fetchMortgageRates = async (): Promise<ApiResult<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}>> => {
  try {
    console.log("Fetching mortgage rates from edge function...");
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('get-mortgage-rates');
    
    if (error) {
      console.error("Error fetching mortgage rates:", error);
      return { 
        success: false, 
        error: error.message || "Failed to fetch mortgage rates",
        errorCode: "RATES_API_ERROR"
      };
    }
    
    if (!data || !data.success) {
      console.error("Unsuccessful mortgage rates response:", data);
      return { 
        success: false, 
        error: data?.error || "Failed to fetch mortgage rates",
        errorCode: "RATES_INVALID_RESPONSE"
      };
    }
    
    console.log("Received mortgage rates:", data);
    
    return {
      success: true,
      data: {
        conventionalInterestRate: data.data.conventionalInterestRate,
        fhaInterestRate: data.data.fhaInterestRate,
      },
      source: data.data.source,
      fromCache: data.data.fromCache || false
    };
  } catch (error) {
    console.error("Error fetching mortgage rates:", error);
    return { 
      success: false, 
      error: error.message || "Error fetching mortgage rates",
      errorCode: "RATES_EXCEPTION"
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
): Promise<ApiResult<{
  propertyTax: number | null;
  propertyInsurance: number | null;
}>> => {
  try {
    console.log(`Fetching property data for ${county}, ${state}`);
    
    if (!state || !county) {
      return { 
        success: false, 
        error: "State and county are required",
        errorCode: "PROPERTY_MISSING_PARAMS"
      };
    }
    
    // Call the get-county-data edge function
    const { data, error } = await supabase.functions.invoke('get-county-data', {
      body: { state, county }
    });
    
    if (error) {
      return { 
        success: false, 
        error: `Error calling get-county-data: ${error.message}`,
        errorCode: "PROPERTY_API_ERROR"
      };
    }
    
    if (!data || !data.success) {
      return { 
        success: false, 
        error: data?.error || "Failed to fetch property data",
        errorCode: "PROPERTY_INVALID_RESPONSE"
      };
    }
    
    const countyData = data.data as CountyPropertyData;
    
    // Use primary tax rate, assuming all users are primary residents
    return {
      success: true,
      data: {
        propertyTax: countyData.primary_tax,
        propertyInsurance: countyData.insurance,
      },
      source: data.source || 'supabase',
      fromCache: data.fromCache || false
    };
    
  } catch (error) {
    console.error(`Error fetching property data:`, error);
    return { 
      success: false, 
      error: error.message || "Error retrieving property data",
      errorCode: "PROPERTY_EXCEPTION"
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
): Promise<ApiResult<MortgageDataResponse>> => {
  try {
    console.log(`Getting mortgage data for ${state}, ${county}, ${zipCode}`);
    
    // First, get the interest rates from the edge function
    const ratesResult = await fetchMortgageRates();
    
    // If rates fetch failed, propagate the error
    if (!ratesResult.success) {
      return {
        success: false,
        error: ratesResult.error || "Failed to fetch rates"
      };
    }
    
    // Then, get property data
    const propertyResult = await fetchPropertyData(state, county, zipCode);
    
    // If property data fetch failed, propagate the error
    if (!propertyResult.success) {
      return {
        success: false,
        error: propertyResult.error || "Failed to fetch property data"
      };
    }
    
    // Return combined data
    return {
      success: true,
      data: {
        conventionalInterestRate: ratesResult.data.conventionalInterestRate || 0,
        fhaInterestRate: ratesResult.data.fhaInterestRate || 0,
        propertyTax: propertyResult.data.propertyTax || 0,
        propertyInsurance: propertyResult.data.propertyInsurance || 0,
        // FHA mortgage insurance rates are standard and don't need to be fetched
        upfrontMIP: 1.75, // FHA upfront mortgage insurance is typically 1.75%
        ongoingMIP: 0.55, // FHA annual mortgage insurance is typically 0.55%
      },
      source: propertyResult.fromCache && ratesResult.fromCache ? 'cache' : 'api',
      fromCache: propertyResult.fromCache && ratesResult.fromCache
    };
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    return { 
      success: false, 
      error: error.message || "Error retrieving mortgage data",
      errorCode: "COMBINED_DATA_EXCEPTION"
    };
  }
};
