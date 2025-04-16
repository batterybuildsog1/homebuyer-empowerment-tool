
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types for the response
interface MortgageDataResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
  propertyTax: number | null;
  propertyInsurance: number | null;
  upfrontMIP?: number | null;
  ongoingMIP?: number | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!apiKey) {
      throw new Error("PERPLEXITY_API_KEY environment variable is not set");
    }

    // Parse request body
    const { state, county, zipCode } = await req.json();
    
    if (!state || !zipCode) {
      throw new Error("Missing required parameters: state and zipCode are required");
    }
    
    console.log(`Processing request for ${state}, ${county || "Unknown County"}, ${zipCode}`);

    // In a real implementation, this would call the Perplexity API
    // For now, we'll return hardcoded test data similar to what's in the frontend
    const testData: MortgageDataResponse = {
      conventionalInterestRate: 6.75,
      fhaInterestRate: 6.25,
      propertyTax: 1.1, // National average property tax rate (%)
      propertyInsurance: 1200, // Average annual insurance premium ($)
      upfrontMIP: 1.75, // FHA upfront mortgage insurance premium (%)
      ongoingMIP: 0.55 // FHA ongoing mortgage insurance premium (%)
    };

    // In a production version, we would make API calls like this:
    /*
    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3-sonar-small-32k-online",
        messages: [
          {
            role: "system",
            content: "You are a financial data assistant. Provide current mortgage rates and property information."
          },
          {
            role: "user",
            content: `What are the current conventional and FHA mortgage interest rates, 
                     property tax rates, and average property insurance costs for ${county}, ${state} (ZIP: ${zipCode})?
                     Format your response as a JSON object with the keys: conventionalInterestRate, 
                     fhaInterestRate, propertyTax (percentage), propertyInsurance (annual dollars).`
          }
        ]
      })
    });

    const perplexityData = await perplexityResponse.json();
    // Process and extract data from the response
    */

    // Return the data with CORS headers
    return new Response(JSON.stringify(testData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in perplexity-api function:", error);
    
    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your request" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
