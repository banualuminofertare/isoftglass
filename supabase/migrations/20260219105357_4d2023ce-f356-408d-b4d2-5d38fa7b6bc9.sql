
-- Adauga coloana imagine
ALTER TABLE materials ADD COLUMN IF NOT EXISTS image_url text;

-- Tabel variante culoare
CREATE TABLE material_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  variant_code text NOT NULL,
  variant_name text NOT NULL,
  color_hex text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- RLS pe material_variants
ALTER TABLE material_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can view material variants"
  ON material_variants FOR SELECT
  USING (is_approved_user());

CREATE POLICY "Admins and managers can manage material variants"
  ON material_variants FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role));

-- Bucket storage pentru imagini produse
INSERT INTO storage.buckets (id, name, public) VALUES ('material-images', 'material-images', true);

-- Politici storage
CREATE POLICY "Authenticated upload material images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'material-images' AND auth.role() = 'authenticated');
CREATE POLICY "Public read material images" ON storage.objects
  FOR SELECT USING (bucket_id = 'material-images');
CREATE POLICY "Authenticated delete material images" ON storage.objects
  FOR DELETE USING (bucket_id = 'material-images' AND auth.role() = 'authenticated');
