
-- Allow company owners to view profiles of their company members
CREATE POLICY "Company owners can view member profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  company_id IS NOT NULL
  AND company_id = public.get_user_company_id(auth.uid())
);

-- Allow company owners to update member profiles (permissions)
CREATE POLICY "Company owners can update member profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (
  company_id IS NOT NULL
  AND company_id = public.get_user_company_id(auth.uid())
  AND public.is_company_owner(auth.uid())
);
