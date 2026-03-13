import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const EXPLORIUM_API_KEY = Deno.env.get('EXPLORIUM_API_KEY');
  if (!EXPLORIUM_API_KEY) {
    return new Response(JSON.stringify({ error: 'EXPLORIUM_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;

    let url: string;
    let payload: any;

    if (action === 'search') {
      url = 'https://api.explorium.ai/v1/prospects';
      payload = {
        mode: 'full',
        page_size: params.page_size || 20,
        request_context: null,
        size: params.size || 60000,
        page: params.page || 1,
        exclude: null,
        filters: params.filters || {},
        next_cursor: params.next_cursor || null,
      };
    } else if (action === 'enrich') {
      url = 'https://api.explorium.ai/v1/prospects/contacts_information/enrich';
      payload = {
        prospect_id: params.prospect_id,
        request_context: null,
        parameters: {},
      };
    } else if (action === 'events') {
      url = 'https://api.explorium.ai/v1/prospects/events';
      payload = {
        event_types: params.event_types || ['prospect_changed_role'],
        prospect_ids: params.prospect_ids || [],
        request_context: null,
        entity_type: 'prospect',
        timestamp_to: null,
        timestamp_from: null,
      };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api_key': EXPLORIUM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Explorium API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Prospect search error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
