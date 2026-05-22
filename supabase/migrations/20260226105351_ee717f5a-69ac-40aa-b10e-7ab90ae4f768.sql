
-- Fix pricing_config: drop RESTRICTIVE, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can manage all pricing_config" ON pricing_config;
DROP POLICY IF EXISTS "Approved users can delete own pricing" ON pricing_config;
DROP POLICY IF EXISTS "Approved users can insert own pricing overrides" ON pricing_config;
DROP POLICY IF EXISTS "Approved users can update own pricing" ON pricing_config;
DROP POLICY IF EXISTS "Approved users see base and own pricing" ON pricing_config;

CREATE POLICY "admin_all_pricing" ON pricing_config FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "user_select_pricing" ON pricing_config FOR SELECT USING (is_approved_user() AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "user_insert_pricing" ON pricing_config FOR INSERT WITH CHECK (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_update_pricing" ON pricing_config FOR UPDATE USING (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_delete_pricing" ON pricing_config FOR DELETE USING (is_approved_user() AND user_id = auth.uid());

-- Fix client_type_pricing
DROP POLICY IF EXISTS "Admins can manage all client_type_pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users can delete own client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users can insert own client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users can update own client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Users see base and own client type pricing" ON client_type_pricing;

CREATE POLICY "admin_all_ctp" ON client_type_pricing FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "user_select_ctp" ON client_type_pricing FOR SELECT USING (is_approved_user() AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "user_insert_ctp" ON client_type_pricing FOR INSERT WITH CHECK (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_update_ctp" ON client_type_pricing FOR UPDATE USING (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_delete_ctp" ON client_type_pricing FOR DELETE USING (is_approved_user() AND user_id = auth.uid());

-- Fix user_accessory_presets
DROP POLICY IF EXISTS "Admins can manage all user_accessory_presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can delete own presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can insert own presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can update own presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "Users can view own presets" ON user_accessory_presets;

CREATE POLICY "admin_all_presets" ON user_accessory_presets FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "user_select_presets" ON user_accessory_presets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert_presets" ON user_accessory_presets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update_presets" ON user_accessory_presets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_delete_presets" ON user_accessory_presets FOR DELETE USING (auth.uid() = user_id);
