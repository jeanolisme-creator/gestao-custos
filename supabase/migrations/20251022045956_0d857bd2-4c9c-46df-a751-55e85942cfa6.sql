-- Backup query (execute manualmente se precisar recuperar):
-- SELECT * FROM school_records WHERE mes_ano_referencia ILIKE '%dezembro/2024%' OR mes_ano_referencia ILIKE '%dez/2024%' OR mes_ano_referencia ILIKE '%12/2024%';

-- Deletar todos os registros de dezembro/2024
DELETE FROM public.school_records 
WHERE mes_ano_referencia ILIKE '%dezembro/2024%' 
   OR mes_ano_referencia ILIKE '%dez/2024%' 
   OR mes_ano_referencia ILIKE '%12/2024%';