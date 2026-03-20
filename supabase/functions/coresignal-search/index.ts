import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const CORESIGNAL_API_KEY = Deno.env.get('CORESIGNAL_API_KEY');
  if (!CORESIGNAL_API_KEY) {
    return new Response(JSON.stringify({ error: 'CORESIGNAL_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;

    if (action === 'search') {
      const userIntent = params.userIntent || '';
      const targetRevenue = params.targetRevenue || 1000000;
      const growthThreshold = params.growthThreshold || 5;

      const esPayload = {
        query: {
          bool: {
            must: [
              ...(userIntent ? [{
                match: {
                  industry: userIntent
                }
              }] : []),
              {
                bool: {
                  should: [
                    { range: { "revenue_source_4": { gte: targetRevenue } } },
                    { range: { "revenue_source_6": { gte: targetRevenue } } },
                    { range: { "revenue_source_5": { gte: targetRevenue } } },
                    { range: { "revenue_source_1": { gte: targetRevenue } } },
                  ],
                  minimum_should_match: 1
                }
              },
              {
                range: {
                  "employees_count_change.change_yearly_percentage": {
                    gte: growthThreshold
                  }
                }
              },
              {
                nested: {
                  path: "active_job_postings",
                  query: {
                    bool: {
                      should: [
                        { match: { "active_job_postings.title": "marketing" } },
                        { match: { "active_job_postings.title": "advertising" } },
                      ],
                      minimum_should_match: 1
                    }
                  }
                }
              }
            ]
          }
        },
        _source: ["id", "name", "company_name", "website", "linkedin_url", "logo_url", "industry", "employees_count"],
        size: params.size || 50,
        from: params.from || 0,
      };

      const response = await fetch('https://api.coresignal.com/cdapi/v2/company_multi_source/search/es_dsl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CORESIGNAL_API_KEY,
        },
        body: JSON.stringify(esPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`CoreSignal search error [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'collect') {
      const companyId = params.companyId;
      if (!companyId) {
        return new Response(JSON.stringify({ error: 'companyId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const response = await fetch(`https://api.coresignal.com/cdapi/v2/company_multi_source/collect/${companyId}`, {
        method: 'GET',
        headers: {
          'apikey': CORESIGNAL_API_KEY,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`CoreSignal collect error [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "search" or "collect".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    console.error('CoreSignal proxy error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
