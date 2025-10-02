-- Add signing_date column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN signing_date date;