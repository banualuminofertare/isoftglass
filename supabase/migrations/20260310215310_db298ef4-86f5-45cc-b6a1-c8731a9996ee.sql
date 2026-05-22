
-- FIX 1: processing_templates SELECT - prevent cross-subscriber leaks
DROP POLICY IF EXISTS "Company members can view processing templates" ON public.processing_templates;
CREATE POLICY "Company members can view processing templates"
  ON public.processing_templates FOR SELECT TO authenticated
  USING (
    is_approved_user() AND (
      (company_id IS NOT NULL AND user_belongs_to_company(company_id))
      OR (company_id IS NULL AND user_id = auth.uid())
      OR (company_id IS NULL AND has_role(user_id, 'admin'::app_role))
    )
  );

-- FIX 2: processing_templates admin ALL - restrict to own globals + impersonation
DROP POLICY IF EXISTS "admin_manage_or_impersonate_templates" ON public.processing_templates;
CREATE POLICY "admin_manage_or_impersonate_templates"
  ON public.processing_templates FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) AND (
      (company_id IS NULL AND user_id = auth.uid())
      OR (company_id IS NOT NULL AND has_accepted_access_to_company(company_id))
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) AND (
      (company_id IS NULL AND user_id = auth.uid())
      OR (company_id IS NOT NULL AND has_accepted_access_to_company(company_id))
    )
  );

-- FIX 3: sliding_mechanisms - only admins can create/edit/delete global ones
DROP POLICY IF EXISTS "Company members can insert sliding mechanisms" ON public.sliding_mechanisms;
CREATE POLICY "Company members can insert sliding mechanisms"
  ON public.sliding_mechanisms FOR INSERT TO authenticated
  WITH CHECK (
    is_approved_user() AND (
      (company_id = get_user_company_id(auth.uid()))
      OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
    )
  );

DROP POLICY IF EXISTS "Company members can update sliding mechanisms" ON public.sliding_mechanisms;
CREATE POLICY "Company members can update sliding mechanisms"
  ON public.sliding_mechanisms FOR UPDATE TO authenticated
  USING (
    is_approved_user() AND (
      user_belongs_to_company(company_id)
      OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
    )
  );

DROP POLICY IF EXISTS "Company members can delete sliding mechanisms" ON public.sliding_mechanisms;
CREATE POLICY "Company members can delete sliding mechanisms"
  ON public.sliding_mechanisms FOR DELETE TO authenticated
  USING (
    is_approved_user() AND (
      user_belongs_to_company(company_id)
      OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- FIX 4: accessory_kit_items - add company-level access
DROP POLICY IF EXISTS "Users can manage own kit items" ON public.accessory_kit_items;
CREATE POLICY "Users can manage own kit items"
  ON public.accessory_kit_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accessory_kits ak
      WHERE ak.id = accessory_kit_items.kit_id
      AND (ak.user_id = auth.uid() OR user_belongs_to_company(ak.company_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accessory_kits ak
      WHERE ak.id = accessory_kit_items.kit_id
      AND (ak.user_id = auth.uid() OR user_belongs_to_company(ak.company_id))
    )
  );

-- Add admin impersonation for kit items
DROP POLICY IF EXISTS "admin_impersonate_kit_items" ON public.accessory_kit_items;
CREATE POLICY "admin_impersonate_kit_items"
  ON public.accessory_kit_items FOR ALL TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role) AND
    EXISTS (
      SELECT 1 FROM accessory_kits ak
      WHERE ak.id = accessory_kit_items.kit_id
      AND ak.company_id IS NOT NULL
      AND has_accepted_access_to_company(ak.company_id)
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) AND
    EXISTS (
      SELECT 1 FROM accessory_kits ak
      WHERE ak.id = accessory_kit_items.kit_id
      AND ak.company_id IS NOT NULL
      AND has_accepted_access_to_company(ak.company_id)
    )
  );
