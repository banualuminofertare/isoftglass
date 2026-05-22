
-- Drop existing policies that might leak data between companies
DROP POLICY IF EXISTS "Approved users can view all processing templates" ON public.processing_templates;
DROP POLICY IF EXISTS "Company members can delete own processing templates" ON public.processing_templates;
DROP POLICY IF EXISTS "Company members can insert processing templates" ON public.processing_templates;
DROP POLICY IF EXISTS "Company members can update own processing templates" ON public.processing_templates;

-- SELECT: company members see only their company's templates + global ones
CREATE POLICY "Company members can view processing templates"
ON public.processing_templates
FOR SELECT
TO authenticated
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL)
  )
);

-- INSERT: only into own company
CREATE POLICY "Company members can insert processing templates"
ON public.processing_templates
FOR INSERT
TO authenticated
WITH CHECK (
  is_approved_user()
  AND user_id = auth.uid()
  AND ((company_id = get_user_company_id(auth.uid())) OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role)))
);

-- UPDATE: own company only (no cross-company)
CREATE POLICY "Company members can update processing templates"
ON public.processing_templates
FOR UPDATE
TO authenticated
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  )
);

-- DELETE: own company only
CREATE POLICY "Company members can delete processing templates"
ON public.processing_templates
FOR DELETE
TO authenticated
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  )
);
