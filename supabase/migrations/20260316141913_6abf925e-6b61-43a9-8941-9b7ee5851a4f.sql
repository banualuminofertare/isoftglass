INSERT INTO storage.buckets (id, name, public) VALUES ('catalog-pdfs', 'catalog-pdfs', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can upload catalog PDFs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalog-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can read catalog PDFs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'catalog-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete catalog PDFs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'catalog-pdfs' AND public.has_role(auth.uid(), 'admin'));