-- Create the ads_data table for storing prediction history
CREATE TABLE public.ads_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tv_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  radio_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  newspaper_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  digital_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  predicted_sales DECIMAL(12,2) NOT NULL,
  confidence_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ads_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no auth required for this demo)
CREATE POLICY "Anyone can view predictions" 
ON public.ads_data 
FOR SELECT 
USING (true);

-- Create policy for public insert (no auth required for this demo)
CREATE POLICY "Anyone can create predictions" 
ON public.ads_data 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads_data;