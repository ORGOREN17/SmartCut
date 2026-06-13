
-- 1) Restrict barber_profiles SELECT to owner only
DROP POLICY IF EXISTS "Anyone authenticated can view barbers" ON public.barber_profiles;
CREATE POLICY "Barbers view own profile" ON public.barber_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2) Prevent privilege escalation: self-insert limited to 'customer'
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can self-assign customer role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'customer'::app_role);

-- 3) Lock down SECURITY DEFINER helper (not referenced by any RLS policy)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- 4) Storage: business-videos — owner-only listing/select (public direct URLs still work)
DROP POLICY IF EXISTS "Users select own business videos storage" ON storage.objects;
CREATE POLICY "Users select own business videos storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'business-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5) Storage: comparison-results — allow owner DELETE
DROP POLICY IF EXISTS "Users delete own comparisons storage" ON storage.objects;
CREATE POLICY "Users delete own comparisons storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'comparison-results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6) Storage: prevent broad listing on public buckets — replace public SELECT with owner-scoped
DROP POLICY IF EXISTS "Public read business content images" ON storage.objects;
CREATE POLICY "Users select own business content images storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'business-content-images' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public read generated hairstyles" ON storage.objects;
CREATE POLICY "Users select own generated hairstyles storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'generated-hairstyles' AND auth.uid()::text = (storage.foldername(name))[1]);
