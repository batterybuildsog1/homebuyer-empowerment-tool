import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Keep fallbackData as a reference but avoid using it during testing
export const fallbackData = {
  interestRates: {
    default: 6.75,
    states: {
      "CA": 6.8,
      "NY": 6.85,
      "TX": 6.7,
      "FL": 6.65,
      "IL": 6.73,
      "PA": 6.78,
      "OH": 6.69,
      "GA": 6.72,
      "NC": 6.67,
      "MI": 6.71
    }
  },
  propertyTaxRates: {
    default: 1.07,
    states: {
      "CA": 0.76,
      "NY": 1.72,
      "TX": 1.8,
      "FL": 0.89,
      "IL": 2.27,
      "PA": 1.58,
      "OH": 1.62,
      "GA": 0.92,
      "NC": 0.84,
      "MI": 1.54
    }
  },
  annualInsurance: {
    default: 1200,
    states: {
      "CA": 1450,
      "NY": 1350,
      "TX": 1850,
      "FL": 1950,
      "IL": 1150,
      "PA": 1050,
      "OH": 950,
      "GA": 1250,
      "NC": 1150,
      "MI": 1050
    }
  }
};

export interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

export const fetchPerplexityData = async (
  query: string,
  queryType?: string
): Promise<string | null> => {
  let timeoutId: NodeJS.Timeout | undefined;
  try {
    console.log(`Sending ${queryType || 'general'} query to Perplexity API via Edge Function...`);

    // Start a timeout
    timeoutId = setTimeout(() => {
      throw new Error("Request timed out");
    }, 15000); // 15 second timeout
    
    const { data, error } = await supabase.functions.invoke('perplexity-api', {
      body: { query, queryType },
    });

    clearTimeout(timeoutId);

    if (error) {
      console.error('Edge function error:', error);
      toast.error(`API Error: ${error.message}`);
      return null;
    }

    if (data.error) {
      console.error('Perplexity API error:', data.error);
      toast.error(`Perplexity API Error: ${data.error}`);
      return null;
    }

    return data.content;

  } catch (error) {
    console.error(`Error fetching data from Perplexity API:`, error);
    
    if (timeoutId) clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      toast.error("API request timed out.");
    } else {
      toast.error("Network error fetching data.");
    }
    
    return null;
  }
};

/**
 * Fetches mortgage interest rates from Mortgage News Daily
 * @returns A promise that resolves to an object containing both conventional and FHA rates
 */
export const fetchMortgageRates = async (): Promise<{
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  try {
    console.log("Fetching mortgage rates from Mortgage News Daily...");
    
    // Start a timeout
    timeoutId = setTimeout(() => {
      throw new Error("Request timed out");
    }, 20000); // 20 second timeout
    
    // Craft a single query to get both conventional and FHA rates from Mortgage News Daily
    const query = `
      What are the current average 30-year fixed conventional AND FHA mortgage interest rates according to Mortgage News Daily's most recent update? 
      These should be nationwide rates, not state-specific.
      
      Respond ONLY with a valid JSON object with these exact keys:
      {
        "conventionalInterestRate": numeric_value,
        "fhaInterestRate": numeric_value
      }
      
      Ensure all values are numbers only with no % signs, representing percentages.
    `;

    const rawResponse = await fetchPerplexityData(query, "mortgageRates");
    clearTimeout(timeoutId);
    
    if (!rawResponse) {
      console.log("Failed to fetch mortgage rate data");
      return { conventionalInterestRate: null, fhaInterestRate: null };
    }
    
    console.log("Raw mortgage rates response:", rawResponse);
    
    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```(?:json)?\n?([\s\S]*?)\n?```/, '$1').trim();
    
    try {
      const parsedData = JSON.parse(jsonString);
      
      // Validate the rates
      return {
        conventionalInterestRate: validateNumericValue(parsedData.conventionalInterestRate),
        fhaInterestRate: validateNumericValue(parsedData.fhaInterestRate)
      };
      
    } catch (error) {
      console.error('Error parsing mortgage rates data:', error);
      console.log('Raw JSON string attempted to parse:', jsonString);
      
      // Fallback option: Try to extract values individually using regex pattern matching
      const conventionalMatch = rawResponse.match(/conventional(?:\s|\w)*rate(?:\s|\w)*?(\d+\.?\d*)/i);
      const fhaMatch = rawResponse.match(/fha(?:\s|\w)*rate(?:\s|\w)*?(\d+\.?\d*)/i);
      
      return {
        conventionalInterestRate: conventionalMatch && conventionalMatch[1] ? parseFloat(conventionalMatch[1]) : null,
        fhaInterestRate: fhaMatch && fhaMatch[1] ? parseFloat(fhaMatch[1]) : null
      };
    }
  } catch (error) {
    console.error(`Error fetching mortgage rates:`, error);
    
    if (timeoutId) clearTimeout(timeoutId);
    
    toast.error("Error fetching mortgage rates. Using fallback values.");
    return { conventionalInterestRate: null, fhaInterestRate: null };
  }
};

