-- Adicionar colunas de datas de leitura na tabela energy_records
ALTER TABLE public.energy_records 
ADD COLUMN IF NOT EXISTS data_leitura_anterior date,
ADD COLUMN IF NOT EXISTS data_leitura_atual date;