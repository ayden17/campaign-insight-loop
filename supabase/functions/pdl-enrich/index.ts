import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PDL_BASE = "https://api.peopledatalabs.com/v5";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pdlKey = Deno.env.get("PDL_API_KEY");
    if (!pdlKey) {
      return new Response(JSON.stringify({ error: "PDL_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { lead_ids, mode } = body; // mode: "single" or "bulk"

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return new Response(JSON.stringify({ error: "lead_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch leads
    const { data: leads, error: fetchErr } = await supabase
      .from("leads")
      .select("*")
      .in("id", lead_ids);

    if (fetchErr || !leads) {
      return new Response(JSON.stringify({ error: "Failed to fetch leads" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; success: boolean; name?: string }[] = [];

    for (const lead of leads) {
      try {
        // Build enrichment params from any available identifier
        const params: Record<string, string> = { api_key: pdlKey };
        const meta = lead.source_metadata as Record<string, any> || {};
        const attendees = Array.isArray(lead.attendees) ? lead.attendees : [];
        const firstAttendee = attendees[0] || {};

        // Try linkedin_url from metadata or enrichment_data
        const linkedinUrl = meta.linkedin_url || (lead.enrichment_data as any)?.linkedin_url;
        const email = firstAttendee.email || meta.email;
        const name = lead.lead_name;
        const company = meta.company_name || meta.company;

        if (linkedinUrl) {
          params.profile = linkedinUrl;
        } else if (email) {
          params.email = email;
        } else if (name && company) {
          params.name = name;
          params.company = company;
        } else if (name) {
          params.name = name;
        } else {
          results.push({ id: lead.id, success: false });
          continue;
        }

        console.log(`[PDL Enrich] Enriching lead ${lead.id} with params:`, Object.keys(params).filter(k => k !== 'api_key'));

        const enrichRes = await fetch(
          `${PDL_BASE}/person/enrich?${new URLSearchParams(params).toString()}`
        );
        const enrichJson = enrichRes.ok ? await enrichRes.json() : null;

        if (enrichJson?.status === 200 && enrichJson.data) {
          const person = enrichJson.data;
          await supabase.from("leads").update({
            enrichment_data: person,
            lead_name: person.full_name || lead.lead_name,
          }).eq("id", lead.id);

          results.push({ id: lead.id, success: true, name: person.full_name });
          console.log(`[PDL Enrich] Success for ${lead.id}: ${person.full_name}`);
        } else {
          console.log(`[PDL Enrich] No data for ${lead.id}: status ${enrichJson?.status}`);
          results.push({ id: lead.id, success: false });
        }
      } catch (err) {
        console.error(`[PDL Enrich] Error for ${lead.id}:`, err);
        results.push({ id: lead.id, success: false });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("pdl-enrich error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
