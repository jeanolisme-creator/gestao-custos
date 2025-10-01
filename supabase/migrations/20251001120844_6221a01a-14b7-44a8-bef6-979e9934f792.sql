-- Create schools master table
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome_escola text NOT NULL,
  proprietario text,
  endereco_completo text,
  numero text,
  bairro text,
  macroregiao text,
  telefone_fixo text,
  telefone_celular text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_macroregiao CHECK (macroregiao IN ('HB', 'Vila Toninho', 'Schmidt', 'Represa', 'Bosque', 'Talhado', 'Central', 'Cidade da Criança', 'Pinheirinho', 'Ceu'))
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own schools" 
ON public.schools 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schools" 
ON public.schools 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schools" 
ON public.schools 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schools" 
ON public.schools 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_schools_updated_at
BEFORE UPDATE ON public.schools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_schools_nome ON public.schools(nome_escola);
CREATE INDEX idx_schools_user_id ON public.schools(user_id);