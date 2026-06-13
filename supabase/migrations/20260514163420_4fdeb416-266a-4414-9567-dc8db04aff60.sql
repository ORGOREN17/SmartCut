
-- =========================================
-- ROLES
-- =========================================
CREATE TYPE public.app_role AS ENUM ('customer', 'barber', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================
-- TIMESTAMP TRIGGER
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =========================================
-- USER PROFILES
-- =========================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- CUSTOMER PROFILES
-- =========================================
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT,
  hair_type TEXT,
  current_hair_length TEXT,
  hair_density TEXT,
  beard_status TEXT,
  preferred_style TEXT,
  maintenance_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own" ON public.customer_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Customers insert own" ON public.customer_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Customers update own" ON public.customer_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- BARBER PROFILES
-- =========================================
CREATE TABLE public.barber_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_registration_number TEXT,
  owner_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  address TEXT,
  google_reviews_link TEXT,
  instagram_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.barber_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view barbers" ON public.barber_profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Barber inserts own" ON public.barber_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Barber updates own" ON public.barber_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_barber_profiles_updated_at BEFORE UPDATE ON public.barber_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- USAGE LIMITS
-- =========================================
CREATE TABLE public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_actions_used INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 4,
  plan_type TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON public.usage_limits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own usage" ON public.usage_limits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own usage" ON public.usage_limits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =========================================
-- AI ANALYSES
-- =========================================
CREATE TABLE public.ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  input_image_url TEXT,
  selected_hairstyle_id TEXT,
  result_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own analyses" ON public.ai_analyses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own analyses" ON public.ai_analyses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================================
-- COMPARISON RESULTS
-- =========================================
CREATE TABLE public.comparison_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_image_url TEXT,
  final_image_url TEXT,
  match_score NUMERIC,
  match_level TEXT,
  breakdown_json JSONB,
  user_feedback TEXT,
  barber_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comparison_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own comparisons" ON public.comparison_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own comparisons" ON public.comparison_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comparisons" ON public.comparison_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =========================================
-- HAIRSTYLE RESULTS
-- =========================================
CREATE TABLE public.hairstyle_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  match_score NUMERIC,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hairstyle_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own hairstyles" ON public.hairstyle_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own hairstyles" ON public.hairstyle_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own hairstyles" ON public.hairstyle_results
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================
-- AUTO-CREATE PROFILE + USAGE ON SIGNUP
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  INSERT INTO public.usage_limits (user_id, date, ai_actions_used, daily_limit, plan_type)
  VALUES (NEW.id, CURRENT_DATE, 0, 4, 'free');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- STORAGE BUCKETS
-- =========================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('user-uploads', 'user-uploads', false),
  ('generated-hairstyles', 'generated-hairstyles', true),
  ('comparison-results', 'comparison-results', false);

-- user-uploads (private, per-user folder)
CREATE POLICY "Users read own uploads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own uploads" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- generated-hairstyles (public read)
CREATE POLICY "Public read generated hairstyles" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-hairstyles');
CREATE POLICY "Users upload generated hairstyles" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'generated-hairstyles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- comparison-results (private)
CREATE POLICY "Users read own comparisons storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'comparison-results' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own comparisons storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'comparison-results' AND auth.uid()::text = (storage.foldername(name))[1]);
