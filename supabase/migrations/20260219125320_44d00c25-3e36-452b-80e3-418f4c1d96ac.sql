
CREATE TABLE public.user_accessory_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL,
  category TEXT NOT NULL,
  material_code TEXT NOT NULL,
  material_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_type, category, material_code)
);

ALTER TABLE public.user_accessory_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presets"
ON public.user_accessory_presets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets"
ON public.user_accessory_presets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
ON public.user_accessory_presets
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
ON public.user_accessory_presets
FOR UPDATE
USING (auth.uid() = user_id);
