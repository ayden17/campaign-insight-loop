
CREATE TABLE public.slack_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id text NOT NULL,
  team_name text,
  bot_access_token text NOT NULL,
  bot_user_id text,
  channel_id text,
  scope text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, team_id)
);

ALTER TABLE public.slack_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own slack connections"
  ON public.slack_connections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_slack_connections_updated_at
  BEFORE UPDATE ON public.slack_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
