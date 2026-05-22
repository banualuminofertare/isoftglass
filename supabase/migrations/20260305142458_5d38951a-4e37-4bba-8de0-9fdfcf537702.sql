
-- =====================================================
-- ADD company_id TO KEY TABLES
-- =====================================================

-- Orders
ALTER TABLE public.orders ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Clients
ALTER TABLE public.clients ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Quotes
ALTER TABLE public.quotes ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Accessory kits
ALTER TABLE public.accessory_kits ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Pricing config
ALTER TABLE public.pricing_config ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Client type pricing
ALTER TABLE public.client_type_pricing ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- User accessory presets
ALTER TABLE public.user_accessory_presets ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Service tickets
ALTER TABLE public.service_tickets ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Stock movements
ALTER TABLE public.stock_movements ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- User stock
ALTER TABLE public.user_stock ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Order items (cart)
ALTER TABLE public.order_items ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- =====================================================
-- HELPER: check if current user belongs to given company
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND company_id = _company_id AND _company_id IS NOT NULL
  )
$$;

-- =====================================================
-- UPDATE RLS: ORDERS (company-level isolation)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;

CREATE POLICY "Company members can view orders" ON public.orders
FOR SELECT TO authenticated
USING (
  public.user_belongs_to_company(company_id)
  OR (company_id IS NULL AND created_by = auth.uid())
);

CREATE POLICY "Company members can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales'))
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update orders" ON public.orders
FOR UPDATE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales') OR has_role(auth.uid(), 'production_manager'))
);

CREATE POLICY "Owner can delete orders" ON public.orders
FOR DELETE TO authenticated
USING (
  (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
  AND has_role(auth.uid(), 'admin')
);

-- =====================================================
-- UPDATE RLS: CLIENTS (company-level isolation)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;

CREATE POLICY "Company members can view clients" ON public.clients
FOR SELECT TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
);

CREATE POLICY "Company members can insert clients" ON public.clients
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update clients" ON public.clients
FOR UPDATE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
);

CREATE POLICY "Company members can delete clients" ON public.clients
FOR DELETE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
);

-- =====================================================
-- UPDATE RLS: QUOTES
-- =====================================================
DROP POLICY IF EXISTS "Approved users can view own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Approved users can insert own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Users can delete own quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admins can delete all quotes" ON public.quotes;

CREATE POLICY "Company members can view quotes" ON public.quotes
FOR SELECT TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
);

CREATE POLICY "Company members can insert quotes" ON public.quotes
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND created_by = auth.uid()
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update quotes" ON public.quotes
FOR UPDATE TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid())
);

CREATE POLICY "Company members can delete quotes" ON public.quotes
FOR DELETE TO authenticated
USING (
  (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
  AND (has_role(auth.uid(), 'admin') OR created_by = auth.uid())
);

-- =====================================================
-- UPDATE RLS: SERVICE_TICKETS
-- =====================================================
DROP POLICY IF EXISTS "Users can view own service tickets" ON public.service_tickets;
DROP POLICY IF EXISTS "Users can manage own service tickets" ON public.service_tickets;

CREATE POLICY "Company members can view service tickets" ON public.service_tickets
FOR SELECT TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid())
);

CREATE POLICY "Company members can manage service tickets" ON public.service_tickets
FOR ALL TO authenticated
USING (
  (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales'))
)
WITH CHECK (
  (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales'))
);

-- =====================================================
-- UPDATE RLS: STOCK_MOVEMENTS
-- =====================================================
DROP POLICY IF EXISTS "Users can view own stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can insert own stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can update own stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can delete own stock movements" ON public.stock_movements;

CREATE POLICY "Company members can view stock movements" ON public.stock_movements
FOR SELECT TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid())
);

CREATE POLICY "Company members can insert stock movements" ON public.stock_movements
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND created_by = auth.uid()
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update stock movements" ON public.stock_movements
FOR UPDATE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
);

CREATE POLICY "Company members can delete stock movements" ON public.stock_movements
FOR DELETE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()))
);

-- =====================================================
-- UPDATE RLS: USER_STOCK
-- =====================================================
DROP POLICY IF EXISTS "Users can view own stock" ON public.user_stock;
DROP POLICY IF EXISTS "Approved users can insert own stock" ON public.user_stock;
DROP POLICY IF EXISTS "Approved users can update own stock" ON public.user_stock;
DROP POLICY IF EXISTS "Approved users can delete own stock" ON public.user_stock;

