
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

    // Make the actual API call to Perplexity
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

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    
    // Extract the content from the response
    const content = perplexityData.choices[0].message.content;
    
    // Parse the content to extract the mortgage data
    // The content might be a JSON string or might have explanatory text
    // We need to extract just the JSON part
    let jsonMatch;
    try {
      // First try to parse the entire content as JSON
      const mortgageData = JSON.parse(content);
      return new Response(JSON.stringify(mortgageData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      // If that fails, try to extract a JSON object from the text
      jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON data from Perplexity response");
      }
      
      // Try to parse the extracted JSON
      const extractedData = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(extractedData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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
