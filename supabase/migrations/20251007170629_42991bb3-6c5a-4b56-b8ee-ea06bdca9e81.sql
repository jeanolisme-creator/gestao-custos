-- Grant admin SELECT visibility across all main data tables while preserving owner access

-- contracts
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
CREATE POLICY "Admins can view all contracts"
ON public.contracts
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- energy_records
DROP POLICY IF EXISTS "Users can view their own energy records" ON public.energy_records;
CREATE POLICY "Admins can view all energy records"
ON public.energy_records
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- fixed_line_records
DROP POLICY IF EXISTS "Users can view their own fixed line records" ON public.fixed_line_records;
CREATE POLICY "Admins can view all fixed line records"
ON public.fixed_line_records
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- mobile_records
DROP POLICY IF EXISTS "Users can view their own mobile records" ON public.mobile_records;
CREATE POLICY "Admins can view all mobile records"
ON public.mobile_records
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- school_records (water)
DROP POLICY IF EXISTS "Users can view their own school records" ON public.school_records;
CREATE POLICY "Admins can view all school records"
ON public.school_records
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- schools (master data)
DROP POLICY IF EXISTS "Users can view their own schools" ON public.schools;
CREATE POLICY "Admins can view all schools"
ON public.schools
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- school_demand_records
DROP POLICY IF EXISTS "Users can view their own school demand records" ON public.school_demand_records;
CREATE POLICY "Admins can view all school demand records"
ON public.school_demand_records
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Ensure the three mentioned accounts have admin role (idempotent)
-- Tabata (tbelo), Amanda (acsagres), and Custos emails from logs; upsert based on known user_ids
INSERT INTO public.user_roles (user_id, role)
SELECT uid, 'administrador'::public.app_role
FROM (VALUES 
  ('fb00a965-3fba-45e2-9b29-801af806c464'::uuid), -- tbelo@educacao.riopreto.sp.gov.br
  ('2ef9b701-dc98-4cb7-96ee-7dc555aa61d1'::uuid), -- acsagres@educacao.riopreto.sp.gov.br
  ('a5cbb2e4-b9cf-4293-93d1-e6a5c0073283'::uuid)  -- custos@educacao.riopreto.sp.gov.br
) AS v(uid)
ON CONFLICT (user_id, role) DO NOTHING;