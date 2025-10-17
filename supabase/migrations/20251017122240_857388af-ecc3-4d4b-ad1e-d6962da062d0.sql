-- Allow admins to update any school_records and energy_records, keeping owner rules intact
-- Also ensure the user custos@educacao.riopreto.sp.gov.br has the 'administrador' role

-- 1) Add/replace admin update policy for school_records
DROP POLICY IF EXISTS "Admins can update all school records" ON public.school_records;
CREATE POLICY "Admins can update all school records"
ON public.school_records
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (true);

-- 2) Add/replace admin update policy for energy_records
DROP POLICY IF EXISTS "Admins can update all energy records" ON public.energy_records;
CREATE POLICY "Admins can update all energy records"
ON public.energy_records
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (true);

-- 3) Ensure custos user has admin role (id from logs: a5cbb2e4-b9cf-4293-93d1-e6a5c0073283)
INSERT INTO public.user_roles (user_id, role)
VALUES ('a5cbb2e4-b9cf-4293-93d1-e6a5c0073283'::uuid, 'administrador'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
