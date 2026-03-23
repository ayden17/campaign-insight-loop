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
      const targetRevenue = Number(params.targetRevenue) || 1000000;
      const growthThreshold = Number(params.growthThreshold) || 5;
      const jobTitles: string[] = Array.isArray(params.jobTitles) && params.jobTitles.length > 0
        ? params.jobTitles
        : ["marketing", "advertising"];

      const mustClauses: any[] = [];

      if (userIntent) {
        mustClauses.push({
          match: { industry: userIntent }
        });
      }

      // Dynamic job posting titles
      mustClauses.push({
        nested: {
          path: "active_job_postings",
          query: {
            bool: {
              should: jobTitles.map(title => ({
                match: { "active_job_postings.job_posting_title": title }
              })),
              minimum_should_match: 1
            }
          }
        }
      });

      mustClauses.push({
        bool: {
          should: [
            { range: { "revenue_annual_range.source_4_annual_revenue_range.annual_revenue_range_from": { gte: targetRevenue } } },
            { range: { "revenue_annual_range.source_6_annual_revenue_range.annual_revenue_range_from": { gte: targetRevenue } } },
            { range: { "revenue_annual.source_5_annual_revenue.annual_revenue": { gte: targetRevenue } } },
            { range: { "revenue_annual.source_1_annual_revenue.annual_revenue": { gte: targetRevenue } } },
          ],
          minimum_should_match: 1
        }
      });

      mustClauses.push({
        range: {
          "employees_count_change.change_yearly_percentage": { gte: growthThreshold }
        }
      });

      const esPayload = {
        query: {
          bool: {
            must: mustClauses
          }
        }
      };

      console.log('CoreSignal search payload:', JSON.stringify(esPayload));

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
        headers: { 'apikey': CORESIGNAL_API_KEY },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`CoreSignal collect error [${response.status}]: ${JSON.stringify(data)}`);
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'collect_batch') {
      const companyIds: number[] = params.companyIds;
      if (!Array.isArray(companyIds) || companyIds.length === 0) {
        return new Response(JSON.stringify({ error: 'companyIds array is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Limit to 10 to conserve credits and prevent timeouts
      const limitedIds = companyIds.slice(0, 10);
      const results: any[] = [];

      for (const id of limitedIds) {
        try {
          const response = await fetch(`https://api.coresignal.com/cdapi/v2/company_multi_source/collect/${id}`, {
            method: 'GET',
            headers: { 'apikey': CORESIGNAL_API_KEY },
          });

          if (response.ok) {
            const data = await response.json();
            results.push({ id, ...data });
          } else {
            console.warn(`Failed to collect company ${id}: ${response.status}`);
            results.push({ id, error: true });
          }
        } catch (err) {
          console.warn(`Error collecting company ${id}:`, err);
          results.push({ id, error: true });
        }
      }

      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "search", "collect", or "collect_batch".' }), {
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
