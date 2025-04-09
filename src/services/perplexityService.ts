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
}

export const fetchPerplexityData = async (
  query: string
): Promise<string | null> => {
  let timeoutId: NodeJS.Timeout | undefined;
  try {
    console.log(`Sending query to Perplexity API via Edge Function...`);

    // Start a timeout
    timeoutId = setTimeout(() => {
      throw new Error("Request timed out");
    }, 15000); // 15 second timeout
    
    const { data, error } = await supabase.functions.invoke('perplexity-api', {
      body: { query },
      // Remove the signal parameter as it's not supported
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
 * Fetches all mortgage-related data in a single consolidated call
 * @param state The state abbreviation (e.g. "CA")
 * @param county The county name
 * @param zipCode The zipcode for insurance estimates
 * @returns A promise that resolves to MortgageDataResponse object or null if the fetch fails
 */
export const fetchAllMortgageData = async (
  state: string,
  county: string,
  zipCode: string
): Promise<MortgageDataResponse | null> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  try {
    console.log(`Fetching all mortgage data for ${state}, ${county}, ${zipCode}...`);
    
    // Start a timeout
    timeoutId = setTimeout(() => {
      throw new Error("Request timed out");
    }, 20000); // 20 second timeout for the comprehensive query
    
    // Craft a single comprehensive query that asks for all the data we need
    const query = `
      I need current mortgage data for ${county}, ${state} (zip: ${zipCode}) in JSON format. Please provide:
      1. The current average 30-year fixed conventional mortgage interest rate
      2. The current average 30-year fixed FHA mortgage interest rate according to Mortgage News Daily
      3. The average property tax rate in ${county}, ${state}
      4. The average annual home insurance premium for a single-family home in ${zipCode}
      
      Respond ONLY with a valid JSON object with these exact keys:
      {
        "conventionalInterestRate": numeric_value,
        "fhaInterestRate": numeric_value,
        "propertyTax": numeric_value,
        "propertyInsurance": numeric_value
      }
      
      Ensure all values are numbers only (no % signs or $ signs), representing percentages and dollar amounts.
    `;

    const rawResponse = await fetchPerplexityData(query);
    clearTimeout(timeoutId);
    
    if (!rawResponse) {
      console.log("Failed to fetch comprehensive mortgage data");
      return null;
    }
    
    console.log("Raw Perplexity response:", rawResponse);
    
    // Extract JSON from potential markdown code block
    // This regex handles JSON inside markdown code blocks or plain JSON
    const jsonString = rawResponse.replace(/```(?:json)?\n?([\s\S]*?)\n?```/, '$1').trim();
    
    try {
      const parsedData = JSON.parse(jsonString);
      
      // Validate the shape of the returned data
      const validatedData: MortgageDataResponse = {
        conventionalInterestRate: validateNumericValue(parsedData.conventionalInterestRate),
        fhaInterestRate: validateNumericValue(parsedData.fhaInterestRate),
        propertyTax: validateNumericValue(parsedData.propertyTax),
        propertyInsurance: validateNumericValue(parsedData.propertyInsurance)
      };
      
      // Check if we got at least some valid data
      const hasAnyValidData = validatedData.conventionalInterestRate !== null || 
                             validatedData.fhaInterestRate !== null || 
                             validatedData.propertyTax !== null || 
                             validatedData.propertyInsurance !== null;
      
      if (!hasAnyValidData) {
        console.error("No valid data found in the response");
        return null;
      }
      
      console.log("Successfully parsed mortgage data:", validatedData);
      return validatedData;
      
    } catch (error) {
      console.error('Error parsing comprehensive mortgage data:', error);
      console.log('Raw JSON string attempted to parse:', jsonString);
      
      // Fallback option: Try to extract values individually using regex pattern matching
      return extractDataWithRegex(rawResponse);
    }
  } catch (error) {
    console.error(`Error in fetchAllMortgageData:`, error);
    
    if (timeoutId) clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      toast.error("API request timed out.");
    } else {
      toast.error("Network error fetching mortgage data.");
    }
    
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

/**
 * Fallback function that uses regex to extract data from the response
 * if JSON parsing fails
 * @param rawText The raw text from the API
 * @returns A MortgageDataResponse object with extracted values or null values
 */
function extractDataWithRegex(rawText: string): MortgageDataResponse {
  console.log("Attempting regex extraction as JSON parsing failed");
  
  const result: MortgageDataResponse = {
    conventionalInterestRate: null,
    fhaInterestRate: null,
    propertyTax: null,
    propertyInsurance: null
  };
  
  // Extract conventional interest rate
  const conventionalMatch = rawText.match(/conventional(?:\s|\w)*rate(?:\s|\w)*?(\d+\.?\d*)/i);
  if (conventionalMatch && conventionalMatch[1]) {
    result.conventionalInterestRate = parseFloat(conventionalMatch[1]);
  }
  
  // Extract FHA interest rate
  const fhaMatch = rawText.match(/fha(?:\s|\w)*rate(?:\s|\w)*?(\d+\.?\d*)/i);
  if (fhaMatch && fhaMatch[1]) {
    result.fhaInterestRate = parseFloat(fhaMatch[1]);
  }
  
  // Extract property tax rate
  const taxMatch = rawText.match(/property\s*tax(?:\s|\w)*?(\d+\.?\d*)/i);
  if (taxMatch && taxMatch[1]) {
    result.propertyTax = parseFloat(taxMatch[1]);
  }
  
  // Extract insurance premium
  const insuranceMatch = rawText.match(/insurance(?:\s|\w)*?(?:\$)?(\d+[,\d]*\.?\d*)/i);
  if (insuranceMatch && insuranceMatch[1]) {
    result.propertyInsurance = parseFloat(insuranceMatch[1].replace(/,/g, ''));
  }
  
  const hasAnyData = result.conventionalInterestRate !== null || 
                    result.fhaInterestRate !== null || 
                    result.propertyTax !== null || 
                    result.propertyInsurance !== null;
                    
  console.log("Regex extraction results:", result, "Data found:", hasAnyData);
  
  return hasAnyData ? result : null;
}

export const getInterestRates = async (state: string): Promise<number | null> => {
  try {
    // For backward compatibility - try to use the consolidated function if county and zipCode are available
    const county = localStorage.getItem("last_county") || state; // Fallback to state if no county
    const zipCode = localStorage.getItem("last_zipcode") || "00000"; // Fallback to generic zipcode
    
    const allData = await fetchAllMortgageData(state, county, zipCode);
    
    if (allData && allData.conventionalInterestRate !== null) {
      return allData.conventionalInterestRate;
    }
    
    // If consolidated function fails or doesn't have this specific data, fall back to the original implementation
    const query = `What is the current average 30-year fixed mortgage interest rate in ${state}? Respond ONLY with a valid JSON object containing a single key "interestRate" and its numeric value (percentage). Example: {"interestRate": 6.25}`;

    const rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      console.log("Failed to fetch interest rate data");
      return null;
    }
    
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString);
    return data.interestRate;
  } catch (error) {
    console.error('Error in getInterestRates:', error);
    toast.error("Error processing interest rate data.");
    return null;
  }
};

export const getFhaInterestRates = async (state: string): Promise<number | null> => {
  try {
    // For backward compatibility - try to use the consolidated function if county and zipCode are available
    const county = localStorage.getItem("last_county") || state; // Fallback to state if no county
    const zipCode = localStorage.getItem("last_zipcode") || "00000"; // Fallback to generic zipcode
    
    const allData = await fetchAllMortgageData(state, county, zipCode);
    
    if (allData && allData.fhaInterestRate !== null) {
      return allData.fhaInterestRate;
    }
    
    // If consolidated function fails or doesn't have this specific data, fall back to the original implementation
    const query = `What is the current average 30-year fixed FHA mortgage interest rate according to Mortgage News Daily? Make sure to return the exact FHA rate, not the conventional rate. Respond ONLY with a valid JSON object containing a single key "interestRate" and its numeric value (percentage). Example: {"interestRate": 6.23}`;

    const rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      console.log("Failed to fetch FHA interest rate data");
      return null;
    }
    
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString);
    return data.interestRate;
  } catch (error) {
    console.error('Error in getFhaInterestRates:', error);
    toast.error("Error processing FHA interest rate data.");
    return null;
  }
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  try {
    // For backward compatibility - try to use the consolidated function if zipCode is available
    const zipCode = localStorage.getItem("last_zipcode") || "00000"; // Fallback to generic zipcode
    
    // Store county for future use
    localStorage.setItem("last_county", county);
    
    const allData = await fetchAllMortgageData(state, county, zipCode);
    
    if (allData && allData.propertyTax !== null) {
      return allData.propertyTax;
    }
    
    // If consolidated function fails or doesn't have this specific data, fall back to the original implementation
    const query = `What is the average property tax rate in ${county}, ${state}? Respond ONLY with a valid JSON object containing a single key "propertyTaxRate" and its numeric value (percentage). Example: {"propertyTaxRate": 1.2}`;

    const rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      console.log("Failed to fetch property tax data");
      return null;
    }
    
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString);
    return data.propertyTaxRate;
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
    
    // For backward compatibility - try to use the consolidated function if county is available
    const county = localStorage.getItem("last_county") || state; // Fallback to state if no county
    
    const allData = await fetchAllMortgageData(state, county, zipCode);
    
    if (allData && allData.propertyInsurance !== null) {
      return allData.propertyInsurance;
    }
    
    // If consolidated function fails or doesn't have this specific data, fall back to the original implementation
    const query = `What is the average annual home insurance premium for a single-family home in ${zipCode} (${state})? Respond ONLY with a valid JSON object containing a single key "annualInsurance" and its numeric value (annual dollar amount). Example: {"annualInsurance": 1200}`;

    const rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      console.log("Failed to fetch insurance data");
      return null;
    }

    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString);
    return data.annualInsurance;
  } catch (error) {
    console.error('Error in getPropertyInsurance:', error);
    toast.error("Error processing insurance data.");
    return null;
  }
};
