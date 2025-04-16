
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mortgage News Daily URLs and selectors
const MND_CONFIG = {
  conventional: {
    url: "https://www.mortgagenewsdaily.com/mortgage-rates",
    selector: 'tr:contains("MND\'s 30 Year Fixed") td:nth-child(2)'
  },
  fha: {
    url: "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fha",
    selector: 'tr:contains("MND\'s 30 Year FHA") td:nth-child(2)'
  }
};

// Validate rate is within expected range (3% - 9%)
const isValidRate = (rate: number): boolean => 
  rate >= 3 && rate <= 9;

// Validate spread is within typical MBS range (20-75 bps)
const isValidSpread = (spread: number): boolean => 
  spread >= 20 && spread <= 75;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting mortgage rate fetch from MND...");
    const rates: Record<string, number> = {};
    let fetchErrors = [];

    // Fetch and parse rates from both pages
    for (const [key, config] of Object.entries(MND_CONFIG)) {
      try {
        console.log(`Fetching ${key} rate from ${config.url}`);
        const response = await fetch(config.url);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        const rateSelector = $(config.selector).first();
        
        if (rateSelector.length === 0) {
          throw new Error(`Selector "${config.selector}" not found on page`);
        }
        
        const rateText = rateSelector.text().replace("%", "").trim();
        const rate = Number(rateText);
        
        if (isNaN(rate)) {
          throw new Error(`Rate text "${rateText}" is not a valid number`);
        }
        
        console.log(`Found ${key} rate: ${rate}%`);

        // Validate individual rate
        if (!isValidRate(rate)) {
          throw new Error(`Rate ${rate} is outside valid range (3-9%)`);
        }

        rates[key] = rate;
      } catch (error) {
        console.error(`Error fetching ${key} rate:`, error);
        fetchErrors.push(`${key}: ${error.message}`);
      }
    }

    // If we couldn't fetch any rates, return error
    if (Object.keys(rates).length === 0) {
      throw new Error(`Failed to fetch any rates: ${fetchErrors.join("; ")}`);
    }

    // If we have both rates, calculate and validate spread
    let spreadBps = null;
    let isValid = false;

    if (rates.conventional && rates.fha) {
      // Calculate spread in basis points
      spreadBps = Math.round((rates.conventional - rates.fha) * 100);
      console.log(`Calculated spread: ${spreadBps} bps`);

      // Validate spread
      isValid = isValidSpread(spreadBps);
      if (!isValid) {
        console.warn(`Spread of ${spreadBps} bps is outside expected range (20-75 bps)`);
      }
    } else {
      console.warn("Could not calculate spread - missing one or more rates");
      if (rates.conventional || rates.fha) {
        // If we have at least one rate, consider it valid for storage
        isValid = true;
      }
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().slice(0,10);
    console.log(`Saving rates for date: ${today}`);

    // Prepare data for insertion
    const rateData = {
      date: today,
      conventional: rates.conventional || null,
      fha: rates.fha || null,
      spread_bps: spreadBps,
      valid: isValid,
      source: 'MND'
    };

    // Upsert rates
    const { error } = await supabase
      .from("rates")
      .upsert(rateData);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Successfully saved rates to database:", rateData);

    return new Response(
      JSON.stringify({ 
        status: "ok", 
        date: today,
        rates: { 
          conventional: rates.conventional || null, 
          fha: rates.fha || null, 
          spread_bps: spreadBps 
        },
        valid: isValid,
        errors: fetchErrors.length > 0 ? fetchErrors : undefined
      }), 
      { headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders 
      }}
    );

  } catch (error) {
    console.error("Rate fetch error:", error);
    
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        } 
      }
    );
  }
});
