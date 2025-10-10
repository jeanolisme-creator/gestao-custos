-- Remover todas as políticas existentes e criar novas que permitem acesso a todos usuários autenticados

-- Política para school_records (água)
DROP POLICY IF EXISTS "All authenticated users can view school records" ON public.school_records;
DROP POLICY IF EXISTS "All authenticated users can create school records" ON public.school_records;
DROP POLICY IF EXISTS "All authenticated users can update school records" ON public.school_records;
DROP POLICY IF EXISTS "All authenticated users can delete school records" ON public.school_records;
DROP POLICY IF EXISTS "Admins can view all school records" ON public.school_records;
DROP POLICY IF EXISTS "Admins can update all school records" ON public.school_records;
DROP POLICY IF EXISTS "Users can create their own school records" ON public.school_records;
DROP POLICY IF EXISTS "Users can update their own school records" ON public.school_records;
DROP POLICY IF EXISTS "Users can delete their own school records" ON public.school_records;

CREATE POLICY "authenticated_view_school_records"
ON public.school_records
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_school_records"
ON public.school_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_school_records"
ON public.school_records
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_school_records"
ON public.school_records
FOR DELETE
TO authenticated
USING (true);

-- Política para energy_records (energia)
DROP POLICY IF EXISTS "All authenticated users can view energy records" ON public.energy_records;
DROP POLICY IF EXISTS "All authenticated users can create energy records" ON public.energy_records;
DROP POLICY IF EXISTS "All authenticated users can update energy records" ON public.energy_records;
DROP POLICY IF EXISTS "All authenticated users can delete energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Admins can view all energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Admins can update all energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can create their own energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can update their own energy records" ON public.energy_records;
DROP POLICY IF EXISTS "Users can delete their own energy records" ON public.energy_records;

CREATE POLICY "authenticated_view_energy_records"
ON public.energy_records
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_energy_records"
ON public.energy_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_energy_records"
ON public.energy_records
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_energy_records"
ON public.energy_records
FOR DELETE
TO authenticated
USING (true);

-- Política para mobile_records (telefone móvel)
DROP POLICY IF EXISTS "All authenticated users can view mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "All authenticated users can create mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "All authenticated users can update mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "All authenticated users can delete mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "Admins can view all mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "Admins can update all mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "Users can create their own mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "Users can update their own mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "Users can delete their own mobile records" ON public.mobile_records;

CREATE POLICY "authenticated_view_mobile_records"
ON public.mobile_records
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_mobile_records"
ON public.mobile_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_mobile_records"
ON public.mobile_records
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_mobile_records"
ON public.mobile_records
FOR DELETE
TO authenticated
USING (true);

-- Política para fixed_line_records (telefone fixo)
DROP POLICY IF EXISTS "All authenticated users can view fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "All authenticated users can create fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "All authenticated users can update fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "All authenticated users can delete fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "Admins can view all fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "Admins can update all fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "Users can create their own fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "Users can update their own fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "Users can delete their own fixed line records" ON public.fixed_line_records;

CREATE POLICY "authenticated_view_fixed_line_records"
ON public.fixed_line_records
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_fixed_line_records"
ON public.fixed_line_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_fixed_line_records"
ON public.fixed_line_records
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_fixed_line_records"
ON public.fixed_line_records
FOR DELETE
TO authenticated
USING (true);

-- Política para school_demand_records (demanda escolar)
DROP POLICY IF EXISTS "All authenticated users can view school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "All authenticated users can create school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "All authenticated users can update school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "All authenticated users can delete school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "Admins can view all school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "Admins can update all school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "Users can create their own school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "Users can update their own school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "Users can delete their own school demand records" ON public.school_demand_records;

CREATE POLICY "authenticated_view_school_demand_records"
ON public.school_demand_records
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_school_demand_records"
ON public.school_demand_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_school_demand_records"
ON public.school_demand_records
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_school_demand_records"
ON public.school_demand_records
FOR DELETE
TO authenticated
USING (true);

-- Política para schools
DROP POLICY IF EXISTS "All authenticated users can view schools" ON public.schools;
DROP POLICY IF EXISTS "All authenticated users can create schools" ON public.schools;
DROP POLICY IF EXISTS "All authenticated users can update schools" ON public.schools;
DROP POLICY IF EXISTS "All authenticated users can delete schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can view all schools" ON public.schools;
DROP POLICY IF EXISTS "Admins can update all schools" ON public.schools;
DROP POLICY IF EXISTS "Users can create their own schools" ON public.schools;
DROP POLICY IF EXISTS "Users can update their own schools" ON public.schools;
DROP POLICY IF EXISTS "Users can delete their own schools" ON public.schools;

CREATE POLICY "authenticated_view_schools"
ON public.schools
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_create_schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_schools"
ON public.schools
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_schools"
ON public.schools
FOR DELETE
TO authenticated
USING (true);

-- Adicionar o email custos@educacao.riopreto.sp.gov.br à lista de administradores
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_specific_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  IF user_email IN (
    'lvalmeida@educacao.riopreto.sp.gov.br',
    'razevedo@educacao.riopreto.sp.gov.br',
    'bgarcia@educacao.riopreto.sp.gov.br',
    'kperez@educacao.riopreto.sp.gov.br',
    'wpedroso@educacao.riopreto.sp.gov.br',
    'custos@educacao.riopreto.sp.gov.br'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'administrador'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    UPDATE public.profiles
    SET email = user_email
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;