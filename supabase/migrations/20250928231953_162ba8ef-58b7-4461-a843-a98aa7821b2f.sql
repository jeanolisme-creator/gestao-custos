-- Create table for school demand management
CREATE TABLE public.school_demand_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome_escola TEXT NOT NULL,
  endereco_completo TEXT,
  numero TEXT,
  bairro TEXT,
  macroregiao TEXT,
  telefone TEXT,
  email TEXT,
  alunos_creche INTEGER DEFAULT 0,
  alunos_infantil INTEGER DEFAULT 0,
  alunos_fundamental_i INTEGER DEFAULT 0,
  alunos_fundamental_ii INTEGER DEFAULT 0,
  total_alunos INTEGER GENERATED ALWAYS AS (alunos_creche + alunos_infantil + alunos_fundamental_i + alunos_fundamental_ii) STORED,
  alunos_por_turma INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.school_demand_records ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own school demand records"
ON public.school_demand_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own school demand records"
ON public.school_demand_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own school demand records"
ON public.school_demand_records
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own school demand records"
ON public.school_demand_records
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_school_demand_records_updated_at
BEFORE UPDATE ON public.school_demand_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();