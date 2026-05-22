
-- Create sliding_mechanisms table
CREATE TABLE public.sliding_mechanisms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  door_height_deduction numeric NOT NULL DEFAULT 40,
  fixed_panel_height_deduction numeric NOT NULL DEFAULT 46,
  width_overlap numeric NOT NULL DEFAULT 40,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sliding_mechanisms ENABLE ROW LEVEL SECURITY;

-- RLS policies using existing company pattern
CREATE POLICY "Company members can view sliding mechanisms"
  ON public.sliding_mechanisms FOR SELECT
  USING (user_belongs_to_company(company_id) OR company_id IS NULL);

CREATE POLICY "Company members can insert sliding mechanisms"
  ON public.sliding_mechanisms FOR INSERT
  WITH CHECK (is_approved_user() AND (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL));

CREATE POLICY "Company members can update sliding mechanisms"
  ON public.sliding_mechanisms FOR UPDATE
  USING (is_approved_user() AND (user_belongs_to_company(company_id) OR company_id IS NULL));

CREATE POLICY "Company members can delete sliding mechanisms"
  ON public.sliding_mechanisms FOR DELETE
  USING (is_approved_user() AND (user_belongs_to_company(company_id) OR company_id IS NULL));

CREATE POLICY "admin_all_sliding_mechanisms"
  ON public.sliding_mechanisms FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
