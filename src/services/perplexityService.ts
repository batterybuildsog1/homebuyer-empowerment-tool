
import { toast } from "sonner";

interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
    }
  }[];
}

// Fallback data in case API fails
const fallbackData = {
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
  apiKey: string,
  query: string
): Promise<string | null> => {
  try {
    console.log("Attempting Perplexity API request...");
    
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
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
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_domain_filter: ['perplexity.ai'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json() as PerplexityResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error);
    return null;
  }
};

export const getInterestRates = async (apiKey: string, state: string): Promise<number | null> => {
  try {
    const query = `What is the current average 30-year fixed mortgage interest rate in ${state}? Return only a single numeric value (percentage) as a JSON with the key "interestRate". For example: {"interestRate": 6.25}`;
    
    const response = await fetchPerplexityData(apiKey, query);
    if (!response) {
      // Use fallback data if API fails
      console.log("Using fallback interest rate data");
      const fallbackRate = fallbackData.interestRates.states[state as keyof typeof fallbackData.interestRates.states] || 
                          fallbackData.interestRates.default;
      return fallbackRate;
    }
    
    const data = JSON.parse(response);
    return data.interestRate;
  } catch (error) {
    console.error('Error parsing interest rate data:', error);
    toast.error("Error processing interest rate data. Using fallback data.");
    return fallbackData.interestRates.default;
  }
};

export const getPropertyTaxRate = async (apiKey: string, state: string, county: string): Promise<number | null> => {
  try {
    const query = `What is the average property tax rate in ${county}, ${state}? Return only a single numeric value (percentage) as a JSON with the key "propertyTaxRate". For example: {"propertyTaxRate": 1.2}`;
    
    const response = await fetchPerplexityData(apiKey, query);
    if (!response) {
      // Use fallback data if API fails
      console.log("Using fallback property tax data");
      const fallbackRate = fallbackData.propertyTaxRates.states[state as keyof typeof fallbackData.propertyTaxRates.states] || 
                          fallbackData.propertyTaxRates.default;
      return fallbackRate;
    }
    
    const data = JSON.parse(response);
    return data.propertyTaxRate;
  } catch (error) {
    console.error('Error parsing property tax data:', error);
    toast.error("Error processing property tax data. Using fallback data.");
    return fallbackData.propertyTaxRates.default;
  }
};

export const getPropertyInsurance = async (apiKey: string, state: string, zipCode: string): Promise<number | null> => {
  try {
    const query = `What is the average annual home insurance premium for a single-family home in ${zipCode} (${state})? Return only a single numeric value (annual dollar amount) as a JSON with the key "annualInsurance". For example: {"annualInsurance": 1200}`;
    
    const response = await fetchPerplexityData(apiKey, query);
    if (!response) {
      // Use fallback data if API fails
      console.log("Using fallback insurance data");
      const fallbackRate = fallbackData.annualInsurance.states[state as keyof typeof fallbackData.annualInsurance.states] || 
                          fallbackData.annualInsurance.default;
      return fallbackRate;
    }
    
    const data = JSON.parse(response);
    return data.annualInsurance;
  } catch (error) {
    console.error('Error parsing insurance data:', error);
    toast.error("Error processing insurance data. Using fallback data.");
    return fallbackData.annualInsurance.default;
  }
};
