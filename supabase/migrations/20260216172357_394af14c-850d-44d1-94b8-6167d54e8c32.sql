INSERT INTO public.pricing_config (code, name, category, price, unit, is_active, sort_order, description)
VALUES ('partition_door_frame_aluminum', 'Toc Aluminiu Ușă Perete', 'accessories', 0, 'kit', true, 200, 'Kit toc aluminiu pentru ușă batantă perete despărțitor')
ON CONFLICT (code) DO NOTHING;