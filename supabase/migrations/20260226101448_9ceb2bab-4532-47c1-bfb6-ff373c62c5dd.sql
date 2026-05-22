
-- =============================================
-- Fix RESTRICTIVE -> PERMISSIVE RLS policies
-- for pricing_config, client_type_pricing, user_accessory_presets
-- =============================================

-- 1. pricing_config
DROP POLICY IF EXISTS "Admins can manage all pricing_config" ON pricing_config;
DROP POLICY IF EXISTS "Approved users can delete own pricing" ON pricing_config;
DROP POLICY IF EXISTS "Approved users can insert own pricing overrides" ON pricing_config;
DROP POLICY IF EXISTS "Approved users can update own pricing" ON pricing_config;
DROP POLICY IF EXISTS "Approved users see base and own pricing" ON pricing_config;

CREATE POLICY "Admins can manage all pricing_config"
  ON pricing_config FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Approved users see base and own pricing"
  ON pricing_config FOR SELECT
  USING (is_approved_user() AND (user_id IS NULL OR user_id = auth.uid()));

CREATE POLICY "Approved users can insert own pricing overrides"
  ON pricing_config FOR INSERT
  WITH CHECK (is_approved_user() AND user_id = auth.uid());

CREATE POLICY "Approved users can update own pricing"
  ON pricing_config FOR UPDATE
  USING (is_approved_user() AND user_id = auth.uid());

CREATE POLICY "Approved users can delete own pricing"
  ON pricing_config FOR DELETE
  USING (is_approved_user() AND user_id = auth.uid());

-- 2. client_type_pricing
DROP POLICY IF EXISTS "Admins can manage all client_type_pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users can delete own client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users can insert own client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users can update own client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users see base and own client type pricing" ON client_type_pricing;

CREATE POLICY "Admins can manage all client_type_pricing"
  ON client_type_pricing FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users see base and own client type pricing"
  ON client_type_pricing FOR SELECT
  USING (is_approved_user() AND (user_id IS NULL OR user_id = auth.uid()));

CREATE POLICY "Users can insert own client type pricing"
  ON client_type_pricing FOR INSERT
  WITH CHECK (is_approved_user() AND user_id = auth.uid());

CREATE POLICY "Users can update own client type pricing"
  ON client_type_pricing FOR UPDATE
  USING (is_approved_user() AND user_id = auth.uid());

CREATE POLICY "Users can delete own client type pricing"
  ON client_type_pricing FOR DELETE
  USING (is_approved_user() AND user_id = auth.uid());

-- 3. user_accessory_presets
DROP POLICY IF EXISTS "Admins can manage all user_accessory_presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can delete own presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can insert own presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can update own presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can view own presets" ON user_accessory_presets;

CREATE POLICY "Admins can manage all user_accessory_presets"
  ON user_accessory_presets FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own presets"
  ON user_accessory_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets"
  ON user_accessory_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
  ON user_accessory_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON user_accessory_presets FOR DELETE
  USING (auth.uid() = user_id);
