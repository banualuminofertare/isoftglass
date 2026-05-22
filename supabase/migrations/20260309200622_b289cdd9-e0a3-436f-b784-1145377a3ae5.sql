
-- Remove admin bypass policies that expose subscriber data

-- 1. pricing_config - admin shouldn't see subscriber pricing
DROP POLICY IF EXISTS "admin_all_pricing" ON public.pricing_config;

-- 2. user_accessory_presets - admin shouldn't see subscriber presets
DROP POLICY IF EXISTS "admin_all_presets" ON public.user_accessory_presets;

-- 3. client_type_pricing - admin shouldn't see subscriber client pricing
DROP POLICY IF EXISTS "admin_all_ctp" ON public.client_type_pricing;

-- 4. sliding_mechanisms - admin shouldn't see subscriber mechanisms
DROP POLICY IF EXISTS "admin_all_sliding_mechanisms" ON public.sliding_mechanisms;
