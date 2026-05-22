
-- Enums
CREATE TYPE public.invoice_type AS ENUM ('proforma', 'fiscal', 'storno');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'storno');

-- Invoice series (per company)
CREATE TABLE public.invoice_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  invoice_type invoice_type NOT NULL DEFAULT 'fiscal',
  prefix text NOT NULL DEFAULT '',
  series_name text NOT NULL,
  start_number integer NOT NULL DEFAULT 1,
  current_number integer NOT NULL DEFAULT 0,
  year_in_format boolean NOT NULL DEFAULT true,
  padding_length integer NOT NULL DEFAULT 5,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_series_company ON public.invoice_series(company_id);
ALTER TABLE public.invoice_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view series" ON public.invoice_series
  FOR SELECT TO authenticated USING (user_belongs_to_company(company_id));
CREATE POLICY "Company members can manage series" ON public.invoice_series
  FOR ALL TO authenticated
  USING (is_approved_user() AND user_belongs_to_company(company_id) AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales')))
  WITH CHECK (is_approved_user() AND company_id = get_user_company_id(auth.uid()) AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales')));
CREATE POLICY "admin_impersonate_invoice_series" ON public.invoice_series
  FOR ALL USING (has_role(auth.uid(),'admin') AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(),'admin') AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  invoice_number text,
  series_id uuid REFERENCES public.invoice_series(id) ON DELETE SET NULL,
  invoice_type invoice_type NOT NULL DEFAULT 'fiscal',
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  parent_invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  client_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  company_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  tax_percent numeric NOT NULL DEFAULT 19,
  discount_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'RON',
  notes text,
  internal_notes text,
  pdf_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  issued_at timestamptz,
  CONSTRAINT invoices_unique_number UNIQUE (company_id, invoice_number)
);
CREATE INDEX idx_invoices_company ON public.invoices(company_id);
CREATE INDEX idx_invoices_order ON public.invoices(order_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company members can view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (user_belongs_to_company(company_id) OR (company_id IS NULL AND created_by = auth.uid()));
CREATE POLICY "Company members can create invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (is_approved_user() AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales')) AND company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Company members can update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (is_approved_user() AND user_belongs_to_company(company_id) AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales')));
CREATE POLICY "Admins can delete draft invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (user_belongs_to_company(company_id) AND has_role(auth.uid(),'admin') AND status = 'draft');
CREATE POLICY "admin_impersonate_invoices" ON public.invoices
  FOR ALL USING (has_role(auth.uid(),'admin') AND company_id IS NOT NULL AND is_actively_impersonating(company_id))
  WITH CHECK (has_role(auth.uid(),'admin') AND company_id IS NOT NULL AND is_actively_impersonating(company_id));

-- Invoice items
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  tax_percent numeric NOT NULL DEFAULT 19,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  product_type text,
  source_product_id uuid,
  unit text DEFAULT 'buc',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage invoice items" ON public.invoice_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND user_belongs_to_company(i.company_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND user_belongs_to_company(i.company_id)));
CREATE POLICY "admin_impersonate_invoice_items" ON public.invoice_items
  FOR ALL USING (has_role(auth.uid(),'admin') AND EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND i.company_id IS NOT NULL AND is_actively_impersonating(i.company_id)))
  WITH CHECK (has_role(auth.uid(),'admin') AND EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND i.company_id IS NOT NULL AND is_actively_impersonating(i.company_id)));

-- Invoice payments
CREATE TABLE public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL DEFAULT 'transfer',
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage invoice payments" ON public.invoice_payments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_payments.invoice_id AND user_belongs_to_company(i.company_id) AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_payments.invoice_id AND user_belongs_to_company(i.company_id) AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales'))));
CREATE POLICY "admin_impersonate_invoice_payments" ON public.invoice_payments
  FOR ALL USING (has_role(auth.uid(),'admin') AND EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_payments.invoice_id AND i.company_id IS NOT NULL AND is_actively_impersonating(i.company_id)))
  WITH CHECK (has_role(auth.uid(),'admin') AND EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_payments.invoice_id AND i.company_id IS NOT NULL AND is_actively_impersonating(i.company_id)));

-- Trigger: recalc paid_amount and status
CREATE OR REPLACE FUNCTION public.recalc_invoice_paid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invoice_id uuid;
  v_paid numeric;
  v_total numeric;
  v_current_status invoice_status;
BEGIN
  v_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
  SELECT COALESCE(SUM(amount),0) INTO v_paid FROM public.invoice_payments WHERE invoice_id = v_invoice_id;
  SELECT total, status INTO v_total, v_current_status FROM public.invoices WHERE id = v_invoice_id;

  UPDATE public.invoices SET
    paid_amount = v_paid,
    status = CASE
      WHEN v_current_status IN ('cancelled','storno','draft') THEN v_current_status
      WHEN v_paid <= 0 THEN 'issued'::invoice_status
      WHEN v_paid >= v_total THEN 'paid'::invoice_status
      ELSE 'partially_paid'::invoice_status
    END,
    updated_at = now()
  WHERE id = v_invoice_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_recalc_invoice_paid_ins AFTER INSERT ON public.invoice_payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_invoice_paid();
CREATE TRIGGER trg_recalc_invoice_paid_upd AFTER UPDATE ON public.invoice_payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_invoice_paid();
CREATE TRIGGER trg_recalc_invoice_paid_del AFTER DELETE ON public.invoice_payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_invoice_paid();

-- updated_at triggers
CREATE TRIGGER trg_invoice_series_updated BEFORE UPDATE ON public.invoice_series
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: issue invoice (atomic numbering)
CREATE OR REPLACE FUNCTION public.issue_invoice(_invoice_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_inv record;
  v_series record;
  v_next int;
  v_year text;
  v_number text;
  v_attempts int := 0;
BEGIN
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'sales')) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_inv FROM public.invoices WHERE id = _invoice_id FOR UPDATE;
  IF v_inv IS NULL THEN RAISE EXCEPTION 'Invoice not found'; END IF;
  IF v_inv.status <> 'draft' THEN RAISE EXCEPTION 'Invoice already issued'; END IF;
  IF v_inv.series_id IS NULL THEN RAISE EXCEPTION 'No series selected'; END IF;
  IF NOT user_belongs_to_company(v_inv.company_id) AND NOT (has_role(auth.uid(),'admin') AND is_actively_impersonating(v_inv.company_id)) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  LOOP
    v_attempts := v_attempts + 1;
    SELECT * INTO v_series FROM public.invoice_series WHERE id = v_inv.series_id FOR UPDATE;
    v_next := GREATEST(v_series.current_number + 1, v_series.start_number);
    v_year := to_char(now(), 'YYYY');
    v_number := CASE WHEN v_series.prefix <> '' THEN v_series.prefix || '-' ELSE '' END
                || v_series.series_name
                || CASE WHEN v_series.year_in_format THEN '-' || v_year ELSE '' END
                || '-' || LPAD(v_next::text, v_series.padding_length, '0');

    IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE company_id = v_inv.company_id AND invoice_number = v_number) THEN
      UPDATE public.invoice_series SET current_number = v_next, updated_at = now() WHERE id = v_series.id;
      UPDATE public.invoices SET invoice_number = v_number, status = 'issued', issued_at = now(), updated_at = now() WHERE id = _invoice_id;
      RETURN v_number;
    END IF;

    IF v_attempts > 30 THEN RAISE EXCEPTION 'Could not generate unique invoice number'; END IF;
  END LOOP;
END;
$$;
