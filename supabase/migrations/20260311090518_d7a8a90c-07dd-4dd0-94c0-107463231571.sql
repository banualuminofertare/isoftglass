
CREATE TABLE public.glass_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  width numeric NOT NULL,
  height numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.glass_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view glass sheets"
ON public.glass_sheets FOR SELECT TO authenticated
USING (
  is_approved_user() AND (
    user_belongs_to_company(company_id) OR
    (company_id IS NULL AND (user_id IS NULL OR user_id = auth.uid()))
  )
);

CREATE POLICY "Company members can insert glass sheets"
ON public.glass_sheets FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user() AND (
    company_id = get_user_company_id(auth.uid()) OR company_id IS NULL
  )
);

CREATE POLICY "Company members can update glass sheets"
ON public.glass_sheets FOR UPDATE TO authenticated
USING (
  is_approved_user() AND (
    user_belongs_to_company(company_id) OR
    (company_id IS NULL AND user_id = auth.uid())
  )
);

CREATE POLICY "Company members can delete glass sheets"
ON public.glass_sheets FOR DELETE TO authenticated
USING (
  is_approved_user() AND (
    user_belongs_to_company(company_id) OR
    (company_id IS NULL AND user_id = auth.uid())
  )
);
