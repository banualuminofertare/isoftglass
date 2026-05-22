
-- Admin can manage all pricing_config rows
CREATE POLICY "Admins can manage all pricing_config"
ON public.pricing_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can manage all client_type_pricing rows
CREATE POLICY "Admins can manage all client_type_pricing"
ON public.client_type_pricing FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can manage all user_quote_settings rows
CREATE POLICY "Admins can manage all user_quote_settings"
ON public.user_quote_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin can manage all user_accessory_presets rows
CREATE POLICY "Admins can manage all user_accessory_presets"
ON public.user_accessory_presets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
