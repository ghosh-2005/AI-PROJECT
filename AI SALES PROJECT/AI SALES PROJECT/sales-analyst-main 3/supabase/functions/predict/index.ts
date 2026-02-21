import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// PREDICTION SERVICE MODULE
// ============================================

interface AdBudgets {
  tv_budget: number;
  radio_budget: number;
  newspaper_budget: number;
  digital_budget: number;
}

interface PredictionResult {
  predicted_sales: number;
  confidence_score: number;
}

/**
 * Linear regression coefficients derived from advertising data analysis
 * These coefficients represent the relationship between ad spend and sales
 * 
 * Based on typical advertising effectiveness research:
 * - TV has the highest impact per dollar spent
 * - Digital is highly effective for targeted campaigns
 * - Radio provides good reach at lower cost
 * - Newspaper has declining but still measurable impact
 */
const COEFFICIENTS = {
  intercept: 2.939,      // Base sales without advertising
  tv: 0.046,             // Sales increase per $1 TV spend
  radio: 0.189,          // Sales increase per $1 Radio spend
  newspaper: -0.001,     // Newspaper effect (often negative in modern analysis)
  digital: 0.125,        // Sales increase per $1 Digital spend
};

/**
 * Validates input data for prediction
 * Ensures all budget values are non-negative numbers
 */
function validateInput(data: AdBudgets): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (typeof data.tv_budget !== 'number' || data.tv_budget < 0) {
    errors.push('TV budget must be a non-negative number');
  }
  if (typeof data.radio_budget !== 'number' || data.radio_budget < 0) {
    errors.push('Radio budget must be a non-negative number');
  }
  if (typeof data.newspaper_budget !== 'number' || data.newspaper_budget < 0) {
    errors.push('Newspaper budget must be a non-negative number');
  }
  if (typeof data.digital_budget !== 'number' || data.digital_budget < 0) {
    errors.push('Digital budget must be a non-negative number');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Preprocesses budget data
 * Normalizes values and handles edge cases
 */
function preprocessData(data: AdBudgets): AdBudgets {
  return {
    tv_budget: Math.max(0, Number(data.tv_budget) || 0),
    radio_budget: Math.max(0, Number(data.radio_budget) || 0),
    newspaper_budget: Math.max(0, Number(data.newspaper_budget) || 0),
    digital_budget: Math.max(0, Number(data.digital_budget) || 0),
  };
}

/**
 * Core prediction function using multiple linear regression
 * 
 * Model: Sales = β0 + β1*TV + β2*Radio + β3*Newspaper + β4*Digital
 * 
 * This implements a simple but effective linear regression model
 * that can be replaced with a more sophisticated ML model in production
 */
function predictSales(data: AdBudgets): PredictionResult {
  // Calculate predicted sales using linear regression formula
  const predictedSales = 
    COEFFICIENTS.intercept +
    (COEFFICIENTS.tv * data.tv_budget) +
    (COEFFICIENTS.radio * data.radio_budget) +
    (COEFFICIENTS.newspaper * data.newspaper_budget) +
    (COEFFICIENTS.digital * data.digital_budget);
  
  // Calculate confidence score based on input characteristics
  // Higher total budget = more reliable prediction
  const totalBudget = data.tv_budget + data.radio_budget + data.newspaper_budget + data.digital_budget;
  
  // Confidence increases with budget diversity and total spend
  const budgetDiversity = [
    data.tv_budget > 0 ? 1 : 0,
    data.radio_budget > 0 ? 1 : 0,
    data.newspaper_budget > 0 ? 1 : 0,
    data.digital_budget > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0) / 4;
  
  // Sigmoid-based confidence calculation
  const spendFactor = 1 - Math.exp(-totalBudget / 500);
  const confidence = Math.min(0.95, 0.6 + (0.2 * budgetDiversity) + (0.15 * spendFactor));
  
  return {
    predicted_sales: Math.max(0, Number(predictedSales.toFixed(2))),
    confidence_score: Number(confidence.toFixed(4)),
  };
}

/**
 * Formats the response for the client
 */
function formatResponse(
  prediction: PredictionResult, 
  input: AdBudgets,
  id: string
) {
  return {
    success: true,
    data: {
      id,
      ...input,
      ...prediction,
      model_version: '1.0.0',
      algorithm: 'linear_regression',
    },
    metadata: {
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now(),
    },
  };
}

// ============================================
// HTTP REQUEST HANDLER
// ============================================

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log('[PREDICT] Received request:', JSON.stringify(body));

    // Extract budget data
    const inputData: AdBudgets = {
      tv_budget: body.tv_budget,
      radio_budget: body.radio_budget,
      newspaper_budget: body.newspaper_budget,
      digital_budget: body.digital_budget,
    };

    // Validate input
    const validation = validateInput(inputData);
    if (!validation.valid) {
      console.log('[PREDICT] Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ success: false, errors: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preprocess data
    const processedData = preprocessData(inputData);
    console.log('[PREDICT] Preprocessed data:', JSON.stringify(processedData));

    // Run prediction
    const prediction = predictSales(processedData);
    console.log('[PREDICT] Prediction result:', JSON.stringify(prediction));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store prediction in database
    const { data: insertedData, error: dbError } = await supabase
      .from('ads_data')
      .insert({
        ...processedData,
        predicted_sales: prediction.predicted_sales,
        confidence_score: prediction.confidence_score,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[PREDICT] Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store prediction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[PREDICT] Stored in database with ID:', insertedData.id);

    // Format and return response
    const response = formatResponse(prediction, processedData, insertedData.id);
    response.metadata.processing_time_ms = Date.now() - startTime;

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PREDICT] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
