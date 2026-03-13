
-- Fathom OAuth connections
CREATE TABLE public.fathom_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fathom_connections ENABLE ROW LEVEL SECURITY;

-- Public access for now (no auth)
CREATE POLICY "Allow all access to fathom_connections" ON public.fathom_connections
  FOR ALL USING (true) WITH CHECK (true);

-- Leads table with AI-generated notes
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT,
  meeting_title TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  attendees JSONB DEFAULT '[]',
  transcript TEXT,
  summary TEXT,
  offer TEXT,
  objections TEXT,
  objection_handling TEXT,
  lead_quality TEXT DEFAULT 'medium',
  suggested_followups TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to leads" ON public.leads
  FOR ALL USING (true) WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_fathom_connections_updated_at
  BEFORE UPDATE ON public.fathom_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
