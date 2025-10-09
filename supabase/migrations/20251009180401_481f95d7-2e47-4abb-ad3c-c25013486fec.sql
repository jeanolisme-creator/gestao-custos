-- Add columns to store arrays of consumo_m3 and numero_dias for each cadastro
ALTER TABLE public.school_records
ADD COLUMN consumos_m3 jsonb,
ADD COLUMN numeros_dias jsonb;