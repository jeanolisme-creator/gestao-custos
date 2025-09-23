-- Create tables for different utility systems

-- Energy records table
CREATE TABLE public.energy_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cadastro_cliente text NOT NULL,
  relogio text,
  tipo_instalacao text, -- 'BAIXA' or 'MEDIA/ALTA'
  demanda_kwh numeric,
  unidade text,
  proprietario text,
  endereco text,
  numero text,
  bairro text,
  macroregiao text,
  tipo_escola text,
  nome_escola text NOT NULL,
  responsavel text,
  mes_ano_referencia text NOT NULL,
  consumo_kwh numeric,
  valor_gasto numeric,
  valor_servicos numeric,
  numero_dias integer,
  data_vencimento date,
  ocorrencias_pendencias text,
  descricao_servicos text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fixed line records table
CREATE TABLE public.fixed_line_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cadastro_cliente text NOT NULL,
  nome_escola text NOT NULL,
  numero_linha text,
  proprietario text,
  endereco text,
  numero text,
  bairro text,
  macroregiao text,
  tipo_escola text,
  responsavel text,
  mes_ano_referencia text NOT NULL,
  valor_gasto numeric,
  valor_servicos numeric,
  numero_dias integer,
  data_vencimento date,
  ocorrencias_pendencias text,
  descricao_servicos text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile records table
CREATE TABLE public.mobile_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cadastro_cliente text NOT NULL,
  nome_escola text NOT NULL,
  numero_linha text,
  proprietario text,
  endereco text,
  numero text,
  bairro text,
  macroregiao text,
  tipo_escola text,
  responsavel text,
  mes_ano_referencia text NOT NULL,
  consumo_mb numeric,
  valor_gasto numeric,
  valor_servicos numeric,
  numero_dias integer,
  data_vencimento date,
  ocorrencias_pendencias text,
  descricao_servicos text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_line_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for energy_records
CREATE POLICY "Users can view their own energy records" 
ON public.energy_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own energy records" 
ON public.energy_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy records" 
ON public.energy_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy records" 
ON public.energy_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for fixed_line_records
CREATE POLICY "Users can view their own fixed line records" 
ON public.fixed_line_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fixed line records" 
ON public.fixed_line_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed line records" 
ON public.fixed_line_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed line records" 
ON public.fixed_line_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for mobile_records
CREATE POLICY "Users can view their own mobile records" 
ON public.mobile_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mobile records" 
ON public.mobile_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mobile records" 
ON public.mobile_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mobile records" 
ON public.mobile_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_energy_records_updated_at
BEFORE UPDATE ON public.energy_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fixed_line_records_updated_at
BEFORE UPDATE ON public.fixed_line_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mobile_records_updated_at
BEFORE UPDATE ON public.mobile_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();