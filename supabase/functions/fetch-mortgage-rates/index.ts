
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Initialize Supabase client with service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

// Response headers
const headers = {
  "Content-Type": "application/json",
};

// Helper function for logging
function logInfo(message: string, data?: any) {
  console.log(`[INFO][${new Date().toISOString()}] ${message}`, data ? JSON.stringify(data) : "");
}

function logError(message: string, error?: any) {
  console.error(`[ERROR][${new Date().toISOString()}] ${message}`, error ? JSON.stringify(error) : "");
}

async function fetchMortgageRatesWithOpenAI(): Promise<{ 
  conventional: number | null; 
  fha: number | null;
  date: string;
}> {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    
    logInfo(`Fetching mortgage rates from OpenAI for ${dateString}`);
    
    // Create OpenAI API request to fetch current mortgage rates
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
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
    
    // Return the mortgage rates
    return {
      conventional: parseFloat(ratesData.conventionalInterestRate) || null,
      fha: parseFloat(ratesData.fhaInterestRate) || null,
      date: dateString
    };
  } catch (error) {
    logError("Error fetching mortgage rates from OpenAI", error);
    throw error;
  }
}

async function storeMortgageRates(rates: { 
  conventional: number | null; 
  fha: number | null;
  date: string;
}) {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if we already have rates for this date
    const { data: existingRates } = await supabase
      .from("daily_mortgage_rates")
      .select("id")
      .eq("rate_date", rates.date)
      .single();
    
    if (existingRates) {
      // Update existing record
      logInfo(`Updating rates for ${rates.date}`, rates);
      const { data, error } = await supabase
        .from("daily_mortgage_rates")
        .update({
          conventional: rates.conventional,
          fha: rates.fha
        })
        .eq("rate_date", rates.date)
        .select();
      
      if (error) {
        throw error;
      }
      
      return { data, updated: true };
    } else {
      // Insert new record
      logInfo(`Inserting new rates for ${rates.date}`, rates);
      const { data, error } = await supabase
        .from("daily_mortgage_rates")
        .insert({
          rate_date: rates.date,
          conventional: rates.conventional,
          fha: rates.fha
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return { data, updated: false };
    }
  } catch (error) {
    logError("Error storing mortgage rates in database", error);
    throw error;
  }
}

serve(async (req) => {
  // Check if this is a scheduled invocation or manual
  const isScheduled = req.headers.get("x-scheduled") === "true";
  const source = isScheduled ? "scheduled" : "manual";
  
  try {
    logInfo(`Starting mortgage rate fetch (source: ${source})`);
    
    // 1. Fetch the latest mortgage rates from OpenAI
    const rates = await fetchMortgageRatesWithOpenAI();
    
    // Validate the rates
    const isConventionalValid = rates.conventional === null || 
      (rates.conventional >= 2 && rates.conventional <= 12);
    const isFHAValid = rates.fha === null || 
      (rates.fha >= 2 && rates.fha <= 12);
    
    if (!isConventionalValid || !isFHAValid) {
      logError("Rate values outside of reasonable range", rates);
      return new Response(
        JSON.stringify({ 
          error: "Rate values outside of reasonable range",
          rates
        }),
        { status: 400, headers }
      );
    }
    
    // 2. Store the rates in the database
    const result = await storeMortgageRates(rates);
    
    // 3. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: result.updated ? "Rates updated" : "New rates inserted",
        date: rates.date,
        rates: {
          conventional: rates.conventional,
          fha: rates.fha
        }
      }),
      { status: 200, headers }
    );
  } catch (error) {
    logError("Error in fetch-mortgage-rates function", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred processing your request"
      }),
      { status: 500, headers }
    );
  }
});
