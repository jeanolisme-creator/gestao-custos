-- Adicionar coluna retencao_irrf na tabela energy_records
ALTER TABLE public.energy_records 
ADD COLUMN IF NOT EXISTS retencao_irrf numeric DEFAULT 0;