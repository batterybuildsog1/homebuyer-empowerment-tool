
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

// Validate rate is within expected range (3% - 8%)
const isValidRate = (rate: number): boolean => 
  rate >= 3 && rate <= 8;

// Validate spread is within typical MBS range (30-55 bps)
const isValidSpread = (spread: number): boolean => 
  spread >= 30 && spread <= 55;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rates: Record<string, number> = {};

    // Fetch and parse rates from both pages
    for (const [key, config] of Object.entries(MND_CONFIG)) {
      const html = await fetch(config.url).then(r => r.text());
      const $ = cheerio.load(html);
      const rateText = $(config.selector).first().text().replace("%", "").trim();
      const rate = Number(rateText);

      // Validate individual rate
      if (!isValidRate(rate)) {
        throw new Error(`Invalid ${key} rate: ${rate}`);
      }

      rates[key] = rate;
    }

    // Calculate spread
    const spread = Math.round((rates.conventional - rates.fha) * 100);

    // Validate spread
    if (!isValidSpread(spread)) {
      throw new Error(`Invalid spread: ${spread} bps`);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert rates with validation flag
    const { error } = await supabase.from("rates").upsert({
      date: new Date().toISOString().slice(0,10),
      conventional: rates.conventional,
      fha: rates.fha,
      spread_bps: spread,
      valid: true,
      source: 'MND'
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        status: "ok", 
        rates: { ...rates, spread_bps: spread } 
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
