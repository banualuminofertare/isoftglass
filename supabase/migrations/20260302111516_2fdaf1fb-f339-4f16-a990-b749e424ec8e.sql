ALTER TABLE public.profiles 
  ADD COLUMN has_calculator_access boolean NOT NULL DEFAULT true,
  ADD COLUMN has_operational_access boolean NOT NULL DEFAULT true;