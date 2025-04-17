
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

// Create Supabase client
const supabaseUrl = 'https://thcmyhermklehzjdmhio.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("GET request received for mortgage rates")
    
    // Query the database for the latest rates
    const { data: latestRates, error } = await supabase
      .from('daily_mortgage_rates')
      .select('rate_date, conventional, fha')
      .order('rate_date', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error("Database query error:", error)
      throw error
    }
    
    if (!latestRates || latestRates.length === 0) {
      console.log("No rates found in database")
      
      // Return error response if no data found
      return new Response(
        JSON.stringify({
          success: false,
          message: "No mortgage rates available in the database",
          error: "No data found"
        }),
        { status: 404, headers: corsHeaders }
      )
    }
    
    // Calculate data age
    const rateDate = new Date(latestRates[0].rate_date);
    const now = new Date();
    const ageInDays = Math.round((now.getTime() - rateDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format the response with the latest rates
    const responseData = {
      success: true,
      data: {
        conventionalInterestRate: latestRates[0].conventional,
        fhaInterestRate: latestRates[0].fha,
        rateDate: latestRates[0].rate_date,
        source: "database",
        fromCache: true,
        ageInDays: ageInDays
      }
    }
    
    console.log("Successfully retrieved rates:", responseData)
    return new Response(JSON.stringify(responseData), { headers: corsHeaders })
    
  } catch (error) {
    console.error("Error in get-mortgage-rates function:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to retrieve mortgage rates",
        data: null
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})
