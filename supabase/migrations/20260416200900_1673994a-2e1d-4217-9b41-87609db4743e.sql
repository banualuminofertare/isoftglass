ALTER TABLE public.admin_announcements 
ADD COLUMN IF NOT EXISTS title_translations JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS content_translations JSONB NOT NULL DEFAULT '{}'::jsonb;