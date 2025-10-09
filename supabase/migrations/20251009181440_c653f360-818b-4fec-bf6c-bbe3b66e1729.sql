-- Add columns to store arrays of dates for each cadastro
ALTER TABLE public.school_records
ADD COLUMN datas_leitura_anterior jsonb,
ADD COLUMN datas_leitura_atual jsonb,
ADD COLUMN datas_vencimento jsonb;