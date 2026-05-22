CREATE POLICY "Authenticated update material images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'material-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'material-images' AND auth.role() = 'authenticated');