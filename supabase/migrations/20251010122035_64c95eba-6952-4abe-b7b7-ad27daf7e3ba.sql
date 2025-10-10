
-- Atualizar os emails na tabela profiles baseado nos user_ids dos auth logs
UPDATE profiles 
SET email = 'lvalmeida@educacao.riopreto.sp.gov.br'
WHERE user_id = '3f3ba5e8-fde0-4e73-a2cb-5a4176cb52ee';

UPDATE profiles 
SET email = 'razevedo@educacao.riopreto.sp.gov.br'
WHERE user_id = '2f28d1e3-f8c6-432c-aeec-090aba3b785b';

UPDATE profiles 
SET email = 'bgarcia@educacao.riopreto.sp.gov.br'
WHERE user_id = 'c49b7f04-73bd-42db-a2e4-7445e20644bf';

UPDATE profiles 
SET email = 'kperez@educacao.riopreto.sp.gov.br'
WHERE user_id = '275f8e53-d3a1-4fcc-8c52-22d56091f844';

-- Adicionar role de administrador para todos os 5 usuários (incluindo wpedroso se existir)
INSERT INTO user_roles (user_id, role)
VALUES 
  ('3f3ba5e8-fde0-4e73-a2cb-5a4176cb52ee'::uuid, 'administrador'::app_role),
  ('2f28d1e3-f8c6-432c-aeec-090aba3b785b', 'administrador'::app_role),
  ('c49b7f04-73bd-42db-a2e4-7445e20644bf', 'administrador'::app_role),
  ('275f8e53-d3a1-4fcc-8c52-22d56091f844', 'administrador'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Para o usuário wpedroso, vamos adicionar caso ele se registre futuramente
-- Criando uma função trigger para automaticamente dar role de admin para emails específicos
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_specific_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Buscar o email do usuário na tabela auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Se o email está na lista de admins, adicionar role
  IF user_email IN (
    'lvalmeida@educacao.riopreto.sp.gov.br',
    'razevedo@educacao.riopreto.sp.gov.br',
    'bgarcia@educacao.riopreto.sp.gov.br',
    'kperez@educacao.riopreto.sp.gov.br',
    'wpedroso@educacao.riopreto.sp.gov.br'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'administrador'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Atualizar o email na tabela profiles
    UPDATE public.profiles
    SET email = user_email
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger para executar quando um novo profile é criado
DROP TRIGGER IF EXISTS on_profile_created_assign_admin ON public.profiles;
CREATE TRIGGER on_profile_created_assign_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role_to_specific_emails();
