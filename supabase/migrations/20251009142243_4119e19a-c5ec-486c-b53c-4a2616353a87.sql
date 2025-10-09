-- Corrigir trigger para incluir tabela outsourced_employees
DROP TRIGGER IF EXISTS sync_school_changes_trigger ON public.schools;
DROP FUNCTION IF EXISTS public.sync_school_changes();

CREATE OR REPLACE FUNCTION public.sync_school_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Atualizar school_records (água)
  UPDATE public.school_records
  SET 
    nome_escola = NEW.nome_escola,
    proprietario = NEW.proprietario,
    endereco_completo = NEW.endereco_completo,
    numero = NEW.numero,
    bairro = NEW.bairro,
    macroregiao = NEW.macroregiao
  WHERE nome_escola = OLD.nome_escola;

  -- Atualizar energy_records (energia)
  UPDATE public.energy_records
  SET 
    nome_escola = NEW.nome_escola,
    proprietario = NEW.proprietario,
    endereco = NEW.endereco_completo,
    numero = NEW.numero,
    bairro = NEW.bairro,
    macroregiao = NEW.macroregiao,
    tipo_escola = NEW.tipo_escola
  WHERE nome_escola = OLD.nome_escola;

  -- Atualizar mobile_records (telefone móvel)
  UPDATE public.mobile_records
  SET 
    nome_escola = NEW.nome_escola,
    proprietario = NEW.proprietario,
    endereco = NEW.endereco_completo,
    numero = NEW.numero,
    bairro = NEW.bairro,
    macroregiao = NEW.macroregiao,
    tipo_escola = NEW.tipo_escola
  WHERE nome_escola = OLD.nome_escola;

  -- Atualizar fixed_line_records (telefone fixo)
  UPDATE public.fixed_line_records
  SET 
    nome_escola = NEW.nome_escola,
    proprietario = NEW.proprietario,
    endereco = NEW.endereco_completo,
    numero = NEW.numero,
    bairro = NEW.bairro,
    macroregiao = NEW.macroregiao,
    tipo_escola = NEW.tipo_escola
  WHERE nome_escola = OLD.nome_escola;

  -- Atualizar school_demand_records (demanda escolar)
  UPDATE public.school_demand_records
  SET 
    nome_escola = NEW.nome_escola,
    endereco_completo = NEW.endereco_completo,
    numero = NEW.numero,
    bairro = NEW.bairro,
    macroregiao = NEW.macroregiao,
    email = NEW.email,
    telefone = COALESCE(NEW.telefone_fixo, NEW.telefone_celular)
  WHERE nome_escola = OLD.nome_escola;

  -- Atualizar outsourced_quotas (cotas de terceirizados)
  UPDATE public.outsourced_quotas
  SET school_name = NEW.nome_escola
  WHERE school_name = OLD.nome_escola;

  -- CORRIGIDO: Atualizar outsourced_employees (funcionários terceirizados)
  -- Atualiza tanto por school_id quanto por workplace (nome da escola)
  UPDATE public.outsourced_employees
  SET workplace = NEW.nome_escola
  WHERE school_id = NEW.id OR workplace = OLD.nome_escola;

  RETURN NEW;
END;
$$;

-- Criar trigger para sincronizar mudanças em escolas
CREATE TRIGGER sync_school_changes_trigger
  AFTER UPDATE ON public.schools
  FOR EACH ROW
  WHEN (OLD.nome_escola IS DISTINCT FROM NEW.nome_escola OR
        OLD.proprietario IS DISTINCT FROM NEW.proprietario OR
        OLD.endereco_completo IS DISTINCT FROM NEW.endereco_completo OR
        OLD.numero IS DISTINCT FROM NEW.numero OR
        OLD.bairro IS DISTINCT FROM NEW.bairro OR
        OLD.macroregiao IS DISTINCT FROM NEW.macroregiao OR
        OLD.tipo_escola IS DISTINCT FROM NEW.tipo_escola OR
        OLD.email IS DISTINCT FROM NEW.email OR
        OLD.telefone_fixo IS DISTINCT FROM NEW.telefone_fixo OR
        OLD.telefone_celular IS DISTINCT FROM NEW.telefone_celular)
  EXECUTE FUNCTION public.sync_school_changes();