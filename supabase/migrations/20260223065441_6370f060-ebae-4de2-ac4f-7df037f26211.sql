
-- Add processing access flag to profiles
ALTER TABLE public.profiles ADD COLUMN has_processing_access boolean NOT NULL DEFAULT false;
