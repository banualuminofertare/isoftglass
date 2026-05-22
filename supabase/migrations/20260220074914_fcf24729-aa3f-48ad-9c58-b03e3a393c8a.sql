
-- Insert glass materials from pricing_config into materials table
INSERT INTO public.materials (code, name, material_type, unit, unit_price, stock_quantity, min_stock_level, is_active)
VALUES
  -- Sticla 6mm
  ('glass_6_clear', 'Sticlă 6mm Transparentă', 'glass', 'sqm', 85, 0, 5, true),
  ('glass_6_frosted', 'Sticlă 6mm Mată', 'glass', 'sqm', 120, 0, 5, true),
  ('glass_6_bronze', 'Sticlă 6mm Bronz', 'glass', 'sqm', 110, 0, 5, true),
  ('glass_6_grey', 'Sticlă 6mm Gri', 'glass', 'sqm', 110, 0, 5, true),
  ('glass_6_green', 'Sticlă 6mm Verde', 'glass', 'sqm', 115, 0, 5, true),
  ('glass_6_low_e', 'Sticlă 6mm Low-E', 'glass', 'sqm', 180, 0, 5, true),
  ('glass_6_patterned', 'Sticlă 6mm Decorativă', 'glass', 'sqm', 140, 0, 5, true),
  -- Sticla 8mm
  ('glass_8_clear', 'Sticlă 8mm Transparentă', 'glass', 'sqm', 110, 0, 5, true),
  ('glass_8_frosted', 'Sticlă 8mm Mată', 'glass', 'sqm', 150, 0, 5, true),
  ('glass_8_bronze', 'Sticlă 8mm Bronz', 'glass', 'sqm', 140, 0, 5, true),
  ('glass_8_grey', 'Sticlă 8mm Gri', 'glass', 'sqm', 140, 0, 5, true),
  ('glass_8_green', 'Sticlă 8mm Verde', 'glass', 'sqm', 145, 0, 5, true),
  ('glass_8_low_e', 'Sticlă 8mm Low-E', 'glass', 'sqm', 220, 0, 5, true),
  ('glass_8_patterned', 'Sticlă 8mm Decorativă', 'glass', 'sqm', 170, 0, 5, true),
  -- Sticla 10mm
  ('glass_10_clear', 'Sticlă 10mm Transparentă', 'glass', 'sqm', 145, 0, 5, true),
  ('glass_10_frosted', 'Sticlă 10mm Mată', 'glass', 'sqm', 190, 0, 5, true),
  ('glass_10_bronze', 'Sticlă 10mm Bronz', 'glass', 'sqm', 175, 0, 5, true),
  ('glass_10_grey', 'Sticlă 10mm Gri', 'glass', 'sqm', 175, 0, 5, true),
  ('glass_10_green', 'Sticlă 10mm Verde', 'glass', 'sqm', 180, 0, 5, true),
  ('glass_10_low_e', 'Sticlă 10mm Low-E', 'glass', 'sqm', 280, 0, 5, true),
  ('glass_10_patterned', 'Sticlă 10mm Decorativă', 'glass', 'sqm', 210, 0, 5, true),
  -- Sticla 12mm
  ('glass_12_clear', 'Sticlă 12mm Transparentă', 'glass', 'sqm', 190, 0, 5, true),
  ('glass_12_frosted', 'Sticlă 12mm Mată', 'glass', 'sqm', 240, 0, 5, true),
  ('glass_12_bronze', 'Sticlă 12mm Bronz', 'glass', 'sqm', 220, 0, 5, true),
  ('glass_12_grey', 'Sticlă 12mm Gri', 'glass', 'sqm', 220, 0, 5, true),
  ('glass_12_green', 'Sticlă 12mm Verde', 'glass', 'sqm', 225, 0, 5, true),
  ('glass_12_low_e', 'Sticlă 12mm Low-E', 'glass', 'sqm', 350, 0, 5, true),
  ('glass_12_patterned', 'Sticlă 12mm Decorativă', 'glass', 'sqm', 260, 0, 5, true),
  -- Balustrade glass
  ('balustrade_glass_8', 'Sticlă balustradă 8mm', 'glass', 'sqm', 180, 0, 5, true),
  ('balustrade_glass_10', 'Sticlă balustradă 10mm', 'glass', 'sqm', 220, 0, 5, true),
  ('balustrade_glass_12', 'Sticlă balustradă 12mm', 'glass', 'sqm', 280, 0, 5, true),
  ('balustrade_glass_laminated', 'Sticlă laminată', 'glass', 'sqm', 85, 0, 5, true),
  -- Speciale
  ('10MM DUPLX', '10MM LAMINAT', 'glass', 'sqm', 1000, 0, 5, true),
  ('tmlss', '8mm anticalcar', 'glass', 'sqm', 250, 0, 5, true),
  -- Oglinzi
  ('mirror_3_silver', 'Oglindă 3mm Argintie', 'glass', 'sqm', 75, 0, 5, true),
  ('mirror_4_silver', 'Oglindă 4mm Argintie', 'glass', 'sqm', 95, 0, 5, true),
  ('mirror_4_bronze', 'Oglindă 4mm Bronz', 'glass', 'sqm', 135, 0, 5, true),
  ('mirror_4_grey', 'Oglindă 4mm Gri', 'glass', 'sqm', 135, 0, 5, true),
  ('mirror_5_silver', 'Oglindă 5mm Argintie', 'glass', 'sqm', 120, 0, 5, true),
  ('mirror_6_silver', 'Oglindă 6mm Argintie', 'glass', 'sqm', 145, 0, 5, true),
  -- Sticla bucatarie
  ('kitchen_frosted', 'Sticlă Sablată Bucătărie', 'glass', 'sqm', 45, 0, 5, true),
  ('kitchen_lacquered', 'Sticlă Lăcuită Bucătărie', 'glass', 'sqm', 180, 0, 5, true),
  ('kitchen_lacquered_metallic', 'Sticlă Lăcuită Metallic', 'glass', 'sqm', 220, 0, 5, true),
  ('kitchen_printed', 'Sticlă Printată Bucătărie', 'glass', 'sqm', 150, 0, 5, true)
ON CONFLICT (code) DO NOTHING;
