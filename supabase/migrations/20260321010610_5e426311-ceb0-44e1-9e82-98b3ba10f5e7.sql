CREATE POLICY "Admins can view all pricing"
ON public.pricing_config FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));