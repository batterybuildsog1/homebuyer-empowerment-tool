
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

// Fallback test values - used only if no data available in database
const TEST_DATA = {
  conventionalInterestRate: 6.75,
  fhaInterestRate: 6.25,
  propertyTax: 1.1,
  propertyInsurance: 1200,
  upfrontMIP: 1.75,
  ongoingMIP: 0.55
}

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
      console.log("No rates found in database, returning test data")
      
      // Return test data if no rates found
      return new Response(
        JSON.stringify({
          success: true,
          message: "No rates found in database, returning test data",
          data: {
            conventionalInterestRate: TEST_DATA.conventionalInterestRate,
            fhaInterestRate: TEST_DATA.fhaInterestRate,
            propertyTax: TEST_DATA.propertyTax,
            propertyInsurance: TEST_DATA.propertyInsurance,
            upfrontMIP: TEST_DATA.upfrontMIP,
            ongoingMIP: TEST_DATA.ongoingMIP,
            rateDate: new Date().toISOString().split('T')[0],
            source: "test_data"
          }
        }),
        { headers: corsHeaders }
      )
    }
    
    // Format the response with the latest rates
    const responseData = {
      success: true,
      data: {
        conventionalInterestRate: latestRates[0].conventional,
        fhaInterestRate: latestRates[0].fha,
        propertyTax: TEST_DATA.propertyTax,
        propertyInsurance: TEST_DATA.propertyInsurance,
        upfrontMIP: TEST_DATA.upfrontMIP,
        ongoingMIP: TEST_DATA.ongoingMIP,
        rateDate: latestRates[0].rate_date,
        source: "database"
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
