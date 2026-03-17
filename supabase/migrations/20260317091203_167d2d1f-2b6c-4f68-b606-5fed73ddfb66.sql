CREATE TABLE public.audiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  audience_size integer DEFAULT 0,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_refreshed timestamp with time zone,
  next_refresh timestamp with time zone,
  refresh_count integer DEFAULT 0
);

ALTER TABLE public.audiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own audiences"
  ON public.audiences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);