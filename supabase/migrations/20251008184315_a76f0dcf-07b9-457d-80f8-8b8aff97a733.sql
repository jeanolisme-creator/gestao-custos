-- Add RLS policy to allow admins to update all schools
CREATE POLICY "Admins can update all schools"
ON public.schools
FOR UPDATE
USING (public.is_admin(auth.uid()));