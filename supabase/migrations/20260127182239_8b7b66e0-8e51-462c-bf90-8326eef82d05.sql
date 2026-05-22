-- Create enum for price categories
CREATE TYPE public.price_category AS ENUM (
  'glass',           -- Glass prices per sqm
  'processing',      -- Processing costs (holes, cutouts, polishing, etc.)
  'accessories',     -- Accessories (hinges, handles, seals, etc.)
  'labor',           -- Labor costs
  'finishing'        -- Finishing multipliers
);

-- Create pricing configuration table
CREATE TABLE public.pricing_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category price_category NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'RON',
  price NUMERIC NOT NULL DEFAULT 0,
  is_multiplier BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, code)
);

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view pricing" 
ON public.pricing_config FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Admins can manage pricing" 
ON public.pricing_config FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_pricing_config_updated_at
BEFORE UPDATE ON public.pricing_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default glass prices
INSERT INTO public.pricing_config (category, code, name, description, unit, price, sort_order) VALUES
-- Glass 6mm
('glass', 'glass_6_clear', 'Sticlă 6mm Transparentă', 'Sticlă float transparentă 6mm', 'RON/mp', 85, 1),
('glass', 'glass_6_frosted', 'Sticlă 6mm Mată', 'Sticlă sablată 6mm', 'RON/mp', 120, 2),
('glass', 'glass_6_patterned', 'Sticlă 6mm Decorativă', 'Sticlă cu model 6mm', 'RON/mp', 140, 3),
('glass', 'glass_6_bronze', 'Sticlă 6mm Bronz', 'Sticlă colorată bronz 6mm', 'RON/mp', 110, 4),
('glass', 'glass_6_grey', 'Sticlă 6mm Gri', 'Sticlă colorată gri 6mm', 'RON/mp', 110, 5),
('glass', 'glass_6_green', 'Sticlă 6mm Verde', 'Sticlă colorată verde 6mm', 'RON/mp', 115, 6),
('glass', 'glass_6_low_e', 'Sticlă 6mm Low-E', 'Sticlă cu emisivitate scăzută 6mm', 'RON/mp', 180, 7),
-- Glass 8mm
('glass', 'glass_8_clear', 'Sticlă 8mm Transparentă', 'Sticlă float transparentă 8mm', 'RON/mp', 110, 10),
('glass', 'glass_8_frosted', 'Sticlă 8mm Mată', 'Sticlă sablată 8mm', 'RON/mp', 150, 11),
('glass', 'glass_8_patterned', 'Sticlă 8mm Decorativă', 'Sticlă cu model 8mm', 'RON/mp', 170, 12),
('glass', 'glass_8_bronze', 'Sticlă 8mm Bronz', 'Sticlă colorată bronz 8mm', 'RON/mp', 140, 13),
('glass', 'glass_8_grey', 'Sticlă 8mm Gri', 'Sticlă colorată gri 8mm', 'RON/mp', 140, 14),
('glass', 'glass_8_green', 'Sticlă 8mm Verde', 'Sticlă colorată verde 8mm', 'RON/mp', 145, 15),
('glass', 'glass_8_low_e', 'Sticlă 8mm Low-E', 'Sticlă cu emisivitate scăzută 8mm', 'RON/mp', 220, 16),
-- Glass 10mm
('glass', 'glass_10_clear', 'Sticlă 10mm Transparentă', 'Sticlă float transparentă 10mm', 'RON/mp', 145, 20),
('glass', 'glass_10_frosted', 'Sticlă 10mm Mată', 'Sticlă sablată 10mm', 'RON/mp', 190, 21),
('glass', 'glass_10_patterned', 'Sticlă 10mm Decorativă', 'Sticlă cu model 10mm', 'RON/mp', 210, 22),
('glass', 'glass_10_bronze', 'Sticlă 10mm Bronz', 'Sticlă colorată bronz 10mm', 'RON/mp', 175, 23),
('glass', 'glass_10_grey', 'Sticlă 10mm Gri', 'Sticlă colorată gri 10mm', 'RON/mp', 175, 24),
('glass', 'glass_10_green', 'Sticlă 10mm Verde', 'Sticlă colorată verde 10mm', 'RON/mp', 180, 25),
('glass', 'glass_10_low_e', 'Sticlă 10mm Low-E', 'Sticlă cu emisivitate scăzută 10mm', 'RON/mp', 280, 26),
-- Glass 12mm
('glass', 'glass_12_clear', 'Sticlă 12mm Transparentă', 'Sticlă float transparentă 12mm', 'RON/mp', 190, 30),
('glass', 'glass_12_frosted', 'Sticlă 12mm Mată', 'Sticlă sablată 12mm', 'RON/mp', 240, 31),
('glass', 'glass_12_patterned', 'Sticlă 12mm Decorativă', 'Sticlă cu model 12mm', 'RON/mp', 260, 32),
('glass', 'glass_12_bronze', 'Sticlă 12mm Bronz', 'Sticlă colorată bronz 12mm', 'RON/mp', 220, 33),
('glass', 'glass_12_grey', 'Sticlă 12mm Gri', 'Sticlă colorată gri 12mm', 'RON/mp', 220, 34),
('glass', 'glass_12_green', 'Sticlă 12mm Verde', 'Sticlă colorată verde 12mm', 'RON/mp', 225, 35),
('glass', 'glass_12_low_e', 'Sticlă 12mm Low-E', 'Sticlă cu emisivitate scăzută 12mm', 'RON/mp', 350, 36),
-- Special glass treatments
('glass', 'tempering', 'Călire', 'Cost călire sticlă', 'RON/mp', 45, 40),
('glass', 'laminating', 'Laminare', 'Cost laminare sticlă', 'RON/mp', 85, 41),
-- Mirror glass
('glass', 'mirror_3_silver', 'Oglindă 3mm Argintie', 'Oglindă standard argintie 3mm', 'RON/mp', 75, 50),
('glass', 'mirror_4_silver', 'Oglindă 4mm Argintie', 'Oglindă standard argintie 4mm', 'RON/mp', 95, 51),
('glass', 'mirror_5_silver', 'Oglindă 5mm Argintie', 'Oglindă standard argintie 5mm', 'RON/mp', 120, 52),
('glass', 'mirror_6_silver', 'Oglindă 6mm Argintie', 'Oglindă standard argintie 6mm', 'RON/mp', 145, 53),
('glass', 'mirror_4_bronze', 'Oglindă 4mm Bronz', 'Oglindă colorată bronz 4mm', 'RON/mp', 135, 54),
('glass', 'mirror_4_grey', 'Oglindă 4mm Gri', 'Oglindă colorată gri 4mm', 'RON/mp', 135, 55),
-- Kitchen glass
('glass', 'kitchen_lacquered', 'Sticlă Lăcuită Bucătărie', 'Sticlă lăcuită pentru fronturi', 'RON/mp', 180, 60),
('glass', 'kitchen_lacquered_metallic', 'Sticlă Lăcuită Metallic', 'Sticlă lăcuită efect metalic', 'RON/mp', 220, 61);

