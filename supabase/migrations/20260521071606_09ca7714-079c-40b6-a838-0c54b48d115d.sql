-- Lock global processing_templates (company_id IS NULL) to admin-only writes
DROP POLICY IF EXISTS "Company members can delete processing templates" ON public.processing_templates;
DROP POLICY IF EXISTS "Company members can update processing templates" ON public.processing_templates;
DROP POLICY IF EXISTS "Company members can insert processing templates" ON public.processing_templates;

CREATE POLICY "Company members can delete processing templates"
ON public.processing_templates FOR DELETE
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND has_role((SELECT auth.uid()), 'admin'::app_role))
  )
);

CREATE POLICY "Company members can update processing templates"
ON public.processing_templates FOR UPDATE
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND has_role((SELECT auth.uid()), 'admin'::app_role))
  )
);

CREATE POLICY "Company members can insert processing templates"
ON public.processing_templates FOR INSERT
WITH CHECK (
  is_approved_user() AND user_id = (SELECT auth.uid()) AND (
    (company_id IS NOT NULL AND company_id = get_user_company_id((SELECT auth.uid())))
    OR (company_id IS NULL AND has_role((SELECT auth.uid()), 'admin'::app_role))
  )
);