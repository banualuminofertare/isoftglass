
-- pricing_config
DROP POLICY IF EXISTS "Admins can manage pricing" ON public.pricing_config;

CREATE POLICY "Authenticated users can manage pricing"
ON public.pricing_config FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update pricing"
ON public.pricing_config FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete pricing"
ON public.pricing_config FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);

-- client_type_pricing
DROP POLICY IF EXISTS "Admins can manage client type pricing" ON public.client_type_pricing;

CREATE POLICY "Authenticated users can update client type pricing"
ON public.client_type_pricing FOR UPDATE TO authenticated
USING (auth.uid() IS NOT NULL);
