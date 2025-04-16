
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting mortgage rate fetch from MND...");
    
    // Simplified approach - just fetch conventional rate
    const response = await fetch("https://www.mortgagenewsdaily.com/mortgage-rates");
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const rateSelector = $('tr:contains("30 Year Fixed") td:nth-child(2)').first();
    
    if (rateSelector.length === 0) {
      throw new Error("Rate selector not found on page");
    }
    
    const rateText = rateSelector.text().replace("%", "").trim();
    const rate = Number(rateText);
    
    if (isNaN(rate)) {
      throw new Error(`Rate text "${rateText}" is not a valid number`);
    }
    
    console.log(`Found rate: ${rate}%`);

    // Validate rate is reasonable (3-8%)
    if (rate < 3 || rate > 8) {
      throw new Error(`Rate ${rate} is outside valid range (3-8%)`);
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, 
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().slice(0,10);
    console.log(`Saving rate for date: ${today}`);

    // Simplified data structure
    const rateData = {
      date: today,
      conventional: rate,
      source: 'MND'
    };

    // Upsert rate
    const { error } = await supabase
      .from("rates")
      .upsert(rateData);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Successfully saved rate to database:", rateData);

    return new Response(
      JSON.stringify({ 
        status: "ok", 
        date: today,
        rate: rate
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
