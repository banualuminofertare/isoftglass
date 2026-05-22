
-- Create processing_templates table
CREATE TABLE public.processing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_code_prefix TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'hinge_cutout',
  dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
  drawing_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processing_templates ENABLE ROW LEVEL SECURITY;

-- Approved users can view
CREATE POLICY "Approved users can view processing templates"
  ON public.processing_templates FOR SELECT
  USING (is_approved_user());

-- Admins can manage
CREATE POLICY "Admins can manage processing templates"
  ON public.processing_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update updated_at
CREATE TRIGGER update_processing_templates_updated_at
  BEFORE UPDATE ON public.processing_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed SH56 T90 and L90 with the sketch from the PDF
INSERT INTO public.processing_templates (material_code_prefix, name, template_type, dimensions, drawing_url, notes)
VALUES
  ('30.SH56.T90', 'Decupaj balamă SH56 T90', 'hinge_cutout', '{"height": 63, "width": 44, "edge_offset": 8, "inner_height": 57}'::jsonb, '/materials/prelucrare_sh56.png', 'Balamă perete-sticlă 90° - serie SH56'),
  ('30.SH56.L90', 'Decupaj balamă SH56 L90', 'hinge_cutout', '{"height": 63, "width": 44, "edge_offset": 8, "inner_height": 57}'::jsonb, '/materials/prelucrare_sh56.png', 'Balamă perete-sticlă L90 - serie SH56');
