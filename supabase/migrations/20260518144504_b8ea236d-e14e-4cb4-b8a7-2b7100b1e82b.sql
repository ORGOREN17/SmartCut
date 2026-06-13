-- Create storage bucket for business promo images
INSERT INTO storage.buckets (id, name, public) VALUES ('business-content-images', 'business-content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, user writes own folder
CREATE POLICY "Public read business content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-content-images');

CREATE POLICY "Users upload own business content images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-content-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own business content images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-content-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Metadata table
CREATE TABLE public.business_content_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_name TEXT,
  prompt TEXT NOT NULL,
  image_url TEXT,
  title TEXT,
  caption TEXT,
  hashtags_json JSONB,
  aspect_ratio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_content_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own business content images"
ON public.business_content_images FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own business content images"
ON public.business_content_images FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own business content images"
ON public.business_content_images FOR DELETE TO authenticated
USING (auth.uid() = user_id);