import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// HISTORY SERVICE MODULE
// ============================================

interface PaginationParams {
  page: number;
  limit: number;
}

interface HistoryResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Parses and validates pagination parameters from URL
 */
function parsePaginationParams(url: URL): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
  
  return { page, limit };
}

/**
 * Formats the paginated response
 */
function formatPaginatedResponse(
  data: any[],
  total: number,
  params: PaginationParams
): HistoryResponse {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    success: true,
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      total_pages: totalPages,
      has_next: params.page < totalPages,
      has_prev: params.page > 1,
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

  try {
    // Only accept GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse URL and pagination params
    const url = new URL(req.url);
    const params = parsePaginationParams(url);
    console.log('[HISTORY] Request params:', JSON.stringify(params));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('ads_data')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[HISTORY] Count error:', countError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch count' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate offset
    const offset = (params.page - 1) * params.limit;

    // Fetch paginated data ordered by creation time (newest first)
    const { data, error: fetchError } = await supabase
      .from('ads_data')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + params.limit - 1);

    if (fetchError) {
      console.error('[HISTORY] Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch history' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[HISTORY] Fetched', data?.length || 0, 'records');

    // Format and return response
    const response = formatPaginatedResponse(data || [], count || 0, params);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[HISTORY] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
