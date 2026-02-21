/**
 * API Service Module
 * Handles all communication with the backend prediction service
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface AdBudgetInput {
  tv_budget: number;
  radio_budget: number;
  newspaper_budget: number;
  digital_budget: number;
}

export interface PredictionResult {
  id: string;
  tv_budget: number;
  radio_budget: number;
  newspaper_budget: number;
  digital_budget: number;
  predicted_sales: number;
  confidence_score: number;
  model_version: string;
  algorithm: string;
}

export interface PredictionResponse {
  success: boolean;
  data?: PredictionResult;
  error?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    processing_time_ms: number;
  };
}

export interface HistoryItem {
  id: string;
  tv_budget: number;
  radio_budget: number;
  newspaper_budget: number;
  digital_budget: number;
  predicted_sales: number;
  confidence_score: number;
  created_at: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: HistoryItem[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Calls the prediction API endpoint
 */
export async function predictSales(input: AdBudgetInput): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.errors?.join(', ') || 'Prediction failed',
        errors: data.errors,
      };
    }

    return data;
  } catch (error) {
    console.error('Prediction API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Fetches prediction history with pagination
 */
export async function fetchHistory(page: number = 1, limit: number = 10): Promise<HistoryResponse> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/history?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch history',
      };
    }

    return data;
  } catch (error) {
    console.error('History API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
