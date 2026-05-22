
-- 1. Clients: drop existing policies, create user-isolated ones
DROP POLICY IF EXISTS "Approved authorized roles can view clients" ON clients;
DROP POLICY IF EXISTS "Approved sales and admins can manage clients" ON clients;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (is_approved_user() AND created_by = auth.uid());

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (is_approved_user() AND created_by = auth.uid());

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (is_approved_user() AND created_by = auth.uid());

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (is_approved_user() AND created_by = auth.uid());

-- 2. Client contacts: isolate via client ownership
DROP POLICY IF EXISTS "Authorized roles can view client contacts" ON client_contacts;
DROP POLICY IF EXISTS "Sales and admins can manage client contacts" ON client_contacts;

CREATE POLICY "Users can view own client contacts"
  ON client_contacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = client_contacts.client_id
    AND clients.created_by = auth.uid()
  ));

CREATE POLICY "Users can manage own client contacts"
  ON client_contacts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM clients WHERE clients.id = client_contacts.client_id
    AND clients.created_by = auth.uid()
  ));

-- 3. client_type_pricing: add user_id for per-user overrides
ALTER TABLE client_type_pricing ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT NULL;

DROP POLICY IF EXISTS "Authenticated users can view client type pricing" ON client_type_pricing;
DROP POLICY IF EXISTS "Authenticated users can update client type pricing" ON client_type_pricing;

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
