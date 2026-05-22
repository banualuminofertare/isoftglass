
-- 1. Add company_id to materials
ALTER TABLE public.materials 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- 2. Replace unique(code) with unique(code, company_id) NULLS NOT DISTINCT
ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS materials_code_company_uniq 
  ON public.materials (code, company_id) NULLS NOT DISTINCT;

CREATE INDEX IF NOT EXISTS idx_materials_company_id ON public.materials(company_id);

-- 3. Drop old permissive policy and recreate granular ones
DROP POLICY IF EXISTS "Approved users can manage materials" ON public.materials;
DROP POLICY IF EXISTS "Authenticated users can manage materials" ON public.materials;
DROP POLICY IF EXISTS "Materials are viewable by authenticated users" ON public.materials;
DROP POLICY IF EXISTS "View global + own company materials" ON public.materials;
DROP POLICY IF EXISTS "Insert own company materials or admin global" ON public.materials;
DROP POLICY IF EXISTS "Update own company materials or admin" ON public.materials;
DROP POLICY IF EXISTS "Delete own company materials or admin" ON public.materials;

-- SELECT: approved users see global + own company materials
CREATE POLICY "View global + own company materials"
ON public.materials FOR SELECT TO authenticated
USING (
  public.is_approved_user() AND (
    company_id IS NULL 
    OR company_id = public.get_user_company_id(auth.uid())
    OR (public.has_role(auth.uid(), 'admin'::app_role) AND public.has_accepted_access_to_company(company_id))
  )
);

-- INSERT: admin anything; subscribers only with company_id = their own company
CREATE POLICY "Insert own company materials or admin global"
ON public.materials FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.is_approved_user() 
    AND company_id IS NOT NULL 
    AND company_id = public.get_user_company_id(auth.uid())
  )
);

-- UPDATE: admin anything; subscribers only on own-company rows
CREATE POLICY "Update own company materials or admin"
ON public.materials FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.is_approved_user() 
    AND company_id IS NOT NULL 
    AND company_id = public.get_user_company_id(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.is_approved_user() 
    AND company_id IS NOT NULL 
    AND company_id = public.get_user_company_id(auth.uid())
  )
);

-- DELETE: admin anything; subscribers only on own-company rows
CREATE POLICY "Delete own company materials or admin"
ON public.materials FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    public.is_approved_user() 
    AND company_id IS NOT NULL 
    AND company_id = public.get_user_company_id(auth.uid())
  )
);
