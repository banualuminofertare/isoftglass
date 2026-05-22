
-- Allow all approved users to update materials (for stock adjustments)
DROP POLICY IF EXISTS "Admins and managers can manage materials" ON public.materials;
CREATE POLICY "Approved users can manage materials"
ON public.materials
FOR ALL
USING (is_approved_user())
WITH CHECK (is_approved_user());

-- Allow all approved users to manage stock movements
DROP POLICY IF EXISTS "Production staff can manage stock movements" ON public.stock_movements;
CREATE POLICY "Approved users can manage stock movements"
ON public.stock_movements
FOR ALL
USING (is_approved_user())
WITH CHECK (is_approved_user());
