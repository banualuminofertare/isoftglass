
-- Create user_stock table for per-user stock isolation
CREATE TABLE public.user_stock (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  stock_quantity numeric NOT NULL DEFAULT 0,
  min_stock_level numeric NOT NULL DEFAULT 0,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Enable RLS
ALTER TABLE public.user_stock ENABLE ROW LEVEL SECURITY;

-- Strict RLS: only own data, NO admin exception
CREATE POLICY "Users can view own stock"
  ON public.user_stock FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Approved users can insert own stock"
  ON public.user_stock FOR INSERT
  WITH CHECK (is_approved_user() AND auth.uid() = user_id);

CREATE POLICY "Approved users can update own stock"
  ON public.user_stock FOR UPDATE
  USING (is_approved_user() AND auth.uid() = user_id);

CREATE POLICY "Approved users can delete own stock"
  ON public.user_stock FOR DELETE
  USING (is_approved_user() AND auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_user_stock_updated_at
  BEFORE UPDATE ON public.user_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update stock_movements RLS: only creator can see their movements
DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON public.stock_movements;
CREATE POLICY "Users can view own stock movements"
  ON public.stock_movements FOR SELECT
  USING (created_by = auth.uid());
