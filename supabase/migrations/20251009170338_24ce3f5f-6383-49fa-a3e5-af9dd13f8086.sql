-- Add column to store individual values for each cadastro in school_records
ALTER TABLE public.school_records
ADD COLUMN IF NOT EXISTS valores_cadastros jsonb DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN public.school_records.valores_cadastros IS 'Array of values corresponding to each cadastro. Each element should match the cadastro at the same index.';