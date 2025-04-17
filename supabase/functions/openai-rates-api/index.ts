
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MortgageRatesResponse {
  conventionalInterestRate: number | null;
  fhaInterestRate: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get OpenAI API key
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    // Create OpenAI API request to fetch current mortgage rates
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides accurate, up-to-date information about mortgage rates. Return ONLY a JSON object with the current rates."
          },
          {
            role: "user",
            content: "What are today's current average 30-year fixed mortgage interest rates? I need rates for both conventional and FHA loans. Return ONLY a JSON object with two properties: conventionalInterestRate and fhaInterestRate (both as numbers with 2 decimal places)."
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI API request failed");
    }
    
    const openaiData = await response.json();
    
    // Extract the content from the OpenAI response
    const contentString = openaiData.choices[0]?.message?.content;
    if (!contentString) {
      throw new Error("Invalid response from OpenAI");
    }
    
    // Parse the JSON response
    const ratesData = JSON.parse(contentString);
    
    // Create the mortgage rates response
    const mortgageRates: MortgageRatesResponse = {
      conventionalInterestRate: parseFloat(ratesData.conventionalInterestRate) || null,
      fhaInterestRate: parseFloat(ratesData.fhaInterestRate) || null,
    };
    
    // Return the response
    return new Response(JSON.stringify(mortgageRates), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in openai-rates-api function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your request",
        conventionalInterestRate: null,
        fhaInterestRate: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
