
-- 1. Create helper function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND is_approved = true
  ) OR public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- 2. Update orders policies to require approval
DROP POLICY IF EXISTS "Authenticated users can view orders" ON public.orders;
CREATE POLICY "Approved users can view orders"
ON public.orders FOR SELECT TO authenticated
USING (is_approved_user());

DROP POLICY IF EXISTS "Sales can create orders" ON public.orders;
CREATE POLICY "Approved sales can create orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (is_approved_user() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role)));

DROP POLICY IF EXISTS "Sales and admins can update orders" ON public.orders;
CREATE POLICY "Approved sales and admins can update orders"
ON public.orders FOR UPDATE TO authenticated
USING (is_approved_user() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role)));

-- 3. Update clients policies
DROP POLICY IF EXISTS "Authorized roles can view clients" ON public.clients;
CREATE POLICY "Approved authorized roles can view clients"
ON public.clients FOR SELECT TO authenticated
USING (is_approved_user() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role)));

DROP POLICY IF EXISTS "Sales and admins can manage clients" ON public.clients;
CREATE POLICY "Approved sales and admins can manage clients"
ON public.clients FOR ALL TO authenticated
USING (is_approved_user() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'sales'::app_role)));

-- 4. Update materials policies
DROP POLICY IF EXISTS "Authenticated users can view materials" ON public.materials;
CREATE POLICY "Approved users can view materials"
ON public.materials FOR SELECT TO authenticated
USING (is_approved_user());

-- 5. Update production_jobs policies
DROP POLICY IF EXISTS "Authenticated users can view production jobs" ON public.production_jobs;
CREATE POLICY "Approved users can view production jobs"
ON public.production_jobs FOR SELECT TO authenticated
USING (is_approved_user());

-- 6. Update order_products policies
DROP POLICY IF EXISTS "Authenticated users can view order products" ON public.order_products;
CREATE POLICY "Approved users can view order products"
ON public.order_products FOR SELECT TO authenticated
USING (is_approved_user());

-- 7. Update pricing_config policies - restrict writes to admin only for base pricing
DROP POLICY IF EXISTS "Users can insert own pricing overrides" ON public.pricing_config;
CREATE POLICY "Approved users can insert own pricing overrides"
ON public.pricing_config FOR INSERT TO authenticated
WITH CHECK (is_approved_user() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own pricing" ON public.pricing_config;
CREATE POLICY "Approved users can update own pricing"
ON public.pricing_config FOR UPDATE TO authenticated
USING (is_approved_user() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own pricing" ON public.pricing_config;
CREATE POLICY "Approved users can delete own pricing"
ON public.pricing_config FOR DELETE TO authenticated
USING (is_approved_user() AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users see base and own pricing" ON public.pricing_config;
CREATE POLICY "Approved users see base and own pricing"
ON public.pricing_config FOR SELECT TO authenticated
USING (is_approved_user() AND ((user_id IS NULL) OR (user_id = auth.uid())));

-- 8. Update order_items policies
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Approved users can view their own order items"
ON public.order_items FOR SELECT TO authenticated
USING (is_approved_user() AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
CREATE POLICY "Approved users can insert their own order items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (is_approved_user() AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own order items" ON public.order_items;
CREATE POLICY "Approved users can update their own order items"
ON public.order_items FOR UPDATE TO authenticated
USING (is_approved_user() AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own order items" ON public.order_items;
CREATE POLICY "Approved users can delete their own order items"
ON public.order_items FOR DELETE TO authenticated
USING (is_approved_user() AND auth.uid() = user_id);

-- 9. Update quotes policies
DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;
CREATE POLICY "Approved users can view own quotes"
ON public.quotes FOR SELECT TO authenticated
USING (is_approved_user() AND auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can view all quotes" ON public.quotes;
CREATE POLICY "Approved admins can view all quotes"
ON public.quotes FOR SELECT TO authenticated
USING (is_approved_user() AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can insert own quotes" ON public.quotes;
CREATE POLICY "Approved users can insert own quotes"
ON public.quotes FOR INSERT TO authenticated
WITH CHECK (is_approved_user() AND auth.uid() = created_by);
