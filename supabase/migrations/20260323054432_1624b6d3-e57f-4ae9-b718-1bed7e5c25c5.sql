
-- Pixels table
CREATE TABLE public.pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  website_name text NOT NULL,
  website_url text NOT NULL,
  webhook_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pixels" ON public.pixels
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pixel visitors table
CREATE TABLE public.pixel_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pixel_id uuid NOT NULL REFERENCES public.pixels(id) ON DELETE CASCADE,
  visitor_uid text NOT NULL,
  ip_address text,
  city text,
  state text,
  postal_code text,
  country text,
  latitude double precision,
  longitude double precision,
  company text,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  linkedin_url text,
  job_title text,
  education text,
  pdl_data jsonb DEFAULT '{}'::jsonb,
  total_visits integer NOT NULL DEFAULT 1,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(pixel_id, visitor_uid)
);

ALTER TABLE public.pixel_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own pixel visitors" ON public.pixel_visitors
  FOR SELECT TO authenticated
  USING (pixel_id IN (SELECT id FROM public.pixels WHERE user_id = auth.uid()));

-- Page views table
CREATE TABLE public.pixel_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id uuid NOT NULL REFERENCES public.pixel_visitors(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pixel_page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own page views" ON public.pixel_page_views
  FOR SELECT TO authenticated
  USING (visitor_id IN (
    SELECT pv.id FROM public.pixel_visitors pv
    JOIN public.pixels p ON p.id = pv.pixel_id
    WHERE p.user_id = auth.uid()
  ));
