-- Fix overly permissive RLS policies

-- Drop and recreate order_history INSERT policy with proper check
DROP POLICY IF EXISTS "Authenticated users can add order history" ON public.order_history;
CREATE POLICY "Authenticated users can add order history"
ON public.order_history FOR INSERT TO authenticated
WITH CHECK (changed_by = auth.uid());

-- Drop and recreate order_documents ALL policy with proper restrictions
DROP POLICY IF EXISTS "Authenticated users can manage order documents" ON public.order_documents;
CREATE POLICY "Authenticated users can upload order documents"
ON public.order_documents FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Authenticated users can delete own order documents"
ON public.order_documents FOR DELETE TO authenticated
USING (
    uploaded_by = auth.uid() OR 
    has_role(auth.uid(), 'admin')
);

-- Drop and recreate stock_reservations ALL policy with proper restrictions
DROP POLICY IF EXISTS "System can manage stock reservations" ON public.stock_reservations;
CREATE POLICY "Sales and admins can manage stock reservations"
ON public.stock_reservations FOR INSERT TO authenticated
WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'sales') OR
    has_role(auth.uid(), 'production_manager')
);

CREATE POLICY "Production can fulfill stock reservations"
ON public.stock_reservations FOR UPDATE TO authenticated
USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'production_manager') OR
    has_role(auth.uid(), 'operator')
);

CREATE POLICY "Admins can delete stock reservations"
ON public.stock_reservations FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));