-- Fix: Restrict subscription_plans to authenticated users only
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Authenticated users can view subscription plans"
ON public.subscription_plans FOR SELECT
TO authenticated
USING (true);

-- Fix: Make company-logos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'company-logos';

-- Fix: Update storage policy to require authentication
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
CREATE POLICY "Authenticated users can view company logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'company-logos');