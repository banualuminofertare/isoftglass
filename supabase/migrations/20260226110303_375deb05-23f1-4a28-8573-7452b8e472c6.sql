
-- Drop ALL existing policies on pricing_config and recreate as explicitly PERMISSIVE
DROP POLICY IF EXISTS "admin_all_pricing" ON pricing_config;
DROP POLICY IF EXISTS "user_select_pricing" ON pricing_config;
DROP POLICY IF EXISTS "user_insert_pricing" ON pricing_config;
DROP POLICY IF EXISTS "user_update_pricing" ON pricing_config;
DROP POLICY IF EXISTS "user_delete_pricing" ON pricing_config;

CREATE POLICY "admin_all_pricing" ON pricing_config AS PERMISSIVE FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "user_select_pricing" ON pricing_config AS PERMISSIVE FOR SELECT USING (is_approved_user() AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "user_insert_pricing" ON pricing_config AS PERMISSIVE FOR INSERT WITH CHECK (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_update_pricing" ON pricing_config AS PERMISSIVE FOR UPDATE USING (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_delete_pricing" ON pricing_config AS PERMISSIVE FOR DELETE USING (is_approved_user() AND user_id = auth.uid());

-- Drop ALL existing policies on client_type_pricing and recreate as explicitly PERMISSIVE
DROP POLICY IF EXISTS "admin_all_ctp" ON client_type_pricing;
DROP POLICY IF EXISTS "user_select_ctp" ON client_type_pricing;
DROP POLICY IF EXISTS "user_insert_ctp" ON client_type_pricing;
DROP POLICY IF EXISTS "user_update_ctp" ON client_type_pricing;
DROP POLICY IF EXISTS "user_delete_ctp" ON client_type_pricing;

CREATE POLICY "admin_all_ctp" ON client_type_pricing AS PERMISSIVE FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "user_select_ctp" ON client_type_pricing AS PERMISSIVE FOR SELECT USING (is_approved_user() AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "user_insert_ctp" ON client_type_pricing AS PERMISSIVE FOR INSERT WITH CHECK (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_update_ctp" ON client_type_pricing AS PERMISSIVE FOR UPDATE USING (is_approved_user() AND user_id = auth.uid());
CREATE POLICY "user_delete_ctp" ON client_type_pricing AS PERMISSIVE FOR DELETE USING (is_approved_user() AND user_id = auth.uid());

-- Drop ALL existing policies on user_accessory_presets and recreate as explicitly PERMISSIVE
DROP POLICY IF EXISTS "admin_all_presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "user_select_presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "user_insert_presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "user_update_presets" ON user_accessory_presets;
DROP POLICY IF EXISTS "user_delete_presets" ON user_accessory_presets;

CREATE POLICY "admin_all_presets" ON user_accessory_presets AS PERMISSIVE FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "user_select_presets" ON user_accessory_presets AS PERMISSIVE FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_insert_presets" ON user_accessory_presets AS PERMISSIVE FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update_presets" ON user_accessory_presets AS PERMISSIVE FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_delete_presets" ON user_accessory_presets AS PERMISSIVE FOR DELETE USING (auth.uid() = user_id);
