-- Ajustar políticas: manter SELECT para todos autenticados; INSERT permitido; UPDATE/DELETE restritos ao proprietário

-- school_records
DROP POLICY IF EXISTS "All authenticated users can update school records" ON public.school_records;
DROP POLICY IF EXISTS "All authenticated users can delete school records" ON public.school_records;

CREATE POLICY "Owners can update school records"
ON public.school_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete school records"
ON public.school_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- energy_records
DROP POLICY IF EXISTS "All authenticated users can update energy records" ON public.energy_records;
DROP POLICY IF EXISTS "All authenticated users can delete energy records" ON public.energy_records;

CREATE POLICY "Owners can update energy records"
ON public.energy_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete energy records"
ON public.energy_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- mobile_records
DROP POLICY IF EXISTS "All authenticated users can update mobile records" ON public.mobile_records;
DROP POLICY IF EXISTS "All authenticated users can delete mobile records" ON public.mobile_records;

CREATE POLICY "Owners can update mobile records"
ON public.mobile_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete mobile records"
ON public.mobile_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- fixed_line_records
DROP POLICY IF EXISTS "All authenticated users can update fixed line records" ON public.fixed_line_records;
DROP POLICY IF EXISTS "All authenticated users can delete fixed line records" ON public.fixed_line_records;

CREATE POLICY "Owners can update fixed line records"
ON public.fixed_line_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete fixed line records"
ON public.fixed_line_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- school_demand_records
DROP POLICY IF EXISTS "All authenticated users can update school demand records" ON public.school_demand_records;
DROP POLICY IF EXISTS "All authenticated users can delete school demand records" ON public.school_demand_records;

CREATE POLICY "Owners can update school demand records"
ON public.school_demand_records
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete school demand records"
ON public.school_demand_records
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- schools
DROP POLICY IF EXISTS "All authenticated users can update schools" ON public.schools;
DROP POLICY IF EXISTS "All authenticated users can delete schools" ON public.schools;

CREATE POLICY "Owners can update schools"
ON public.schools
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete schools"
ON public.schools
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);