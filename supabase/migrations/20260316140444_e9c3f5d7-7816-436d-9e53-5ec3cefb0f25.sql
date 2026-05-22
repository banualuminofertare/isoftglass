
-- Table: admin_catalogs
CREATE TABLE public.admin_catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_catalogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage catalogs" ON public.admin_catalogs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table: admin_catalog_items
CREATE TABLE public.admin_catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL REFERENCES public.admin_catalogs(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'pricing',
  source_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage catalog items" ON public.admin_catalog_items
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Table: catalog_assignments
CREATE TABLE public.catalog_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL REFERENCES public.admin_catalogs(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL,
  assigned_by uuid NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.catalog_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage catalog assignments" ON public.catalog_assignments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
