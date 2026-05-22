
-- ============ storage.objects: company-logos ============
DROP POLICY IF EXISTS "Admins can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete company logos" ON storage.objects;

CREATE POLICY "Company members can upload own company logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND (
    (split_part(name, '/', 1))::uuid = public.get_user_company_id(auth.uid())
    OR (public.has_role(auth.uid(), 'admin') AND public.is_actively_impersonating((split_part(name, '/', 1))::uuid))
  )
);

CREATE POLICY "Company members can update own company logo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    (split_part(name, '/', 1))::uuid = public.get_user_company_id(auth.uid())
    OR (public.has_role(auth.uid(), 'admin') AND public.is_actively_impersonating((split_part(name, '/', 1))::uuid))
  )
);

CREATE POLICY "Company members can delete own company logo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    (split_part(name, '/', 1))::uuid = public.get_user_company_id(auth.uid())
    OR (public.has_role(auth.uid(), 'admin') AND public.is_actively_impersonating((split_part(name, '/', 1))::uuid))
  )
);

-- ============ storage.objects: material-images ============
DROP POLICY IF EXISTS "Authenticated upload material images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update material images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete material images" ON storage.objects;

CREATE POLICY "Admins can upload material images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update material images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete material images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'));

-- ============ public.company_settings ============
DROP POLICY IF EXISTS "Authenticated users can view company settings" ON public.company_settings;

CREATE POLICY "Admins can view company settings"
ON public.company_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============ public.sliding_mechanisms ============
DROP POLICY IF EXISTS "Company members can view sliding mechanisms" ON public.sliding_mechanisms;

CREATE POLICY "Authenticated members can view sliding mechanisms"
ON public.sliding_mechanisms FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND (public.user_belongs_to_company(company_id) OR company_id IS NULL)
);

-- ============ public.client_error_logs ============
DROP POLICY IF EXISTS "Authenticated users can insert error logs" ON public.client_error_logs;

CREATE POLICY "Users insert own error logs"
ON public.client_error_logs FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (user_id IS NULL OR user_id = auth.uid())
);
