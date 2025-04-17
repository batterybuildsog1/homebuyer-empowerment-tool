
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0';
import { corsHeaders } from '../_shared/cors.ts';

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://thcmyhermklehzjdmhio.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// OpenAI API Key
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Validation constants
const MIN_TAX_RATE = 0.1; // 0.1%
const MAX_TAX_RATE = 5.0; // 5%
const MIN_INSURANCE = 300; // $300
const MAX_INSURANCE = 10000; // $10,000
const DATA_TTL_DAYS = 90; // 3 months

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { state, county } = await req.json();
    
    if (!state || !county) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: state and county' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing request for ${county}, ${state}`);

    // 1. Check if we have fresh data in the cache
    const { data: cachedData, error: cacheError } = await supabase
      .from('county_property_data')
      .select('*')
      .eq('state', state)
      .eq('county', county)
      .maybeSingle();

    // If we found valid data that's recent enough, return it
    if (cachedData && !cacheError) {
      const lastFetched = new Date(cachedData.last_fetched);
      const ageInDays = (Date.now() - lastFetched.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageInDays < DATA_TTL_DAYS) {
        console.log(`Using cached data for ${county}, ${state} (${ageInDays.toFixed(1)} days old)`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cachedData, 
            fromCache: true,
            ageInDays: Math.round(ageInDays)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Cached data for ${county}, ${state} is stale (${ageInDays.toFixed(1)} days old)`);
    } else {
      console.log(`No cached data found for ${county}, ${state}`);
    }

    // 2. Fetch new data from OpenAI
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'OpenAI API key not configured'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching fresh data for ${county}, ${state} from OpenAI`);
    
    // Create the prompt for GPT-4o-mini
    const prompt = `
You are a financial data assistant focused on US property taxes and insurance.
Provide a JSON object with three keys:
- "primary_tax": Annual property tax rate (%) for primary residences in ${county}, ${state}.
- "general_tax": Annual property tax rate (%) for non-primary residences in ${county}, ${state}.
- "insurance": Average annual homeowner's insurance premium in dollars for a median-priced home in ${county}, ${state}.

Important guidelines:
- Property tax rates should be expressed as percentages (e.g., 1.2 for 1.2%)
- Insurance should be expressed as a whole dollar amount (e.g., 1200)
- Be as accurate as possible based on the most recent data
- If the county doesn't differentiate between primary and non-primary residences, provide the same value for both rates

Return only valid JSON.
`.trim();

    // Call OpenAI API
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that returns ONLY JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`OpenAI API error: ${aiResponse.status}`, errorText);
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    let countyData;
    
    try {
      // Parse the JSON response from OpenAI
      const content = aiResult.choices[0].message.content;
      countyData = JSON.parse(content);
      
      // Validate the data
      if (typeof countyData.primary_tax !== 'number' || 
          typeof countyData.general_tax !== 'number' || 
          typeof countyData.insurance !== 'number') {
        throw new Error('Invalid data types in OpenAI response');
      }
      
      // Ensure values are within reasonable ranges
      countyData.primary_tax = Math.max(MIN_TAX_RATE, Math.min(MAX_TAX_RATE, countyData.primary_tax));
      countyData.general_tax = Math.max(MIN_TAX_RATE, Math.min(MAX_TAX_RATE, countyData.general_tax));
      countyData.insurance = Math.max(MIN_INSURANCE, Math.min(MAX_INSURANCE, countyData.insurance));
      
      console.log(`Successfully parsed data: ${JSON.stringify(countyData)}`);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw content:', aiResult.choices[0].message.content);
      
      // Fallback to default values if parsing fails
      countyData = {
        primary_tax: 1.1,  // National average-ish
        general_tax: 1.35, // Slightly higher for non-primary
        insurance: 1200    // Reasonable default
      };
      console.log(`Using fallback data: ${JSON.stringify(countyData)}`);
    }

    // 3. Upsert data to the database
    const upsertData = {
      state,
      county,
      primary_tax: countyData.primary_tax,
      general_tax: countyData.general_tax,
      insurance: countyData.insurance,
      last_fetched: new Date().toISOString()
    };

    const { error: upsertError } = await supabase
      .from('county_property_data')
      .upsert(upsertData, { onConflict: 'state,county' });

    if (upsertError) {
      console.error('Error upserting data to Supabase:', upsertError);
      // Continue, as we still want to return the data even if upsert fails
    } else {
      console.log(`Successfully stored data for ${county}, ${state}`);
    }

    // 4. Return the data
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: upsertData, 
        fromCache: false,
        source: 'openai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in get-county-data function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
