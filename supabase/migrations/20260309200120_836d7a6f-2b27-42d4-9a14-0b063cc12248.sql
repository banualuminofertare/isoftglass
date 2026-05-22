
-- Drop the admin ALL policy that gives full visibility
DROP POLICY IF EXISTS "Admins can manage all processing templates" ON public.processing_templates;

-- Create admin policy limited to global templates (company_id IS NULL) only
CREATE POLICY "Admins can manage global processing templates"
ON public.processing_templates
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role) AND company_id IS NULL
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) AND company_id IS NULL
);
