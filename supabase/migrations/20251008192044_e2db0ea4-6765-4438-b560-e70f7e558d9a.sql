-- Add missing columns to school_records table for water management system
ALTER TABLE public.school_records
ADD COLUMN IF NOT EXISTS proprietario text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS macroregiao text;