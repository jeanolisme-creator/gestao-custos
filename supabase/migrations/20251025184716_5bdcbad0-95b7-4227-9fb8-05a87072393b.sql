-- Backfill mes_ano_referencia for Water records with Feb/2025 due date
-- Some rows have mes_ano_referencia incorrectly set to 'Fevereiro/2025'
-- We standardize to 'Janeiro/2025' as reference month = (data_vencimento - 1 month)

update public.school_records
set mes_ano_referencia = 'Janeiro/2025',
    updated_at = now()
where hidrometro is not null
  and data_vencimento >= date '2025-02-01'
  and data_vencimento <  date '2025-03-01'
  and lower(mes_ano_referencia) = 'fevereiro/2025';