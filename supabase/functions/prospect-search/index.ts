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
    } else if (action === 'generate_keywords') {
      // AI keyword generation using Lovable AI gateway
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: 'AI not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are a marketing keyword expert. Given a business description or audience intent, generate 5-10 highly specific search keywords that people in this target audience would likely search on Google. Return ONLY a JSON array of strings, no other text. Example: ["keyword1","keyword2","keyword3"]'
            },
            { role: 'user', content: params.prompt || '' }
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        throw new Error(`AI error: ${errText}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData?.choices?.[0]?.message?.content || '[]';
      let keywords: string[] = [];
      try {
        const parsed = JSON.parse(content);
        keywords = Array.isArray(parsed) ? parsed : (parsed?.keywords || parsed?.data || []);
      } catch {
        keywords = content.split('\n').map((s: string) => s.replace(/^[\d\-\.\*]+\s*/, '').trim()).filter(Boolean);
      }

      return new Response(JSON.stringify({ keywords }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
