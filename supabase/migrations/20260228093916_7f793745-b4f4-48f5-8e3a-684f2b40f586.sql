
CREATE TABLE public.accessory_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  product_types text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.accessory_kit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id uuid NOT NULL REFERENCES public.accessory_kits(id) ON DELETE CASCADE,
  material_code text NOT NULL,
  material_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.accessory_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own kits" ON public.accessory_kits FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own kit items" ON public.accessory_kit_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.accessory_kits WHERE id = kit_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.accessory_kits WHERE id = kit_id AND user_id = auth.uid()));
