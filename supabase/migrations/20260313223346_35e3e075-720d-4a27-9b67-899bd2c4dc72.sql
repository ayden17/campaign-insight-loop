
CREATE TABLE public.saved_prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  company_name TEXT,
  department TEXT,
  job_level TEXT,
  linkedin_url TEXT,
  location TEXT,
  country_code TEXT,
  email TEXT,
  phone TEXT,
  enriched BOOLEAN DEFAULT false,
  search_filters JSONB DEFAULT '{}'::jsonb,
  search_label TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to saved_prospects"
  ON public.saved_prospects
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
