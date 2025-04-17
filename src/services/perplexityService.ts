
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

// Fallback test values for development - used only if API calls fail
const TEST_DATA = {
  conventionalInterestRate: 6.75,
  fhaInterestRate: 6.25,
  propertyTax: 1.1,
  propertyInsurance: 1200,
  upfrontMIP: 1.75,
  ongoingMIP: 0.55
};

// Cache duration in milliseconds (4 hours)
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000;

/**
 * Fetches mortgage interest rates from the database or fallback to OpenAI API
 */
export const fetchMortgageRates = async (): Promise<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}> => {
  try {
    console.log("Fetching mortgage rates...");
    
    // Check for cached rates
    const cachedRatesStr = localStorage.getItem("cached_mortgage_rates");
    const cachedTimestampStr = localStorage.getItem("cached_mortgage_rates_timestamp");
    
    if (cachedRatesStr && cachedTimestampStr) {
      const cachedTimestamp = parseInt(cachedTimestampStr);
      const now = Date.now();
      
      // If cache is still valid (within the last 4 hours), use it
      if (now - cachedTimestamp < CACHE_DURATION_MS) {
        console.log("Using cached mortgage rates (within 4 hours)");
        const cachedRates = JSON.parse(cachedRatesStr);
        return {
          conventionalInterestRate: cachedRates.conventionalInterestRate,
          fhaInterestRate: cachedRates.fhaInterestRate
        };
      }
    }
    
    // First try to get rates from the database
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Query the database for the latest rates
    const { data: latestRates, error } = await supabase
      .from('daily_mortgage_rates')
      .select('rate_date, conventional, fha')
      .order('rate_date', { ascending: false })
      .limit(1);
    
    if (!error && latestRates && latestRates.length > 0) {
      const dbRates = latestRates[0];
      console.log("Retrieved rates from database:", dbRates);
      
      // Cache the results with timestamp
      localStorage.setItem("cached_mortgage_rates", JSON.stringify({
        conventionalInterestRate: dbRates.conventional,
        fhaInterestRate: dbRates.fha
      }));
      localStorage.setItem("cached_mortgage_rates_timestamp", Date.now().toString());
      
      return {
        conventionalInterestRate: dbRates.conventional,
        fhaInterestRate: dbRates.fha
      };
    }
    
    // If database fetch fails or no data available, fall back to the OpenAI API
    console.log("No rates found in database, falling back to OpenAI API");
    
    // Get the Supabase URL from the environment
    const supabaseUrl = "https://thcmyhermklehzjdmhio.supabase.co";
    
    // Call the Supabase function that uses OpenAI
    const response = await fetch(`${supabaseUrl}/functions/v1/openai-rates-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    // Check for rate limiting (429)
    if (response.status === 429) {
      console.warn("Rate limit exceeded for mortgage rate API");
      toast.warning("Rate limit reached for mortgage data. Using cached data if available.");
      
      // If rate limited but we have cache, use it regardless of age
      if (cachedRatesStr) {
        console.log("Using older cached mortgage rates due to rate limiting");
        return JSON.parse(cachedRatesStr);
      }
      
      // Otherwise fall back to test data
      console.log("No cached rates available, using test data due to rate limiting");
      return {
        conventionalInterestRate: TEST_DATA.conventionalInterestRate,
        fhaInterestRate: TEST_DATA.fhaInterestRate
      };
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch mortgage rates');
    }
    
    const data = await response.json();
    console.log("Received mortgage rates from API:", data);
    
    // Get rate limit information from headers if available
    const rateLimit = {
      limit: response.headers.get("X-RateLimit-Limit"),
      remaining: response.headers.get("X-RateLimit-Remaining"),
      reset: response.headers.get("X-RateLimit-Reset")
    };
    
    if (rateLimit.remaining) {
      console.log(`Rate limit remaining: ${rateLimit.remaining}/${rateLimit.limit || 'unknown'}`);
      
      // Warn user if approaching rate limit
      if (parseInt(rateLimit.remaining) <= 1) {
        toast.warning("Rate limit for mortgage data nearly reached. Data will refresh in a few hours.");
      }
    }
    
    // Validate the rates to ensure they're reasonable (between 3% and 10%)
    const conventional = data.conventionalInterestRate;
    const fha = data.fhaInterestRate;
    
    if (conventional !== null && (conventional < 3 || conventional > 10)) {
      console.warn(`Conventional rate out of reasonable range: ${conventional}%, falling back to test data`);
      return {
        conventionalInterestRate: TEST_DATA.conventionalInterestRate,
        fhaInterestRate: TEST_DATA.fhaInterestRate
      };
    }
    
    if (fha !== null && (fha < 3 || fha > 10)) {
      console.warn(`FHA rate out of reasonable range: ${fha}%, falling back to test data`);
      return {
        conventionalInterestRate: TEST_DATA.conventionalInterestRate,
        fhaInterestRate: TEST_DATA.fhaInterestRate
      };
    }
    
    // Cache the valid results with timestamp
    if (conventional !== null || fha !== null) {
      localStorage.setItem("cached_mortgage_rates", JSON.stringify({
        conventionalInterestRate: conventional,
        fhaInterestRate: fha
      }));
      localStorage.setItem("cached_mortgage_rates_timestamp", Date.now().toString());
    }
    
    return {
      conventionalInterestRate: data.conventionalInterestRate,
      fhaInterestRate: data.fhaInterestRate
    };
  } catch (error) {
    console.error("Error fetching mortgage rates:", error);
    console.log("Falling back to test data for mortgage rates");
    
    // Return test values if the API call fails
    return {
      conventionalInterestRate: TEST_DATA.conventionalInterestRate,
      fhaInterestRate: TEST_DATA.fhaInterestRate
    };
  }
};

/**
 * Fetches property tax rate and insurance premium
 * Note: This still uses hardcoded test data as requested
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
  
  // Return test values as requested (property tax and insurance to remain hardcoded for now)
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
    
    // First, get the interest rates from OpenAI
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

// Keep legacy functions for backward compatibility
export const getInterestRates = async (state: string): Promise<number | null> => {
  const rates = await fetchMortgageRates();
  return rates.conventionalInterestRate;
};

export const getFhaInterestRates = async (state: string): Promise<number | null> => {
  const rates = await fetchMortgageRates();
  return rates.fhaInterestRate;
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  localStorage.setItem("last_county", county);
  return TEST_DATA.propertyTax;
};

export const getPropertyInsurance = async (state: string, zipCode: string): Promise<number | null> => {
  localStorage.setItem("last_zipcode", zipCode);
  return TEST_DATA.propertyInsurance;
};
