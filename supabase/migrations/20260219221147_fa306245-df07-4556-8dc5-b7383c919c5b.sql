
-- ============================================================
-- IZOLAREA DATELOR PER UTILIZATOR — REVIZUIRE RLS
-- ============================================================

-- ==================== 1. ORDERS ====================
DROP POLICY IF EXISTS "Approved users can view orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (created_by = auth.uid());

-- UPDATE: restrict to own orders
DROP POLICY IF EXISTS "Approved sales and admins can update orders" ON public.orders;
CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (created_by = auth.uid() AND is_approved_user() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales') OR has_role(auth.uid(), 'production_manager')));

-- INSERT: ensure created_by = auth.uid()
DROP POLICY IF EXISTS "Approved sales can create orders" ON public.orders;
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (created_by = auth.uid() AND is_approved_user() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'sales')));

-- DELETE: restrict to own orders
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Users can delete own orders"
  ON public.orders FOR DELETE
  USING (created_by = auth.uid() AND has_role(auth.uid(), 'admin'));

-- ==================== 2. ORDER_PRODUCTS ====================
DROP POLICY IF EXISTS "Approved users can view order products" ON public.order_products;
CREATE POLICY "Users can view own order products"
  ON public.order_products FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_products.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Sales and admins can manage order products" ON public.order_products;
CREATE POLICY "Users can manage own order products"
  ON public.order_products FOR ALL
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_products.order_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_products.order_id AND orders.created_by = auth.uid()));

-- ==================== 3. ORDER_HISTORY ====================
DROP POLICY IF EXISTS "Authenticated users can view order history" ON public.order_history;
CREATE POLICY "Users can view own order history"
  ON public.order_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_history.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can add order history" ON public.order_history;
CREATE POLICY "Users can add own order history"
  ON public.order_history FOR INSERT
  WITH CHECK (changed_by = auth.uid() AND EXISTS (SELECT 1 FROM orders WHERE orders.id = order_history.order_id AND orders.created_by = auth.uid()));

-- ==================== 4. ORDER_PAYMENTS ====================
DROP POLICY IF EXISTS "Authenticated users can view order payments" ON public.order_payments;
CREATE POLICY "Users can view own order payments"
  ON public.order_payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_payments.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Sales and admins can manage order payments" ON public.order_payments;
CREATE POLICY "Users can manage own order payments"
  ON public.order_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_payments.order_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_payments.order_id AND orders.created_by = auth.uid()));

-- ==================== 5. ORDER_DOCUMENTS ====================
DROP POLICY IF EXISTS "Authenticated users can view order documents" ON public.order_documents;
CREATE POLICY "Users can view own order documents"
  ON public.order_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_documents.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can upload order documents" ON public.order_documents;
CREATE POLICY "Users can upload own order documents"
  ON public.order_documents FOR INSERT
  WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM orders WHERE orders.id = order_documents.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete own order documents" ON public.order_documents;
CREATE POLICY "Users can delete own order documents"
  ON public.order_documents FOR DELETE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_documents.order_id AND orders.created_by = auth.uid()));

-- ==================== 6. PRODUCTION_JOBS ====================
DROP POLICY IF EXISTS "Approved users can view production jobs" ON public.production_jobs;
CREATE POLICY "Users can view own production jobs"
  ON public.production_jobs FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = production_jobs.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Production and sales staff can manage production jobs" ON public.production_jobs;
CREATE POLICY "Users can manage own production jobs"
  ON public.production_jobs FOR ALL
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = production_jobs.order_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = production_jobs.order_id AND orders.created_by = auth.uid()));

