
import { toast } from "sonner";

interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
    }
  }[];
}

export const fetchPerplexityData = async (
  apiKey: string,
  query: string
): Promise<string | null> => {
  try {
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
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json() as PerplexityResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error);
    toast.error("Failed to fetch data. Please try again.");
    return null;
  }
};

export const getInterestRates = async (apiKey: string, state: string): Promise<number | null> => {
  const query = `What is the current average 30-year fixed mortgage interest rate in ${state}? Return only a single numeric value (percentage) as a JSON with the key "interestRate". For example: {"interestRate": 6.25}`;
  
  const response = await fetchPerplexityData(apiKey, query);
  if (!response) return null;
  
  try {
    const data = JSON.parse(response);
    return data.interestRate;
  } catch (error) {
    console.error('Error parsing interest rate data:', error);
    return null;
  }
};

export const getPropertyTaxRate = async (apiKey: string, state: string, county: string): Promise<number | null> => {
  const query = `What is the average property tax rate in ${county}, ${state}? Return only a single numeric value (percentage) as a JSON with the key "propertyTaxRate". For example: {"propertyTaxRate": 1.2}`;
  
  const response = await fetchPerplexityData(apiKey, query);
  if (!response) return null;
  
  try {
    const data = JSON.parse(response);
    return data.propertyTaxRate;
  } catch (error) {
    console.error('Error parsing property tax data:', error);
    return null;
  }
};

export const getPropertyInsurance = async (apiKey: string, state: string, zipCode: string): Promise<number | null> => {
  const query = `What is the average annual home insurance premium for a single-family home in ${zipCode} (${state})? Return only a single numeric value (annual dollar amount) as a JSON with the key "annualInsurance". For example: {"annualInsurance": 1200}`;
  
  const response = await fetchPerplexityData(apiKey, query);
  if (!response) return null;
  
  try {
    const data = JSON.parse(response);
    return data.annualInsurance;
  } catch (error) {
    console.error('Error parsing insurance data:', error);
    return null;
  }
};