CREATE POLICY "Company members can view stock" ON public.user_stock
FOR SELECT TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Company members can insert stock" ON public.user_stock
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update stock" ON public.user_stock
FOR UPDATE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid()))
);

CREATE POLICY "Company members can delete stock" ON public.user_stock
FOR DELETE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid()))
);

-- =====================================================
-- UPDATE RLS: ACCESSORY_KITS
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own kits" ON public.accessory_kits;

CREATE POLICY "Company members can manage kits" ON public.accessory_kits
FOR ALL TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid())
)
WITH CHECK (
  company_id = public.get_user_company_id(auth.uid()) OR (company_id IS NULL AND user_id = auth.uid())
);

-- =====================================================
-- UPDATE RLS: PRICING_CONFIG
-- =====================================================
DROP POLICY IF EXISTS "admin_all_pricing" ON public.pricing_config;
DROP POLICY IF EXISTS "user_select_pricing" ON public.pricing_config;
DROP POLICY IF EXISTS "user_insert_pricing" ON public.pricing_config;
DROP POLICY IF EXISTS "user_update_pricing" ON public.pricing_config;
DROP POLICY IF EXISTS "user_delete_pricing" ON public.pricing_config;

CREATE POLICY "admin_all_pricing" ON public.pricing_config
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company members can view pricing" ON public.pricing_config
FOR SELECT TO authenticated
USING (
  is_approved_user()
  AND (
    public.user_belongs_to_company(company_id)
    OR (company_id IS NULL AND (user_id IS NULL OR user_id = auth.uid()))
  )
);

CREATE POLICY "Company members can insert pricing" ON public.pricing_config
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update pricing" ON public.pricing_config
FOR UPDATE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid()))
);

CREATE POLICY "Company members can delete pricing" ON public.pricing_config
FOR DELETE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid()))
);

-- =====================================================
-- UPDATE RLS: CLIENT_TYPE_PRICING
-- =====================================================
DROP POLICY IF EXISTS "admin_all_ctp" ON public.client_type_pricing;
DROP POLICY IF EXISTS "user_select_ctp" ON public.client_type_pricing;
DROP POLICY IF EXISTS "user_insert_ctp" ON public.client_type_pricing;
DROP POLICY IF EXISTS "user_update_ctp" ON public.client_type_pricing;
DROP POLICY IF EXISTS "user_delete_ctp" ON public.client_type_pricing;

CREATE POLICY "admin_all_ctp" ON public.client_type_pricing
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company members can view ctp" ON public.client_type_pricing
FOR SELECT TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND (user_id IS NULL OR user_id = auth.uid())))
);

CREATE POLICY "Company members can insert ctp" ON public.client_type_pricing
FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user()
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update ctp" ON public.client_type_pricing
FOR UPDATE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid()))
);

CREATE POLICY "Company members can delete ctp" ON public.client_type_pricing
FOR DELETE TO authenticated
USING (
  is_approved_user()
  AND (public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid()))
);

-- =====================================================
-- UPDATE RLS: USER_ACCESSORY_PRESETS
-- =====================================================
DROP POLICY IF EXISTS "admin_all_presets" ON public.user_accessory_presets;
DROP POLICY IF EXISTS "user_select_presets" ON public.user_accessory_presets;
DROP POLICY IF EXISTS "user_insert_presets" ON public.user_accessory_presets;
DROP POLICY IF EXISTS "user_update_presets" ON public.user_accessory_presets;
DROP POLICY IF EXISTS "user_delete_presets" ON public.user_accessory_presets;

CREATE POLICY "admin_all_presets" ON public.user_accessory_presets
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Company members can view presets" ON public.user_accessory_presets
FOR SELECT TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Company members can insert presets" ON public.user_accessory_presets
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (company_id = public.get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update presets" ON public.user_accessory_presets
FOR UPDATE TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid())
);

CREATE POLICY "Company members can delete presets" ON public.user_accessory_presets
FOR DELETE TO authenticated
USING (
  public.user_belongs_to_company(company_id) OR (company_id IS NULL AND user_id = auth.uid())
);

-- =====================================================
-- UPDATE child table RLS: order_products, order_history, production_jobs, etc.
-- These use EXISTS on orders, which now has company-level RLS.
-- No changes needed since they already check through orders table.
-- =====================================================

-- =====================================================
-- UPDATE RLS: ORDER_ITEMS (cart - personal per user still)
-- =====================================================
-- Cart items remain personal - no company sharing needed
