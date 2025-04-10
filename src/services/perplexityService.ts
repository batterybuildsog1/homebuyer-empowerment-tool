import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

// Hardcoded test values for development
const TEST_DATA = {
  conventionalInterestRate: 6.75,
  fhaInterestRate: 6.25,
  propertyTax: 1.1, // National average property tax rate (%)
  propertyInsurance: 1200, // Average annual insurance premium ($)
  upfrontMIP: 1.75, // FHA upfront mortgage insurance premium (%)
  ongoingMIP: 0.55 // FHA ongoing mortgage insurance premium (%)
};

// This function is kept for the original API implementation but returns hardcoded data
export const fetchPerplexityData = async (
  query: string,
  queryType?: string
): Promise<string | null> => {
  console.log(`TEST MODE: Query request for ${queryType || 'general'} data`);
  console.log(`Query: ${query}`);
  
  // Generate different mock responses based on query type
  if (queryType === "mortgageRates") {
    return JSON.stringify({
      conventionalInterestRate: TEST_DATA.conventionalInterestRate,
      fhaInterestRate: TEST_DATA.fhaInterestRate
    });
  } else if (queryType === "propertyData") {
    return JSON.stringify({
      propertyTax: TEST_DATA.propertyTax,
      propertyInsurance: TEST_DATA.propertyInsurance
    });
  }
  
  return null;
};

/**
 * Fetches mortgage interest rates (HARDCODED FOR TESTING)
 */
export const fetchMortgageRates = async (): Promise<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}> => {
  console.log("TEST MODE: Using hardcoded mortgage rates");
  
  // Return hardcoded values
  return {
    conventionalInterestRate: TEST_DATA.conventionalInterestRate,
    fhaInterestRate: TEST_DATA.fhaInterestRate
  };
};

/**
 * Fetches property tax rate and insurance premium (HARDCODED FOR TESTING)
 */
export const fetchPropertyData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<{
  propertyTax: number | null;
  propertyInsurance: number | null;
}> => {
  console.log(`TEST MODE: Using hardcoded property data for ${county}, ${state} (${zipCode})`);
  
  // Return hardcoded values
  return {
    propertyTax: TEST_DATA.propertyTax,
    propertyInsurance: TEST_DATA.propertyInsurance
  };
};

/**
 * Fetches all mortgage-related data (HARDCODED FOR TESTING)
 */
export const fetchAllMortgageData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<MortgageDataResponse | null> => {
  try {
    console.log(`TEST MODE: Using hardcoded mortgage data for ${state}, ${county}, ${zipCode}`);
    
    // Return combined hardcoded data
    return {
      conventionalInterestRate: TEST_DATA.conventionalInterestRate,
      fhaInterestRate: TEST_DATA.fhaInterestRate,
      propertyTax: TEST_DATA.propertyTax,
      propertyInsurance: TEST_DATA.propertyInsurance,
      upfrontMIP: TEST_DATA.upfrontMIP,
      ongoingMIP: TEST_DATA.ongoingMIP
    };
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    toast.error("Error retrieving test data.");
    return null;
  }
};

// Keep all the helper functions with simplified implementations
function validateNumericValue(value: any): number | null {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  return null;
}

// Legacy functions for backward compatibility, now using hardcoded values
export const getInterestRates = async (state: string): Promise<number | null> => {
  return TEST_DATA.conventionalInterestRate;
};

export const getFhaInterestRates = async (state: string): Promise<number | null> => {
  return TEST_DATA.fhaInterestRate;
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  localStorage.setItem("last_county", county);
  return TEST_DATA.propertyTax;
};

export const getPropertyInsurance = async (state: string, zipCode: string): Promise<number | null> => {
  localStorage.setItem("last_zipcode", zipCode);
  return TEST_DATA.propertyInsurance;
};
