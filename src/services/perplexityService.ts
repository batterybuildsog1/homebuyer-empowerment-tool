
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

// Hardcoded fallback values if database fetch fails
const FALLBACK_DATA = {
  conventionalInterestRate: 6.75,
  fhaInterestRate: 6.25,
  propertyTax: 1.1, // National average property tax rate (%)
  propertyInsurance: 1200, // Average annual insurance premium ($)
  upfrontMIP: 1.75, // FHA upfront mortgage insurance premium (%)
  ongoingMIP: 0.55 // FHA ongoing mortgage insurance premium (%)
};

/**
 * Fetches mortgage interest rates from database
 */
export const fetchMortgageRates = async (): Promise<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}> => {
  try {
    // Get the latest valid rates from the database
    const { data: ratesData, error } = await supabase
      .from("rates")
      .select("*")
      .eq("valid", true)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching rates:", error);
      throw error;
    }

    if (!ratesData) {
      console.warn("No valid rates found, using fallback values");
      return {
        conventionalInterestRate: FALLBACK_DATA.conventionalInterestRate,
        fhaInterestRate: FALLBACK_DATA.fhaInterestRate
      };
    }

    console.log(`Using rates from ${ratesData.date}:`, ratesData);
    
    return {
      conventionalInterestRate: ratesData.conventional,
      fhaInterestRate: ratesData.fha
    };
  } catch (error) {
    console.error("Error in fetchMortgageRates:", error);
    // Return fallback values in case of error
    return {
      conventionalInterestRate: FALLBACK_DATA.conventionalInterestRate,
      fhaInterestRate: FALLBACK_DATA.fhaInterestRate
    };
  }
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
    propertyTax: FALLBACK_DATA.propertyTax,
    propertyInsurance: FALLBACK_DATA.propertyInsurance
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
    // First, try to get the latest valid rates from the database
    const rates = await fetchMortgageRates();

    return {
      ...rates,
      propertyTax: FALLBACK_DATA.propertyTax,
      propertyInsurance: FALLBACK_DATA.propertyInsurance,
      upfrontMIP: FALLBACK_DATA.upfrontMIP,
      ongoingMIP: FALLBACK_DATA.ongoingMIP
    };
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    toast.error("Failed to fetch mortgage data. Using fallback values.");
    return {
      conventionalInterestRate: FALLBACK_DATA.conventionalInterestRate,
      fhaInterestRate: FALLBACK_DATA.fhaInterestRate,
      propertyTax: FALLBACK_DATA.propertyTax,
      propertyInsurance: FALLBACK_DATA.propertyInsurance,
      upfrontMIP: FALLBACK_DATA.upfrontMIP,
      ongoingMIP: FALLBACK_DATA.ongoingMIP
    };
  }
};

// Keep legacy functions for backward compatibility
export const getInterestRates = async (state: string): Promise<number | null> => {
  const { conventionalInterestRate } = await fetchMortgageRates();
  return conventionalInterestRate;
};

export const getFhaInterestRates = async (state: string): Promise<number | null> => {
  const { fhaInterestRate } = await fetchMortgageRates();
  return fhaInterestRate;
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  localStorage.setItem("last_county", county);
  return FALLBACK_DATA.propertyTax;
};

export const getPropertyInsurance = async (state: string, zipCode: string): Promise<number | null> => {
  localStorage.setItem("last_zipcode", zipCode);
  return FALLBACK_DATA.propertyInsurance;
};
