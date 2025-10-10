
-- Adicionar role de administrador para wpedroso buscando na tabela auth.users
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
BEGIN
  -- Buscar o user_id do wpedroso na tabela auth.users
  SELECT id, email INTO v_user_id, v_email
  FROM auth.users
  WHERE email = 'wpedroso@educacao.riopreto.sp.gov.br';
  
  -- Se encontrou o usuário, adicionar role e atualizar email no profile
  IF v_user_id IS NOT NULL THEN
    -- Inserir role de administrador
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'administrador'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Atualizar email no profile
    UPDATE profiles
    SET email = v_email
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Role de administrador adicionada para wpedroso (user_id: %)', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário wpedroso@educacao.riopreto.sp.gov.br não encontrado';
  END IF;
END $$;