-- Insert processing costs
INSERT INTO public.pricing_config (category, code, name, description, unit, price, sort_order) VALUES
('processing', 'hole', 'Găurire', 'Cost per gaură', 'RON/buc', 15, 1),
('processing', 'cutout_small', 'Decupaj Mic', 'Decupaj mic (sub 100cm²)', 'RON/buc', 50, 2),
('processing', 'cutout_large', 'Decupaj Mare', 'Decupaj mare (peste 100cm²)', 'RON/buc', 100, 3),
('processing', 'edge_polish_matte', 'Polizare Mat', 'Polizare margini mat', 'RON/ml', 8, 4),
('processing', 'edge_polish_polished', 'Polizare Lustruit', 'Polizare margini lustruit', 'RON/ml', 15, 5),
('processing', 'bevel', 'Teșire', 'Teșire margini', 'RON/ml', 25, 6),
('processing', 'sandblasting_full', 'Sablare Integrală', 'Sablare pe toată suprafața', 'RON/mp', 35, 7),
('processing', 'sandblasting_partial', 'Sablare Parțială', 'Sablare parțială/model', 'RON/mp', 55, 8),
('processing', 'anti_calc', 'Tratament Anti-Calcar', 'Tratament hidrofob anti-calcar', 'RON/mp', 40, 9);

