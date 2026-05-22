
-- Table to store markup percentages per client type
CREATE TABLE public.client_type_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_type public.client_type NOT NULL UNIQUE,
  markup_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed default rows
INSERT INTO public.client_type_pricing (client_type, markup_percent) VALUES
  ('person', 0),
  ('company', 0),
  ('distributor', 0);

ALTER TABLE public.client_type_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view client type pricing"
  ON public.client_type_pricing FOR SELECT USING (true);

CREATE POLICY "Admins can manage client type pricing"
  ON public.client_type_pricing FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_client_type_pricing_updated_at
  BEFORE UPDATE ON public.client_type_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
