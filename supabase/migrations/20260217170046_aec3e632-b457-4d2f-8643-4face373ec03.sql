
-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can delete their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can update their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own order items"
ON public.order_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own order items"
ON public.order_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own order items"
ON public.order_items FOR DELETE
USING (auth.uid() = user_id);