-- ==================== 7. PRODUCTION_STAGES ====================
DROP POLICY IF EXISTS "Authenticated users can view production stages" ON public.production_stages;
CREATE POLICY "Users can view own production stages"
  ON public.production_stages FOR SELECT
  USING (EXISTS (SELECT 1 FROM production_jobs JOIN orders ON orders.id = production_jobs.order_id WHERE production_jobs.id = production_stages.job_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Production and sales staff can manage production stages" ON public.production_stages;
CREATE POLICY "Users can manage own production stages"
  ON public.production_stages FOR ALL
  USING (EXISTS (SELECT 1 FROM production_jobs JOIN orders ON orders.id = production_jobs.order_id WHERE production_jobs.id = production_stages.job_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM production_jobs JOIN orders ON orders.id = production_jobs.order_id WHERE production_jobs.id = production_stages.job_id AND orders.created_by = auth.uid()));

-- ==================== 8. PRODUCTION_ISSUES ====================
DROP POLICY IF EXISTS "Authenticated users can view production issues" ON public.production_issues;
CREATE POLICY "Users can view own production issues"
  ON public.production_issues FOR SELECT
  USING (EXISTS (SELECT 1 FROM production_jobs JOIN orders ON orders.id = production_jobs.order_id WHERE production_jobs.id = production_issues.job_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Production staff can manage production issues" ON public.production_issues;
CREATE POLICY "Users can manage own production issues"
  ON public.production_issues FOR ALL
  USING (EXISTS (SELECT 1 FROM production_jobs JOIN orders ON orders.id = production_jobs.order_id WHERE production_jobs.id = production_issues.job_id AND orders.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM production_jobs JOIN orders ON orders.id = production_jobs.order_id WHERE production_jobs.id = production_issues.job_id AND orders.created_by = auth.uid()));

-- ==================== 9. QUOTES ====================
DROP POLICY IF EXISTS "Approved admins can view all quotes" ON public.quotes;
-- Keep "Approved users can view own quotes" which already has created_by = auth.uid()

-- ==================== 10. SERVICE_TICKETS ====================
DROP POLICY IF EXISTS "Authenticated users can view service tickets" ON public.service_tickets;
CREATE POLICY "Users can view own service tickets"
  ON public.service_tickets FOR SELECT
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Admin, production_manager, sales can manage service tickets" ON public.service_tickets;
CREATE POLICY "Users can manage own service tickets"
  ON public.service_tickets FOR ALL
  USING (created_by = auth.uid() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales')))
  WITH CHECK (created_by = auth.uid() AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'production_manager') OR has_role(auth.uid(), 'sales')));

-- ==================== 11. SERVICE_INTERVENTIONS ====================
DROP POLICY IF EXISTS "Authenticated users can view service interventions" ON public.service_interventions;
CREATE POLICY "Users can view own service interventions"
  ON public.service_interventions FOR SELECT
  USING (EXISTS (SELECT 1 FROM service_tickets WHERE service_tickets.id = service_interventions.ticket_id AND service_tickets.created_by = auth.uid()));

DROP POLICY IF EXISTS "Admin, production_manager, sales can manage service interventio" ON public.service_interventions;
CREATE POLICY "Users can manage own service interventions"
  ON public.service_interventions FOR ALL
  USING (EXISTS (SELECT 1 FROM service_tickets WHERE service_tickets.id = service_interventions.ticket_id AND service_tickets.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM service_tickets WHERE service_tickets.id = service_interventions.ticket_id AND service_tickets.created_by = auth.uid()));

-- ==================== 12. SERVICE_PHOTOS ====================
DROP POLICY IF EXISTS "Authenticated users can view service photos" ON public.service_photos;
CREATE POLICY "Users can view own service photos"
  ON public.service_photos FOR SELECT
  USING (EXISTS (SELECT 1 FROM service_tickets WHERE service_tickets.id = service_photos.ticket_id AND service_tickets.created_by = auth.uid()));

DROP POLICY IF EXISTS "Admin, production_manager, sales can manage service photos" ON public.service_photos;
CREATE POLICY "Users can manage own service photos"
  ON public.service_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM service_tickets WHERE service_tickets.id = service_photos.ticket_id AND service_tickets.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM service_tickets WHERE service_tickets.id = service_photos.ticket_id AND service_tickets.created_by = auth.uid()));

-- ==================== 13. STOCK_RESERVATIONS ====================
DROP POLICY IF EXISTS "Authenticated users can view stock reservations" ON public.stock_reservations;
CREATE POLICY "Users can view own stock reservations"
  ON public.stock_reservations FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = stock_reservations.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Sales and admins can manage stock reservations" ON public.stock_reservations;
CREATE POLICY "Users can insert own stock reservations"
  ON public.stock_reservations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = stock_reservations.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Production can fulfill stock reservations" ON public.stock_reservations;
CREATE POLICY "Users can update own stock reservations"
  ON public.stock_reservations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = stock_reservations.order_id AND orders.created_by = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete stock reservations" ON public.stock_reservations;
CREATE POLICY "Users can delete own stock reservations"
  ON public.stock_reservations FOR DELETE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = stock_reservations.order_id AND orders.created_by = auth.uid()));
