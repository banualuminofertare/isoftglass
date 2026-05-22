-- Insert balustrade stair specific pricing items
INSERT INTO public.pricing_config (category, code, name, description, unit, price, is_multiplier, is_active, sort_order) VALUES
-- Glass panels for stairs (per sqm based on thickness)
('balustrade', 'balustrade_glass_8', 'Sticlă balustradă 8mm', 'Panou sticlă securizată 8mm pentru balustrade scări', 'RON/mp', 180, false, true, 1),
('balustrade', 'balustrade_glass_10', 'Sticlă balustradă 10mm', 'Panou sticlă securizată 10mm pentru balustrade scări', 'RON/mp', 220, false, true, 2),
('balustrade', 'balustrade_glass_12', 'Sticlă balustradă 12mm', 'Panou sticlă securizată 12mm pentru balustrade scări', 'RON/mp', 280, false, true, 3),
('balustrade', 'balustrade_glass_laminated', 'Sticlă laminată', 'Supliment sticlă laminată (stratificată)', 'RON/mp', 85, false, true, 4),

-- Mounting points
('balustrade', 'balustrade_mount_point', 'Punct prindere reglabil', 'Punct de prindere din inox reglabil', 'RON/buc', 45, false, true, 10),
('balustrade', 'balustrade_mount_fixed', 'Punct prindere fix', 'Punct de prindere din inox fix', 'RON/buc', 35, false, true, 11),

-- U-Profile
('balustrade', 'balustrade_u_profile_small', 'Profil U 30x20mm', 'Profil U aluminiu 30x20mm', 'RON/ml', 65, false, true, 20),
('balustrade', 'balustrade_u_profile_medium', 'Profil U 40x20mm', 'Profil U aluminiu 40x20mm', 'RON/ml', 80, false, true, 21),
('balustrade', 'balustrade_u_profile_large', 'Profil U 50x20mm', 'Profil U aluminiu 50x20mm', 'RON/ml', 95, false, true, 22),

-- Handrails
('balustrade', 'balustrade_handrail_round_42', 'Mână curentă rotundă Ø42', 'Mână curentă inox rotundă diametru 42mm', 'RON/ml', 120, false, true, 30),
('balustrade', 'balustrade_handrail_round_50', 'Mână curentă rotundă Ø50', 'Mână curentă inox rotundă diametru 50mm', 'RON/ml', 145, false, true, 31),
('balustrade', 'balustrade_handrail_flat', 'Mână curentă plată', 'Mână curentă inox profil plat', 'RON/ml', 160, false, true, 32),

-- Connectors and accessories
('balustrade', 'balustrade_elbow_connector', 'Cot conector', 'Cot sferic pentru conectare segmente mână curentă', 'RON/buc', 55, false, true, 40),
('balustrade', 'balustrade_end_cap', 'Capac terminal', 'Capac sferic pentru capăt mână curentă', 'RON/buc', 25, false, true, 41),
('balustrade', 'balustrade_wall_bracket', 'Suport perete', 'Suport fixare mână curentă pe perete', 'RON/buc', 38, false, true, 42),

-- Processing
('balustrade', 'balustrade_edge_polish', 'Polizare margini', 'Polizare margini sticlă', 'RON/ml', 18, false, true, 50),
('balustrade', 'balustrade_hole_drilling', 'Găurire', 'Găurire pentru punct de prindere', 'RON/buc', 12, false, true, 51),
('balustrade', 'balustrade_tempering', 'Călire sticlă', 'Tratament termic securizare', 'RON/mp', 45, false, true, 52),

-- Labor
('balustrade', 'balustrade_labor_simple', 'Manoperă balustradă simplă', 'Montaj balustradă dreaptă interior', 'RON/ml', 85, false, true, 60),
('balustrade', 'balustrade_labor_stairs', 'Manoperă balustradă scări', 'Montaj balustradă pe scări cu podeste', 'RON/ml', 150, false, true, 61),
('balustrade', 'balustrade_labor_exterior', 'Manoperă exterior', 'Montaj balustradă exterior', 'RON/ml', 180, false, true, 62),

-- Finish multipliers
('balustrade', 'balustrade_finish_polished', 'Finisaj inox lustruit', 'Multiplicator finisaj inox lustruit', 'x', 1.0, true, true, 70),
('balustrade', 'balustrade_finish_brushed', 'Finisaj inox periat', 'Multiplicator finisaj inox periat', 'x', 1.1, true, true, 71),
('balustrade', 'balustrade_finish_black', 'Finisaj negru mat', 'Multiplicator finisaj negru mat', 'x', 1.25, true, true, 72),
('balustrade', 'balustrade_finish_gold', 'Finisaj auriu', 'Multiplicator finisaj auriu', 'x', 1.4, true, true, 73),
('balustrade', 'balustrade_finish_anodized', 'Aluminiu anodizat', 'Multiplicator aluminiu anodizat', 'x', 1.0, true, true, 74)
ON CONFLICT (code) DO NOTHING;