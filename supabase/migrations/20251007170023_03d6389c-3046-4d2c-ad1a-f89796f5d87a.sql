-- Update RLS policies for outsourced_employees to allow admins to see all data
DROP POLICY IF EXISTS "Users can view their own outsourced employees" ON public.outsourced_employees;
DROP POLICY IF EXISTS "Users can create their own outsourced employees" ON public.outsourced_employees;
DROP POLICY IF EXISTS "Users can update their own outsourced employees" ON public.outsourced_employees;
DROP POLICY IF EXISTS "Users can delete their own outsourced employees" ON public.outsourced_employees;

CREATE POLICY "Admins can view all outsourced employees"
ON public.outsourced_employees
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Admins can create outsourced employees"
ON public.outsourced_employees
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all outsourced employees"
ON public.outsourced_employees
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all outsourced employees"
ON public.outsourced_employees
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update RLS policies for outsourced_quotas to allow admins to see all data
DROP POLICY IF EXISTS "Users can view their own outsourced quotas" ON public.outsourced_quotas;
DROP POLICY IF EXISTS "Users can insert their own outsourced quotas" ON public.outsourced_quotas;
DROP POLICY IF EXISTS "Users can update their own outsourced quotas" ON public.outsourced_quotas;
DROP POLICY IF EXISTS "Users can delete their own outsourced quotas" ON public.outsourced_quotas;

CREATE POLICY "Admins can view all outsourced quotas"
ON public.outsourced_quotas
FOR SELECT
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Admins can create outsourced quotas"
ON public.outsourced_quotas
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all outsourced quotas"
ON public.outsourced_quotas
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all outsourced quotas"
ON public.outsourced_quotas
FOR DELETE
USING (public.is_admin(auth.uid()));