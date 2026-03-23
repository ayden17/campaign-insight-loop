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

    const resolvedIp = ip_address || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

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
      await supabase
        .from("pixel_visitors")
        .update({ total_visits: existing.total_visits + 1, last_seen: new Date().toISOString() })
        .eq("id", existing.id);
      visitorId = existing.id;
    } else {
      // New visitor — run PDL waterfall
      let enrichedData: Record<string, any> = {};

      if (resolvedIp && pdlKey) {
        try {
          // ── STAGE 1: IP Enrichment ──
          console.log(`[PDL] Stage 1: IP Enrichment for ${resolvedIp}`);
          const ipRes = await fetch(
            `${PDL_BASE}/ip/enrich?ip=${encodeURIComponent(resolvedIp)}&return_person=true&api_key=${pdlKey}`
          );
          const ipJson = ipRes.ok ? await ipRes.json() : null;
          console.log(`[PDL] IP Enrichment status: ${ipRes.status}`, JSON.stringify(ipJson?.status));

          // PDL returns { status: 200, data: { ip: { ... }, company: { ... } } }
          const record = ipJson?.status === 200 ? ipJson.data : null;

          if (record) {
            const loc = record.ip?.location || {};
            enrichedData.city = loc.city || null;
            enrichedData.state = loc.region || null;
            enrichedData.postal_code = loc.postal_code || null;
            enrichedData.country = loc.country || null;
            enrichedData.latitude = loc.lat ?? null;
            enrichedData.longitude = loc.lng ?? null;
            enrichedData.company = record.company?.name || null;

            console.log(`[PDL] Stage 1 result: city=${enrichedData.city}, company=${enrichedData.company}, lat=${enrichedData.latitude}, lng=${enrichedData.longitude}`);

            // ── STAGE 2: Person Identify ──
            if (enrichedData.company || enrichedData.city) {
              console.log(`[PDL] Stage 2: Person Identify`);
              const identifyParams: Record<string, string> = {
                api_key: pdlKey,
                ip: resolvedIp,
              };
              if (enrichedData.company) identifyParams.company = enrichedData.company;
              if (enrichedData.city) {
                identifyParams.location = [enrichedData.city, enrichedData.state].filter(Boolean).join(", ");
              }

              const identifyUrl = `${PDL_BASE}/person/identify?${new URLSearchParams(identifyParams).toString()}`;
              const identifyRes = await fetch(identifyUrl);
              const identifyJson = identifyRes.ok ? await identifyRes.json() : null;
              console.log(`[PDL] Person Identify status: ${identifyRes.status}, matches: ${identifyJson?.matches?.length || 0}`);

              if (identifyJson?.matches?.length > 0) {
                const bestMatch = identifyJson.matches[0].data;
                console.log(`[PDL] Best match: ${bestMatch.full_name || bestMatch.id}, linkedin: ${bestMatch.linkedin_url || 'none'}`);

                // ── STAGE 3: Person Enrichment ──
                let personData = bestMatch;
                const hasLinkedIn = bestMatch.linkedin_url;
                const hasPdlId = bestMatch.id;

                if (hasLinkedIn || hasPdlId) {
                  console.log(`[PDL] Stage 3: Person Enrichment via ${hasLinkedIn ? 'linkedin' : 'pdl_id'}`);
                  const enrichParams: Record<string, string> = { api_key: pdlKey };
                  if (hasLinkedIn) {
                    enrichParams.profile = bestMatch.linkedin_url;
                  } else {
                    enrichParams.pdl_id = bestMatch.id;
                  }

                  const enrichRes = await fetch(
                    `${PDL_BASE}/person/enrich?${new URLSearchParams(enrichParams).toString()}`
                  );
                  if (enrichRes.ok) {
                    const enrichJson = await enrichRes.json();
                    if (enrichJson.status === 200 && enrichJson.data) {
                      personData = enrichJson.data;
                      console.log(`[PDL] Stage 3 success: ${personData.full_name}`);
                    } else {
                      console.log(`[PDL] Stage 3 no data, using Stage 2 match`);
                    }
                  } else {
                    console.log(`[PDL] Stage 3 failed: ${enrichRes.status}`);
                  }
                }

                // Map resolved person data
                enrichedData.full_name = personData.full_name || null;
                enrichedData.first_name = personData.first_name || null;
                enrichedData.last_name = personData.last_name || null;
                enrichedData.email = personData.personal_emails?.[0] || personData.work_email || null;
                enrichedData.phone = personData.mobile_phone || personData.phone_numbers?.[0] || null;
                enrichedData.linkedin_url = personData.linkedin_url || null;
                enrichedData.job_title = personData.job_title || null;
                enrichedData.company = personData.job_company_name || enrichedData.company || null;
                enrichedData.education = personData.education?.length
                  ? personData.education.map((e: any) => e.school?.name).filter(Boolean).join(", ")
                  : null;
                // Override coords with person-level location if available
                if (personData.location_geo) {
                  enrichedData.latitude = personData.location_geo.lat || enrichedData.latitude;
                  enrichedData.longitude = personData.location_geo.lng || enrichedData.longitude;
                }
                enrichedData.pdl_data = personData;
              }
            }
          }
        } catch (pdlError) {
          console.error("[PDL] Enrichment error:", pdlError);
        }
      }

      const { data: newVisitor, error: insertError } = await supabase
        .from("pixel_visitors")
        .insert({
          pixel_id,
          visitor_uid,
          ip_address: resolvedIp,
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
