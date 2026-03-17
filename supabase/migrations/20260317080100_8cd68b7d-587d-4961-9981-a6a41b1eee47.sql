ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS source_label text,
ADD COLUMN IF NOT EXISTS source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_source_label ON public.leads(source_label);