
-- Admin impersonation policy for orders
CREATE POLICY "admin_impersonate_orders"
ON public.orders FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
);

-- Admin impersonation policy for order_products
CREATE POLICY "admin_impersonate_order_products"
ON public.order_products FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_products.order_id 
    AND orders.company_id IS NOT NULL 
    AND has_accepted_access_to_company(orders.company_id)
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_products.order_id 
    AND orders.company_id IS NOT NULL 
    AND has_accepted_access_to_company(orders.company_id)
  )
);

-- Admin impersonation policy for clients
CREATE POLICY "admin_impersonate_clients"
ON public.clients FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND company_id IS NOT NULL 
  AND has_accepted_access_to_company(company_id)
);
