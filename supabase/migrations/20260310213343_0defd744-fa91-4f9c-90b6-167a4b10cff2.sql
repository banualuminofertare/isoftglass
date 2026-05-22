-- Fix INSERT policy to handle subscribers without company_id
DROP POLICY IF EXISTS "Company members can insert processing templates" ON public.processing_templates;

CREATE POLICY "Company members can insert processing templates"
ON public.processing_templates
FOR INSERT
TO authenticated
WITH CHECK (
  is_approved_user()
  AND user_id = auth.uid()
  AND (
    -- User has a company and template belongs to their company
    (company_id IS NOT NULL AND company_id = get_user_company_id(auth.uid()))
    -- User has no company, template has no company → personal template
    OR (company_id IS NULL AND get_user_company_id(auth.uid()) IS NULL)
    -- Admin can insert global templates (no company)
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Also fix UPDATE and DELETE policies for consistency
DROP POLICY IF EXISTS "Company members can update processing templates" ON public.processing_templates;

CREATE POLICY "Company members can update processing templates"
ON public.processing_templates
FOR UPDATE
TO authenticated
USING (
  is_approved_user()
  AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  )
);

DROP POLICY IF EXISTS "Company members can delete processing templates" ON public.processing_templates;

CREATE POLICY "Company members can delete processing templates"
ON public.processing_templates
FOR DELETE
TO authenticated
USING (
  is_approved_user()
  AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND user_id = auth.uid())
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
  )
);