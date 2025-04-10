
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
          error: "API Key not configured on the server",
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get the query from the request body
    const { query, queryType } = await req.json();
    
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
    console.log(`Query type: ${queryType || 'unspecified'}`);
    console.log(`Query: ${query}`);

    // Select the appropriate system message based on query type
    let systemMessage = "";
    
    if (queryType === "mortgageRates") {
      systemMessage = `You are a helpful assistant specializing in mortgage rate data from Mortgage News Daily. 
Provide the most current, up-to-date mortgage rates in JSON format only. No explanations or additional text.
Return ONLY valid JSON with numeric values. Never include percentages symbols (%) in your response.
NEVER include comments, explanations, or non-JSON content in your response.
If you include a JSON block with \`\`\` markers, ensure the JSON is properly formatted.`;
    } else if (queryType === "propertyData") {
      systemMessage = `You are a helpful assistant specializing in real estate tax and insurance data. 
Provide accurate, current property tax rates and insurance premiums for specific locations in JSON format only. No explanations or additional text.
Return ONLY valid JSON with numeric values. Never include percentages symbols (%) or dollar signs ($) in your response.
NEVER include comments, explanations, or non-JSON content in your response.
If you include a JSON block with \`\`\` markers, ensure the JSON is properly formatted.`;
    } else {
      systemMessage = `You are a helpful assistant specializing in real estate and mortgage data. 
Provide accurate, current data in JSON format only. No explanations or additional text.
When asked for mortgage rates or property data, return only valid JSON with numeric values.
NEVER include comments, explanations, or non-JSON content in your response.
If you include a JSON block with \`\`\` markers, ensure the JSON is properly formatted.`;
    }

    // Request to Perplexity API with increased timeout for complex queries
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    try {
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
              content: systemMessage
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle API response
      if (response.ok) {
        const data = await response.json() as PerplexityResponse;
        console.log("Successfully fetched data from Perplexity");
        
        return new Response(
          JSON.stringify({ 
            content: data.choices[0].message.content,
            queryType: queryType || 'general'
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
            error: `Perplexity API Error (${response.status})`
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error in perplexity-api function:", error);
    
    // Check if it's an AbortError (timeout)
    const isTimeout = error.name === "AbortError";
    
    return new Response(
      JSON.stringify({ 
        error: isTimeout ? "Request timed out" : error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: isTimeout ? 504 : 500 
      }
    );
  }
});
