
-- Add user_id and company_id to processing_templates for multi-tenant support
ALTER TABLE public.processing_templates
  ADD COLUMN user_id UUID,
  ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Admins can manage processing templates" ON public.processing_templates;
DROP POLICY IF EXISTS "Approved users can view processing templates" ON public.processing_templates;

-- New RLS policies: company members can CRUD their own, global templates are read-only for all
CREATE POLICY "Approved users can view all processing templates"
ON public.processing_templates
FOR SELECT
USING (
  is_approved_user() AND (
    company_id IS NULL
    OR user_belongs_to_company(company_id)
  )
);

CREATE POLICY "Company members can insert processing templates"
ON public.processing_templates
FOR INSERT
WITH CHECK (
  is_approved_user()
  AND user_id = auth.uid()
  AND (company_id = get_user_company_id(auth.uid()) OR company_id IS NULL)
);

CREATE POLICY "Company members can update own processing templates"
ON public.processing_templates
FOR UPDATE
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Company members can delete own processing templates"
ON public.processing_templates
FOR DELETE
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins can manage all processing templates"
ON public.processing_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
