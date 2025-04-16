import { toast } from "sonner";

export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

// Hardcoded test values for development - eventually these would come from a backend service
const TEST_DATA = {
  conventionalInterestRate: 6.75,
  fhaInterestRate: 6.25,
  propertyTax: 1.1, // National average property tax rate (%)
  propertyInsurance: 1200, // Average annual insurance premium ($)
  upfrontMIP: 1.75, // FHA upfront mortgage insurance premium (%)
  ongoingMIP: 0.55 // FHA ongoing mortgage insurance premium (%)
};

/**
 * Fetches mortgage interest rates
 */
export const fetchMortgageRates = async (): Promise<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}> => {
  console.log("Using mortgage rate data (simulating backend call)");
  
  // Return values (would be from a backend service in production)
  return {
    conventionalInterestRate: TEST_DATA.conventionalInterestRate,
    fhaInterestRate: TEST_DATA.fhaInterestRate
  };
};

/**
 * Fetches property tax rate and insurance premium
 */
export const fetchPropertyData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<{
  propertyTax: number | null;
  propertyInsurance: number | null;
}> => {
  console.log(`Getting property data for ${county}, ${state} (${zipCode}) - simulating backend call`);
  
  // Return values (would be from a backend service in production)
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
    console.log(`Getting mortgage data for ${state}, ${county}, ${zipCode} - simulating backend call`);
    
    // Return combined data (would be from a backend service in production)
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
    toast.error("Error retrieving mortgage data.");
    return null;
  }
};

// Keep legacy functions for backward compatibility
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
