import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-action, x-recording-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FATHOM_API = "https://api.fathom.ai/external/v1";
const FATHOM_TOKEN_URL = "https://fathom.video/external/v1/oauth2/token";
const FATHOM_CLIENT_ID = "_vwFnNmZjTDxSeVhK9ZbsghxGCZ1szhmZfPKiB88Xhk";

async function refreshFathomToken(refreshToken: string, clientSecret: string) {
  const res = await fetch(FATHOM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: FATHOM_CLIENT_ID,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Token refresh failed:", res.status, errText);
    return null;
  }

  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fathomClientSecret = Deno.env.get("FATHOM_CLIENT_SECRET");
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get Fathom OAuth tokens from DB
    const { data: conn } = await adminClient
      .from("fathom_connections")
      .select("id, access_token, refresh_token")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!conn?.access_token) {
      return new Response(JSON.stringify({ error: "No Fathom connection found. Please connect Fathom first." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine action from URL params or headers
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

    // Try the API call with current token
    let fathomRes = await fetch(fathomUrl, {
      headers: { "Authorization": `Bearer ${conn.access_token}` },
    });

    // If 401, try refreshing the token
    if (fathomRes.status === 401 && conn.refresh_token && fathomClientSecret) {
      console.log("Access token expired, attempting refresh...");
      const newTokens = await refreshFathomToken(conn.refresh_token, fathomClientSecret);

      if (newTokens?.access_token) {
        // Update tokens in DB
        await adminClient
          .from("fathom_connections")
          .update({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || conn.refresh_token,
          })
          .eq("id", conn.id);

        console.log("Token refreshed successfully, retrying API call...");

        // Retry the Fathom API call with the new token
        fathomRes = await fetch(fathomUrl, {
          headers: { "Authorization": `Bearer ${newTokens.access_token}` },
        });
      } else {
        return new Response(JSON.stringify({ 
          error: "Fathom token expired and refresh failed. Please reconnect Fathom.", 
          needsReconnect: true 
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

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
