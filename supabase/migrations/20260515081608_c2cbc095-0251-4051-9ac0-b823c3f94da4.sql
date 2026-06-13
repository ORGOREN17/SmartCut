
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text;

ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS hairline_status text,
  ADD COLUMN IF NOT EXISTS preferred_length text,
  ADD COLUMN IF NOT EXISTS openness_to_change text,
  ADD COLUMN IF NOT EXISTS work_style text,
  ADD COLUMN IF NOT EXISTS haircut_frequency text,
  ADD COLUMN IF NOT EXISTS styling_routine text,
  ADD COLUMN IF NOT EXISTS notes text;
