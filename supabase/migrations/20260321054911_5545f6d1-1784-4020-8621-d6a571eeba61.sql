
CREATE POLICY "Admins can update all pricing"
ON public.pricing_config FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert all pricing"
ON public.pricing_config FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all pricing"
ON public.pricing_config FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
