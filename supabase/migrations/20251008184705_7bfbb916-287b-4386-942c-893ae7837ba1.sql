-- Add RLS policies to allow admins to update all records across all systems

-- Contracts system
CREATE POLICY "Admins can update all contracts"
ON public.contracts
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Energy records system
CREATE POLICY "Admins can update all energy records"
ON public.energy_records
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Fixed line records system
CREATE POLICY "Admins can update all fixed line records"
ON public.fixed_line_records
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Mobile records system
CREATE POLICY "Admins can update all mobile records"
ON public.mobile_records
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- School demand records system
CREATE POLICY "Admins can update all school demand records"
ON public.school_demand_records
FOR UPDATE
USING (public.is_admin(auth.uid()));

-- School records (water) system
CREATE POLICY "Admins can update all school records"
ON public.school_records
FOR UPDATE
USING (public.is_admin(auth.uid()));