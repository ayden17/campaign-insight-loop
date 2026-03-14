import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-action, x-recording-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FATHOM_API = "https://api.fathom.ai/external/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const fathomApiKey = Deno.env.get("FATHOM_API_KEY");
    if (!fathomApiKey) {
      return new Response(JSON.stringify({ error: "FATHOM_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || req.headers.get("x-action") || "list";
    const recordingId = url.searchParams.get("recording_id") || req.headers.get("x-recording-id");

    let fathomUrl: string;
    if (action === "summary" && recordingId) {
      fathomUrl = `${FATHOM_API}/recordings/${recordingId}/summary`;
    } else if (action === "transcript" && recordingId) {
      fathomUrl = `${FATHOM_API}/recordings/${recordingId}/transcript`;
    } else {
      fathomUrl = `${FATHOM_API}/meetings?calendar_invitees_domains_type=all`;
    }

    const fathomRes = await fetch(fathomUrl, {
      headers: { "Authorization": `Bearer ${fathomApiKey}` },
    });

    if (!fathomRes.ok) {
      const errText = await fathomRes.text();
      console.error("Fathom API error:", fathomRes.status, "body:", errText, "url:", fathomUrl);
      return new Response(JSON.stringify({ error: "Fathom API error", status: fathomRes.status }), {
        status: fathomRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await fathomRes.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fathom-meetings error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