/**
 * Fetches property tax rate and insurance premium for a specific location
 * @param state The state abbreviation (e.g. "CA")
 * @param county The county name
 * @param zipCode The zipcode for insurance estimates
 * @returns A promise that resolves to an object containing tax rate and insurance premium
 */
export const fetchPropertyData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<{
  propertyTax: number | null;
  propertyInsurance: number | null;
}> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  try {
    console.log(`Fetching property data for ${county}, ${state} (${zipCode})...`);
    
    // Start a timeout
    timeoutId = setTimeout(() => {
      throw new Error("Request timed out");
    }, 20000); // 20 second timeout
    
    // Craft a query to get both property tax rate and insurance premium
    const query = `
      I need property data for ${county}, ${state} (zip: ${zipCode}) in JSON format. Please provide:
      1. The average property tax rate in ${county}, ${state}
      2. The average annual home insurance premium for a single-family home in ${zipCode}
      
      Respond ONLY with a valid JSON object with these exact keys:
      {
        "propertyTax": numeric_value,
        "propertyInsurance": numeric_value
      }
      
      Ensure all values are numbers only (no % signs or $ signs), representing percentages and dollar amounts.
    `;

    const rawResponse = await fetchPerplexityData(query, "propertyData");
    clearTimeout(timeoutId);
    
    if (!rawResponse) {
      console.log("Failed to fetch property data");
      return { propertyTax: null, propertyInsurance: null };
    }
    
    console.log("Raw property data response:", rawResponse);
    
    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```(?:json)?\n?([\s\S]*?)\n?```/, '$1').trim();
    
    try {
      const parsedData = JSON.parse(jsonString);
      
      // Validate the data
      return {
        propertyTax: validateNumericValue(parsedData.propertyTax),
        propertyInsurance: validateNumericValue(parsedData.propertyInsurance)
      };
      
    } catch (error) {
      console.error('Error parsing property data:', error);
      console.log('Raw JSON string attempted to parse:', jsonString);
      
      // Fallback option: Try to extract values individually using regex pattern matching
      const taxMatch = rawResponse.match(/property\s*tax(?:\s|\w)*?(\d+\.?\d*)/i);
      const insuranceMatch = rawResponse.match(/insurance(?:\s|\w)*?(?:\$)?(\d+[,\d]*\.?\d*)/i);
      
      return {
        propertyTax: taxMatch && taxMatch[1] ? parseFloat(taxMatch[1]) : null,
        propertyInsurance: insuranceMatch && insuranceMatch[1] ? parseFloat(insuranceMatch[1].replace(/,/g, '')) : null
      };
    }
  } catch (error) {
    console.error(`Error fetching property data:`, error);
    
    if (timeoutId) clearTimeout(timeoutId);
    
    toast.error("Error fetching property data. Using fallback values.");
    return { propertyTax: null, propertyInsurance: null };
  }
};

