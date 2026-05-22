
-- Add company_id and user_id to material_variants for per-tenant private variants
ALTER TABLE public.material_variants
  ADD COLUMN IF NOT EXISTS company_id uuid,
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Drop old unique constraint on variant_code if present
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.material_variants'::regclass AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.material_variants DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

DROP INDEX IF EXISTS public.material_variants_variant_code_key;

-- Partial unique indexes: globals unique by code; per-company unique (code, company_id)
CREATE UNIQUE INDEX IF NOT EXISTS material_variants_variant_code_global_key
  ON public.material_variants (variant_code) WHERE company_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS material_variants_variant_code_company_key
  ON public.material_variants (variant_code, company_id) WHERE company_id IS NOT NULL;

-- Replace RLS policies
DROP POLICY IF EXISTS "Admins and managers can manage material variants" ON public.material_variants;
DROP POLICY IF EXISTS "Approved users can view material variants" ON public.material_variants;

CREATE POLICY "View material variants"
ON public.material_variants FOR SELECT
USING (
  is_approved_user() AND (
    company_id IS NULL
    OR user_belongs_to_company(company_id)
  )
);

CREATE POLICY "Insert material variants"
ON public.material_variants FOR INSERT
WITH CHECK (
  is_approved_user() AND (
    -- Subscriber inserts a private variant tied to own company + own user_id
    (company_id = get_user_company_id(auth.uid()) AND user_id = auth.uid())
    -- Admin can insert global variants
    OR (company_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
    -- Admin/production_manager backward compatibility for managing globals
    OR (company_id IS NULL AND has_role(auth.uid(), 'production_manager'::app_role))
  )
);

CREATE POLICY "Update material variants"
ON public.material_variants FOR UPDATE
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role)))
  )
);

CREATE POLICY "Delete material variants"
ON public.material_variants FOR DELETE
USING (
  is_approved_user() AND (
    (company_id IS NOT NULL AND user_belongs_to_company(company_id))
    OR (company_id IS NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'production_manager'::app_role)))
  )
);

CREATE POLICY "admin_impersonate_material_variants"
ON public.material_variants FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND company_id IS NOT NULL
  AND is_actively_impersonating(company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND company_id IS NOT NULL
  AND is_actively_impersonating(company_id)
);
