DROP POLICY IF EXISTS "Public read material images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view company logos" ON storage.objects;

CREATE POLICY "Admins can list material images"
ON storage.objects FOR SELECT
USING (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can list company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Members can list own company logo"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-logos'
  AND (split_part(name, '/', 1))::uuid = public.get_user_company_id(auth.uid())
);