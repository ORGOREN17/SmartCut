
-- business_videos table
CREATE TABLE IF NOT EXISTS public.business_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name text,
  prompt text NOT NULL,
  video_url text,
  title text,
  caption text,
  hashtags_json jsonb,
  provider text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own business videos"
  ON public.business_videos FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own business videos"
  ON public.business_videos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own business videos"
  ON public.business_videos FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-videos', 'business-videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read business videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-videos');

CREATE POLICY "Users upload own business videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'business-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own business videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'business-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
