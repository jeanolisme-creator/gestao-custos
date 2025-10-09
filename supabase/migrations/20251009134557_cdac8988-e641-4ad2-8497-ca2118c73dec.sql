-- Add reading date fields to school_records table
ALTER TABLE public.school_records 
ADD COLUMN IF NOT EXISTS data_leitura_anterior date,
ADD COLUMN IF NOT EXISTS data_leitura_atual date;