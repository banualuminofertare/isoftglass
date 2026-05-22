
CREATE TABLE public.quotes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_number text NOT NULL,
  product_type text NOT NULL,
  product_label text NOT NULL,
  config_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  price_breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  tva_percent numeric NOT NULL DEFAULT 19,
  client_name text,
  client_phone text,
  client_email text,
  markup_percent numeric DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft'
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own quotes" ON public.quotes
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all quotes" ON public.quotes
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete all quotes" ON public.quotes
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
