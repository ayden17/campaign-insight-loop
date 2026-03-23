ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS intent_level text DEFAULT 'low';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS enrichment_data jsonb DEFAULT '{}'::jsonb;