-- Insert accessory prices
INSERT INTO public.pricing_config (category, code, name, description, unit, price, sort_order) VALUES
-- Hinges
('accessories', 'hinge_wall_glass', 'Balama Perete-Sticlă', 'Balama fixare perete-sticlă', 'RON/buc', 85, 1),
('accessories', 'hinge_glass_glass', 'Balama Sticlă-Sticlă', 'Balama fixare sticlă-sticlă', 'RON/buc', 95, 2),
-- Handles
('accessories', 'handle_bar_200', 'Mâner Bar 200mm', 'Mâner tip bară 200mm', 'RON/buc', 65, 10),
('accessories', 'handle_bar_400', 'Mâner Bar 400mm', 'Mâner tip bară 400mm', 'RON/buc', 85, 11),
('accessories', 'handle_bar_600', 'Mâner Bar 600mm', 'Mâner tip bară 600mm', 'RON/buc', 105, 12),
('accessories', 'handle_round', 'Mâner Rotund', 'Mâner buton rotund', 'RON/buc', 55, 13),
('accessories', 'handle_square', 'Mâner Pătrat', 'Mâner buton pătrat', 'RON/buc', 75, 14),
-- Stabilizers
('accessories', 'stabilizer_short', 'Stabilizator Scurt', 'Stabilizator până la 500mm', 'RON/buc', 45, 20),
('accessories', 'stabilizer_medium', 'Stabilizator Mediu', 'Stabilizator 500-1000mm', 'RON/buc', 65, 21),
('accessories', 'stabilizer_long', 'Stabilizator Lung', 'Stabilizator peste 1000mm', 'RON/buc', 85, 22),
-- Seals
('accessories', 'seal_magnetic', 'Garnitură Magnetică', 'Garnitură magnetică pentru uși', 'RON/ml', 35, 30),
('accessories', 'seal_rubber', 'Garnitură Cauciuc', 'Garnitură cauciuc standard', 'RON/ml', 15, 31),
('accessories', 'seal_threshold', 'Garnitură Prag', 'Garnitură pentru prag', 'RON/ml', 45, 32),
-- Profiles
('accessories', 'profile_u', 'Profil U', 'Profil U aluminiu', 'RON/ml', 55, 40),
('accessories', 'profile_compensation', 'Profil Compensare', 'Profil compensare perete', 'RON/ml', 65, 41),
-- Pivot system
('accessories', 'pivot_basic', 'Pivot Standard', 'Sistem pivot fără amortizor', 'RON/set', 180, 50),
('accessories', 'pivot_with_damper', 'Pivot cu Amortizor', 'Sistem pivot cu amortizor', 'RON/set', 280, 51),
-- Sliding system
('accessories', 'sliding_rail', 'Șină Culisare', 'Șină sistem culisant', 'RON/ml', 120, 60),
('accessories', 'sliding_rollers', 'Role Culisare', 'Set role culisare', 'RON/set', 95, 61),
('accessories', 'sliding_damper', 'Amortizor Culisare', 'Amortizor pentru sistem culisant', 'RON/buc', 85, 62),
-- Locks
('accessories', 'lock_key', 'Încuietoare cu Cheie', 'Încuietoare simplă cu cheie', 'RON/buc', 120, 70),
('accessories', 'lock_cylinder', 'Încuietoare Cilindru', 'Încuietoare cu cilindru', 'RON/buc', 180, 71),
-- Mount points (balustrade)
('accessories', 'mount_point_basic', 'Punct Fixare Standard', 'Punct fixare standard balustradă', 'RON/buc', 35, 80),
('accessories', 'mount_point_adjustable', 'Punct Fixare Reglabil', 'Punct fixare reglabil balustradă', 'RON/buc', 55, 81),
-- Handrail
('accessories', 'handrail_42', 'Mână Curentă Ø42', 'Mână curentă diametru 42mm', 'RON/ml', 85, 90),
('accessories', 'handrail_50', 'Mână Curentă Ø50', 'Mână curentă diametru 50mm', 'RON/ml', 105, 91),
-- LED (mirrors)
('accessories', 'led_perimeter', 'LED Perimetral', 'Iluminare LED perimetrală', 'RON/ml', 150, 100),
('accessories', 'led_integrated', 'LED Integrat', 'Iluminare LED integrată în oglindă', 'RON/mp', 250, 101),
('accessories', 'led_defogging', 'Sistem Dezaburire', 'Sistem dezaburire electrică', 'RON/buc', 120, 102);

-- Insert labor costs
INSERT INTO public.pricing_config (category, code, name, description, unit, price, sort_order) VALUES
('labor', 'labor_base', 'Cost Bază Comandă', 'Cost fix per comandă', 'RON', 150, 1),
('labor', 'labor_per_sqm', 'Manoperă per mp', 'Cost manoperă per metru pătrat', 'RON/mp', 25, 2),
('labor', 'assembly_simple', 'Montaj Simplu', 'Montaj produs simplu', 'RON', 50, 3),
('labor', 'assembly_complex', 'Montaj Complex', 'Montaj produs complex (cabină, balustradă)', 'RON', 150, 4);

-- Insert finishing multipliers
INSERT INTO public.pricing_config (category, code, name, description, unit, price, is_multiplier, sort_order) VALUES
('finishing', 'polished_stainless', 'Inox Lustruit', 'Finisaj inox lustruit', 'x', 1.00, true, 1),
('finishing', 'brushed_stainless', 'Inox Periat', 'Finisaj inox periat/șlefuit', 'x', 1.10, true, 2),
('finishing', 'matte_black', 'Negru Mat', 'Finisaj negru mat', 'x', 1.25, true, 3),
('finishing', 'chrome', 'Crom', 'Finisaj cromat', 'x', 1.15, true, 4),
('finishing', 'anodized_silver', 'Argintiu Anodizat', 'Finisaj argintiu anodizat', 'x', 1.05, true, 5);