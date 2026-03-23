import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PDL_BASE = "https://api.peopledatalabs.com/v5";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { pixel_id, visitor_uid, page_url, referrer, ip_address } = body;

    if (!pixel_id || !visitor_uid) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const pdlKey = Deno.env.get("PDL_API_KEY");
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if visitor exists
    const { data: existing } = await supabase
      .from("pixel_visitors")
      .select("id, total_visits")
      .eq("pixel_id", pixel_id)
      .eq("visitor_uid", visitor_uid)
      .maybeSingle();

    let visitorId: string;

    if (existing) {
      // Update visit count and last_seen
      await supabase
        .from("pixel_visitors")
        .update({ total_visits: existing.total_visits + 1, last_seen: new Date().toISOString() })
        .eq("id", existing.id);
      visitorId = existing.id;
    } else {
      // New visitor — run PDL waterfall if we have an IP and API key
      let enrichedData: Record<string, any> = {};

      if (ip_address && pdlKey) {
        try {
          // Step 1: IP Enrichment
          const ipRes = await fetch(`${PDL_BASE}/ip/enrich?ip=${encodeURIComponent(ip_address)}&api_key=${pdlKey}`);
          const ipData = ipRes.ok ? await ipRes.json() : null;

          if (ipData) {
            enrichedData.city = ipData.ip?.location?.city || null;
            enrichedData.state = ipData.ip?.location?.region || null;
            enrichedData.postal_code = ipData.ip?.location?.postal_code || null;
            enrichedData.country = ipData.ip?.location?.country || null;
            enrichedData.latitude = ipData.ip?.location?.lat || null;
            enrichedData.longitude = ipData.ip?.location?.lng || null;
            enrichedData.company = ipData.ip?.company?.name || null;
          }

          // Step 2: Person Identify
          if (enrichedData.company || enrichedData.city) {
            const identifyParams = new URLSearchParams({ api_key: pdlKey });
            if (enrichedData.company) identifyParams.append("company", enrichedData.company);
            if (enrichedData.city) identifyParams.append("location", `${enrichedData.city}, ${enrichedData.state || ""}`);
            identifyParams.append("ip", ip_address);

            const identifyRes = await fetch(`${PDL_BASE}/person/identify?${identifyParams.toString()}`);
            const identifyData = identifyRes.ok ? await identifyRes.json() : null;

            if (identifyData?.matches?.length > 0) {
              const topMatch = identifyData.matches[0].data;

              // Step 3: Person Enrichment via linkedin or pdl_id
              let personData = topMatch;
              if (topMatch.linkedin_url) {
                const enrichRes = await fetch(
                  `${PDL_BASE}/person/enrich?api_key=${pdlKey}&profile=${encodeURIComponent(topMatch.linkedin_url)}`
                );
                if (enrichRes.ok) {
                  const enrichJson = await enrichRes.json();
                  if (enrichJson.data) personData = enrichJson.data;
                }
              }

              enrichedData.full_name = personData.full_name || null;
              enrichedData.first_name = personData.first_name || null;
              enrichedData.last_name = personData.last_name || null;
              enrichedData.email = personData.personal_emails?.[0] || personData.work_email || null;
              enrichedData.phone = personData.mobile_phone || personData.phone_numbers?.[0] || null;
              enrichedData.linkedin_url = personData.linkedin_url || null;
              enrichedData.job_title = personData.job_title || null;
              enrichedData.education = personData.education?.length
                ? personData.education.map((e: any) => e.school?.name).filter(Boolean).join(", ")
                : null;
              enrichedData.pdl_data = personData;
            }
          }
        } catch (pdlError) {
          console.error("PDL enrichment error:", pdlError);
        }
      }

      const { data: newVisitor, error: insertError } = await supabase
        .from("pixel_visitors")
        .insert({
          pixel_id,
          visitor_uid,
          ip_address,
          ...enrichedData,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert visitor error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to save visitor" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      visitorId = newVisitor.id;
    }

    // Record page view
    if (page_url) {
      await supabase.from("pixel_page_views").insert({
        visitor_id: visitorId,
        page_url,
        referrer,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("identify-visitor error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
