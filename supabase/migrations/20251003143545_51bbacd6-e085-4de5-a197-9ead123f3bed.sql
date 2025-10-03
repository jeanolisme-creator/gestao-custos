-- Add new columns to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS tipo_escola text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS alunos_creche integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS alunos_infantil integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS alunos_fundamental_i integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS alunos_fundamental_ii integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_alunos integer GENERATED ALWAYS AS (
  COALESCE(alunos_creche, 0) + 
  COALESCE(alunos_infantil, 0) + 
  COALESCE(alunos_fundamental_i, 0) + 
  COALESCE(alunos_fundamental_ii, 0)
) STORED;