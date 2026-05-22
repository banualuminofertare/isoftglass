
-- Drop the overly permissive ALL policy on stock_movements
DROP POLICY IF EXISTS "Approved users can manage stock movements" ON public.stock_movements;

-- Create separate INSERT policy: user must set created_by to their own id
CREATE POLICY "Users can insert own stock movements"
  ON public.stock_movements FOR INSERT
  WITH CHECK (is_approved_user() AND created_by = auth.uid());

-- Create UPDATE policy: only own movements
CREATE POLICY "Users can update own stock movements"
  ON public.stock_movements FOR UPDATE
  USING (is_approved_user() AND created_by = auth.uid());

-- Create DELETE policy: only own movements
CREATE POLICY "Users can delete own stock movements"
  ON public.stock_movements FOR DELETE
  USING (is_approved_user() AND created_by = auth.uid());
