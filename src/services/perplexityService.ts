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

export const getInterestRates = async (state: string): Promise<number | null> => {
  let rawResponse: string | null = null;
  try {
    // Updated query to explicitly request only the JSON object
    const query = `What is the current average 30-year fixed mortgage interest rate in ${state}? Respond ONLY with a valid JSON object containing a single key "interestRate" and its numeric value (percentage). Example: {"interestRate": 6.25}`;

    rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      // Return null if API fails, don't use fallback
      console.log("Failed to fetch interest rate data");
      return null;
    }
    
    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString); // Parse the extracted string
    return data.interestRate;
  } catch (error) {
    console.error('Error parsing interest rate data:', error, 'Raw response:', rawResponse);
    toast.error("Error processing interest rate data.");
    return null;
  }
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  let rawResponse: string | null = null;
  try {
    // Updated query to explicitly request only the JSON object
    const query = `What is the average property tax rate in ${county}, ${state}? Respond ONLY with a valid JSON object containing a single key "propertyTaxRate" and its numeric value (percentage). Example: {"propertyTaxRate": 1.2}`;

    rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      // Return null if API fails, don't use fallback
      console.log("Failed to fetch property tax data");
      return null;
    }
    
    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString); // Parse the extracted string
    return data.propertyTaxRate;
  } catch (error) {
    console.error('Error parsing property tax data:', error, 'Raw response:', rawResponse);
    toast.error("Error processing property tax data.");
    return null;
  }
};

export const getPropertyInsurance = async (state: string, zipCode: string): Promise<number | null> => {
  let rawResponse: string | null = null;
  try {
    // Updated query to explicitly request only the JSON object
    const query = `What is the average annual home insurance premium for a single-family home in ${zipCode} (${state})? Respond ONLY with a valid JSON object containing a single key "annualInsurance" and its numeric value (annual dollar amount). Example: {"annualInsurance": 1200}`;

    rawResponse = await fetchPerplexityData(query);
    if (!rawResponse) {
      // Return null if API fails, don't use fallback
      console.log("Failed to fetch insurance data");
      return null;
    }

    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString); // Parse the extracted string
    return data.annualInsurance;
  } catch (error) {
    console.error('Error parsing insurance data:', error, 'Raw response:', rawResponse);
    toast.error("Error processing insurance data.");
    return null;
  }
};
