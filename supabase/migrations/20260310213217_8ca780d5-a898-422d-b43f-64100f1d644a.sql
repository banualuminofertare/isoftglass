DROP POLICY IF EXISTS "Company members can insert processing templates" ON public.processing_templates;

CREATE POLICY "Company members can insert processing templates"
ON public.processing_templates
FOR INSERT
TO authenticated
WITH CHECK (
  is_approved_user()
  AND user_id = auth.uid()
  AND (
    (company_id = get_user_company_id(auth.uid()))
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  )
);