
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

// Simple in-memory cache for rate limiting
// This will reset when the function is redeployed
const rateLimitCache = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT = 5; // 5 calls per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour in milliseconds

function logInfo(message: string, data?: any) {
  console.log(`[INFO][${new Date().toISOString()}] ${message}`, data ? data : '');
}

function logError(message: string, error?: any) {
  console.error(`[ERROR][${new Date().toISOString()}] ${message}`, error ? error : '');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logInfo("Received request for mortgage rates");
    
    // Get client IP for rate limiting
    // In a production environment, you would use a more reliable client identifier
    const clientIP = req.headers.get("x-forwarded-for") || "unknown-client";
    
    // Check rate limit
    const now = Date.now();
    const clientRateLimit = rateLimitCache.get(clientIP);
    
    if (clientRateLimit) {
      // Reset count if the window has passed
      if (now > clientRateLimit.resetTime) {
        rateLimitCache.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      } else if (clientRateLimit.count >= RATE_LIMIT) {
        // Rate limit exceeded
        logInfo(`Rate limit exceeded for client: ${clientIP}`);
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again later.",
            conventionalInterestRate: null,
            fhaInterestRate: null
          }),
          {
            status: 429,
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "X-RateLimit-Limit": RATE_LIMIT.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": new Date(clientRateLimit.resetTime).toUTCString()
            },
          }
        );
      } else {
        // Increment count
        clientRateLimit.count += 1;
        rateLimitCache.set(clientIP, clientRateLimit);
      }
    } else {
      // First request from this client
      rateLimitCache.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }
    
    // Log remaining rate limit
    const updatedLimit = rateLimitCache.get(clientIP);
    logInfo(`Rate limit for client ${clientIP}: ${updatedLimit?.count}/${RATE_LIMIT}`);
    
    // Get OpenAI API key
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      logError("OPENAI_API_KEY environment variable is not set");
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    logInfo("Fetching mortgage rates from OpenAI");
    
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
      logError("OpenAI API request failed", errorData);
      throw new Error(errorData.error?.message || "OpenAI API request failed");
    }
    
    const openaiData = await response.json();
    logInfo("Received response from OpenAI", { model: openaiData.model, usage: openaiData.usage });
    
    // Extract the content from the OpenAI response
    const contentString = openaiData.choices[0]?.message?.content;
    if (!contentString) {
      logError("Invalid response from OpenAI", openaiData);
      throw new Error("Invalid response from OpenAI");
    }
    
    // Parse the JSON response
    const ratesData = JSON.parse(contentString);
    logInfo("Parsed rate data", ratesData);
    
    // Create the mortgage rates response
    const mortgageRates: MortgageRatesResponse = {
      conventionalInterestRate: parseFloat(ratesData.conventionalInterestRate) || null,
      fhaInterestRate: parseFloat(ratesData.fhaInterestRate) || null,
    };
    
    // Validate the rates (ensure they're reasonable)
    const isConventionalValid = mortgageRates.conventionalInterestRate === null || 
      (mortgageRates.conventionalInterestRate >= 2 && mortgageRates.conventionalInterestRate <= 12);
    const isFHAValid = mortgageRates.fhaInterestRate === null || 
      (mortgageRates.fhaInterestRate >= 2 && mortgageRates.fhaInterestRate <= 12);
    
    if (!isConventionalValid || !isFHAValid) {
      logError("Rate values outside of reasonable range", mortgageRates);
      
      if (!isConventionalValid) {
        mortgageRates.conventionalInterestRate = null;
      }
      
      if (!isFHAValid) {
        mortgageRates.fhaInterestRate = null;
      }
    }
    
    logInfo("Returning mortgage rates", mortgageRates);
    
    // Return the response with rate limit headers
    const remainingCalls = RATE_LIMIT - (rateLimitCache.get(clientIP)?.count || 0);
    return new Response(JSON.stringify(mortgageRates), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "X-RateLimit-Limit": RATE_LIMIT.toString(),
        "X-RateLimit-Remaining": remainingCalls.toString(),
        "X-RateLimit-Reset": new Date(rateLimitCache.get(clientIP)?.resetTime || 0).toUTCString()
      },
    });
    
  } catch (error) {
    logError("Error in openai-rates-api function", error);
    
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