/**
 * Fetches all mortgage-related data with separate API calls
 * @param state The state abbreviation (e.g. "CA")
 * @param county The county name
 * @param zipCode The zipcode for insurance estimates
 * @returns A promise that resolves to MortgageDataResponse object or null if all fetches fail
 */
export const fetchAllMortgageData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<MortgageDataResponse | null> => {
  try {
    console.log(`Fetching all mortgage data for ${state}, ${county}, ${zipCode}...`);
    
    // Make two separate API calls in parallel
    const [mortgageRatesData, propertyData] = await Promise.all([
      fetchMortgageRates(),
      fetchPropertyData(state, county, zipCode)
    ]);
    
    // Combine the results
    const combinedData: MortgageDataResponse = {
      conventionalInterestRate: mortgageRatesData.conventionalInterestRate,
      fhaInterestRate: mortgageRatesData.fhaInterestRate,
      propertyTax: propertyData.propertyTax,
      propertyInsurance: propertyData.propertyInsurance
    };
    
    // Check if we got at least some valid data
    const hasAnyValidData = combinedData.conventionalInterestRate !== null || 
                           combinedData.fhaInterestRate !== null || 
                           combinedData.propertyTax !== null || 
                           combinedData.propertyInsurance !== null;
    
    if (!hasAnyValidData) {
      console.error("No valid data found in any of the responses");
      return null;
    }
    
    console.log("Successfully fetched combined mortgage data:", combinedData);
    return combinedData;
    
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    toast.error("Network error fetching mortgage data.");
    return null;
  }
};

/**
 * Helper function to validate a numeric value from the API
 * @param value The value to validate
 * @returns The validated number or null if invalid
 */
function validateNumericValue(value: any): number | null {
  // Check if it's a number
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  
  // Check if it's a string that can be converted to a number
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    const parsedValue = parseFloat(cleanedValue);
    
    if (!isNaN(parsedValue) && isFinite(parsedValue)) {
      return parsedValue;
    }
  }
  
  return null;
}

// Keeping the following functions for backward compatibility
export const getInterestRates = async (state: string): Promise<number | null> => {
  try {
    const ratesData = await fetchMortgageRates();
    return ratesData.conventionalInterestRate;
  } catch (error) {
    console.error('Error in getInterestRates:', error);
    toast.error("Error processing interest rate data.");
    return null;
  }
};

export const getFhaInterestRates = async (state: string): Promise<number | null> => {
  try {
    const ratesData = await fetchMortgageRates();
    return ratesData.fhaInterestRate;
  } catch (error) {
    console.error('Error in getFhaInterestRates:', error);
    toast.error("Error processing FHA interest rate data.");
    return null;
  }
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  try {
    // Store county for future use
    localStorage.setItem("last_county", county);
    
    // For backward compatibility - try to use the zipCode if available
    const zipCode = localStorage.getItem("last_zipcode") || "00000"; // Fallback to generic zipcode
    
    const propertyData = await fetchPropertyData(state, county, zipCode);
    return propertyData.propertyTax;
  } catch (error) {
    console.error('Error in getPropertyTaxRate:', error);
    toast.error("Error processing property tax data.");
    return null;
  }
};

export const getPropertyInsurance = async (state: string, zipCode: string): Promise<number | null> => {
  try {
    // Store zipCode for future use
    localStorage.setItem("last_zipcode", zipCode);
    
    // For backward compatibility - try to use the county if available
    const county = localStorage.getItem("last_county") || state; // Fallback to state if no county
    
    const propertyData = await fetchPropertyData(state, county, zipCode);
    return propertyData.propertyInsurance;
  } catch (error) {
    console.error('Error in getPropertyInsurance:', error);
    toast.error("Error processing insurance data.");
    return null;
  }
};
