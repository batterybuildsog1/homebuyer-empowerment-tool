
import { toast } from "sonner";

interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
    }
  }[];
}

// Fallback data in case API fails - Export it
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

const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error("Perplexity API key not found in environment variables (VITE_PERPLEXITY_API_KEY).");
  toast.error("API Key Error: Perplexity API key is missing. Please configure it in your environment.");
}

const MODEL_NAME = 'sonar-pro'; // Use the recommended search model

export const fetchPerplexityData = async (
  query: string
): Promise<string | null> => {
  if (!PERPLEXITY_API_KEY) {
    return null; // Don't proceed if key is missing
  }

  let timeoutId: NodeJS.Timeout | undefined; // Declare timeoutId here
  try {
    console.log(`Attempting Perplexity API request with model: ${MODEL_NAME}...`);

    // Add timeout to the fetch request
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME, // Use the specified model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant specializing in real estate and mortgage data. Provide accurate, current data in JSON format only. No explanations or additional text.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
        // Removed unsupported parameters
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear timeout once fetch completes or errors

    // Handle successful response
    if (response.ok) {
      const data = await response.json() as PerplexityResponse; // Keep type assertion
      console.log(`Successfully fetched data with model: ${MODEL_NAME}`);
      return data.choices[0].message.content;
    }

    // Log error if response is not ok
    const errorText = await response.text();
    console.error(`API returned status: ${response.status} for model ${MODEL_NAME}`);
    console.error(`Error details: ${errorText}`);
    toast.error(`Perplexity API Error (${response.status}): Failed to fetch data. Using fallback.`);
    return null; // Return null on API error

  } catch (error) {
    console.error(`Error fetching data with model ${MODEL_NAME}:`, error);
    // Clear timeout if fetch itself failed (e.g., network error or abort)
    if (timeoutId) clearTimeout(timeoutId); // Check if timeoutId exists before clearing
    
    if (error instanceof Error && error.name === 'AbortError') {
      toast.error("Perplexity API request timed out. Using fallback data.");
    } else {
      toast.error("Network error fetching Perplexity data. Using fallback data.");
    }
    return null; // Return null on fetch error
  }
};

export const getInterestRates = async (state: string): Promise<number | null> => {
  let rawResponse: string | null = null; // Variable to hold the raw response for logging
  try {
    // Updated query to explicitly request only the JSON object
    const query = `What is the current average 30-year fixed mortgage interest rate in ${state}? Respond ONLY with a valid JSON object containing a single key "interestRate" and its numeric value (percentage). Example: {"interestRate": 6.25}`;

    rawResponse = await fetchPerplexityData(query); // Assign to rawResponse
    if (!rawResponse) { // Check rawResponse
      // Use fallback data if API fails or key is missing
      console.log("Using fallback interest rate data");
      const fallbackRate = fallbackData.interestRates.states[state as keyof typeof fallbackData.interestRates.states] || 
                          fallbackData.interestRates.default;
      return fallbackRate;
    }
    
    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString); // Parse the extracted string
    return data.interestRate;
  } catch (error) {
    console.error('Error parsing interest rate data:', error, 'Raw response:', rawResponse); // Log rawResponse on error
    toast.error("Error processing interest rate data. Using fallback data.");
    return fallbackData.interestRates.default;
  }
};

export const getPropertyTaxRate = async (state: string, county: string): Promise<number | null> => {
  let rawResponse: string | null = null; // Variable to hold the raw response for logging
  try {
    // Updated query to explicitly request only the JSON object
    const query = `What is the average property tax rate in ${county}, ${state}? Respond ONLY with a valid JSON object containing a single key "propertyTaxRate" and its numeric value (percentage). Example: {"propertyTaxRate": 1.2}`;

    rawResponse = await fetchPerplexityData(query); // Assign to rawResponse
    if (!rawResponse) { // Check rawResponse
      // Use fallback data if API fails or key is missing
      console.log("Using fallback property tax data");
      const fallbackRate = fallbackData.propertyTaxRates.states[state as keyof typeof fallbackData.propertyTaxRates.states] || 
                          fallbackData.propertyTaxRates.default;
      return fallbackRate;
    }
    
    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString); // Parse the extracted string
    return data.propertyTaxRate;
  } catch (error) {
    console.error('Error parsing property tax data:', error, 'Raw response:', rawResponse); // Log rawResponse on error
    toast.error("Error processing property tax data. Using fallback data.");
    return fallbackData.propertyTaxRates.default;
  }
};

export const getPropertyInsurance = async (state: string, zipCode: string): Promise<number | null> => {
  let rawResponse: string | null = null; // Variable to hold the raw response for logging
  try {
    // Updated query to explicitly request only the JSON object
    const query = `What is the average annual home insurance premium for a single-family home in ${zipCode} (${state})? Respond ONLY with a valid JSON object containing a single key "annualInsurance" and its numeric value (annual dollar amount). Example: {"annualInsurance": 1200}`;

    rawResponse = await fetchPerplexityData(query); // Assign to rawResponse
    if (!rawResponse) { // Check rawResponse
      // Use fallback data if API fails or key is missing
      console.log("Using fallback insurance data");
      const fallbackRate = fallbackData.annualInsurance.states[state as keyof typeof fallbackData.annualInsurance.states] || 
                          fallbackData.annualInsurance.default;
      return fallbackRate;
    }

    // Extract JSON from potential markdown code block
    const jsonString = rawResponse.replace(/```json\n?([\s\S]*?)\n?```/, '$1').trim();
    const data = JSON.parse(jsonString); // Parse the extracted string
    return data.annualInsurance;
  } catch (error) {
    console.error('Error parsing insurance data:', error, 'Raw response:', rawResponse); // Log rawResponse on error
    toast.error("Error processing insurance data. Using fallback data.");
    return fallbackData.annualInsurance.default;
  }
};
