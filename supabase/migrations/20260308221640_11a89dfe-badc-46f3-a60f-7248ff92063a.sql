INSERT INTO public.pricing_config (category, code, name, description, unit, price, is_multiplier, is_active, sort_order)
VALUES ('labor', 'transport', 'Cost Transport', 'Cost transport și livrare', '%', 0, false, true, 5)
ON CONFLICT DO NOTHING;