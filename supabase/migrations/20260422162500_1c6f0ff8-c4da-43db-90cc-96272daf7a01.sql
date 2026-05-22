
-- Table to track active impersonation per admin user
CREATE TABLE IF NOT EXISTS public.admin_active_impersonation (
  admin_user_id uuid PRIMARY KEY,
  target_company_id uuid NOT NULL,
  target_user_id uuid,
  started_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_active_impersonation ENABLE ROW LEVEL SECURITY;

-- Only the admin themselves can see/modify their own active impersonation row
DROP POLICY IF EXISTS "admin_view_own_active_impersonation" ON public.admin_active_impersonation;
CREATE POLICY "admin_view_own_active_impersonation"
  ON public.admin_active_impersonation
  FOR SELECT
  USING (admin_user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));

-- Helper: is the current admin actively impersonating the given company?
CREATE OR REPLACE FUNCTION public.is_actively_impersonating(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_active_impersonation aai
    WHERE aai.admin_user_id = auth.uid()
      AND aai.target_company_id = _company_id
      AND _company_id IS NOT NULL
      AND has_role(auth.uid(), 'admin'::app_role)
      AND has_accepted_access_to_company(_company_id)
  )
$$;

-- RPC to start impersonation (verifies admin + accepted access)
CREATE OR REPLACE FUNCTION public.set_impersonation_target(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can impersonate';
  END IF;

  SELECT company_id INTO v_company_id
  FROM public.profiles
  WHERE user_id = _target_user_id
  LIMIT 1;

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Target user has no company';
  END IF;

  IF NOT has_accepted_access_to_company(v_company_id) THEN
    RAISE EXCEPTION 'No accepted access request for this user/company';
  END IF;

  INSERT INTO public.admin_active_impersonation (admin_user_id, target_company_id, target_user_id, started_at)
  VALUES (auth.uid(), v_company_id, _target_user_id, now())
  ON CONFLICT (admin_user_id) DO UPDATE
    SET target_company_id = EXCLUDED.target_company_id,
        target_user_id = EXCLUDED.target_user_id,
        started_at = now();
END;
$$;

-- RPC to clear impersonation
CREATE OR REPLACE FUNCTION public.clear_impersonation_target()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.admin_active_impersonation WHERE admin_user_id = auth.uid();
END;
$$;

-- Replace impersonation policies to require ACTIVE impersonation
DROP POLICY IF EXISTS "admin_impersonate_orders" ON public.orders;
CREATE POLICY "admin_impersonate_orders"
  ON public.orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_order_products" ON public.order_products;
CREATE POLICY "admin_impersonate_order_products"
  ON public.order_products FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_products.order_id
      AND o.company_id IS NOT NULL
      AND is_actively_impersonating(o.company_id)
  ))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_products.order_id
      AND o.company_id IS NOT NULL
      AND is_actively_impersonating(o.company_id)
  ));

DROP POLICY IF EXISTS "admin_impersonate_clients" ON public.clients;
CREATE POLICY "admin_impersonate_clients"
  ON public.clients FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_installation_jobs" ON public.installation_jobs;
CREATE POLICY "admin_impersonate_installation_jobs"
  ON public.installation_jobs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_installation_teams" ON public.installation_teams;
CREATE POLICY "admin_impersonate_installation_teams"
  ON public.installation_teams FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_installation_vehicles" ON public.installation_vehicles;
CREATE POLICY "admin_impersonate_installation_vehicles"
  ON public.installation_vehicles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_checklist_templates" ON public.installation_checklist_templates;
CREATE POLICY "admin_impersonate_checklist_templates"
  ON public.installation_checklist_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_kits" ON public.accessory_kits;
CREATE POLICY "admin_impersonate_kits"
  ON public.accessory_kits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_kit_items" ON public.accessory_kit_items;
CREATE POLICY "admin_impersonate_kit_items"
  ON public.accessory_kit_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.accessory_kits ak
    WHERE ak.id = accessory_kit_items.kit_id
      AND ak.company_id IS NOT NULL
      AND is_actively_impersonating(ak.company_id)
  ))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
    SELECT 1 FROM public.accessory_kits ak
    WHERE ak.id = accessory_kit_items.kit_id
      AND ak.company_id IS NOT NULL
      AND is_actively_impersonating(ak.company_id)
  ));

DROP POLICY IF EXISTS "admin_impersonate_ctp" ON public.client_type_pricing;
CREATE POLICY "admin_impersonate_ctp"
  ON public.client_type_pricing FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_pricing" ON public.pricing_config;
CREATE POLICY "admin_impersonate_pricing"
  ON public.pricing_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_sliding" ON public.sliding_mechanisms;
CREATE POLICY "admin_impersonate_sliding"
  ON public.sliding_mechanisms FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_impersonate_presets" ON public.user_accessory_presets;
CREATE POLICY "admin_impersonate_presets"
  ON public.user_accessory_presets FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

DROP POLICY IF EXISTS "admin_manage_or_impersonate_templates" ON public.processing_templates;
CREATE POLICY "admin_manage_or_impersonate_templates"
  ON public.processing_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) AND (
    (company_id IS NULL AND user_id = auth.uid())
    OR (company_id IS NOT NULL AND is_actively_impersonating(company_id))
  ))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND (
    (company_id IS NULL AND user_id = auth.uid())
    OR (company_id IS NOT NULL AND is_actively_impersonating(company_id))
  ));
