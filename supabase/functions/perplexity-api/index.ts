
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Configure CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define the model name used for the API
const MODEL_NAME = 'sonar-pro';

// Interface for Perplexity API response
interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
    }
  }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment variables
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!PERPLEXITY_API_KEY) {
      console.error("Perplexity API key not found in environment variables");
      return new Response(
        JSON.stringify({ 
          error: "API Key not configured",
          useFallback: true 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get the query from the request body
    const { query } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Attempting Perplexity API request with model: ${MODEL_NAME}...`);
    console.log(`Query: ${query}`);

    // Request to Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
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
      }),
    });

    // Handle API response
    if (response.ok) {
      const data = await response.json() as PerplexityResponse;
      console.log("Successfully fetched data from Perplexity");
      
      return new Response(
        JSON.stringify({ 
          content: data.choices[0].message.content
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      // Log error details
      const errorText = await response.text();
      console.error(`API returned status: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Perplexity API Error (${response.status})`,
          useFallback: true 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      );
    }
  } catch (error) {
    console.error("Error in perplexity-api function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        useFallback: true 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
