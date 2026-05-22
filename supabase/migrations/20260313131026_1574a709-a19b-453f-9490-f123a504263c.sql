CREATE POLICY "admin_can_view_all_templates"
ON public.processing_templates FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));