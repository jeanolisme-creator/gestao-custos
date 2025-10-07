-- Create table for outsourced position quotas per school
CREATE TABLE IF NOT EXISTS public.outsourced_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  school_id UUID NULL,
  school_name TEXT NOT NULL,
  position TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_outsourced_quotas_user_school_position UNIQUE (user_id, school_name, position)
);

-- Enable RLS
ALTER TABLE public.outsourced_quotas ENABLE ROW LEVEL SECURITY;

-- Policies: only owner can CRUD
CREATE POLICY "Users can view their own outsourced quotas"
ON public.outsourced_quotas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own outsourced quotas"
ON public.outsourced_quotas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outsourced quotas"
ON public.outsourced_quotas
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outsourced quotas"
ON public.outsourced_quotas
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to maintain updated_at
CREATE TRIGGER update_outsourced_quotas_updated_at
BEFORE UPDATE ON public.outsourced_quotas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();