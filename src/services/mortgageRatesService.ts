
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
  rateDate?: string;
  source?: string;
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
      fhaInterestRate: data.data.fhaInterestRate
    };
  } catch (error) {
    console.error("Error fetching mortgage rates:", error);
    toast.error("Failed to fetch mortgage rates. Using test data.");
    
    // Return test values if the API call fails
    return {
      conventionalInterestRate: TEST_DATA.conventionalInterestRate,
      fhaInterestRate: TEST_DATA.fhaInterestRate
    };
  }
};

/**
 * Fetches property tax rate and insurance premium
 * Note: This uses hardcoded test data as per requirements
 */
export const fetchPropertyData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<{
  propertyTax: number | null;
  propertyInsurance: number | null;
}> => {
  console.log(`Getting property data for ${county}, ${state} (${zipCode}) - using test data`);
  
  // Return test values as requested
  return {
    propertyTax: TEST_DATA.propertyTax,
    propertyInsurance: TEST_DATA.propertyInsurance
  };
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
    
    // Then, get property data (still using test data)
    const propertyData = await fetchPropertyData(state, county, zipCode);
    
    // Return combined data
    return {
      conventionalInterestRate: rates.conventionalInterestRate,
      fhaInterestRate: rates.fhaInterestRate,
      propertyTax: propertyData.propertyTax,
      propertyInsurance: propertyData.propertyInsurance,
      upfrontMIP: TEST_DATA.upfrontMIP,
      ongoingMIP: TEST_DATA.ongoingMIP
    };
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    toast.error("Error retrieving mortgage data.");
    return null;
  }
};
