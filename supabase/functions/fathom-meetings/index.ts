import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-action, x-recording-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FATHOM_API = "https://api.fathom.ai/external/v1";

async function getAccessToken(supabase: any): Promise<string> {
  const { data: conn, error } = await supabase
    .from("fathom_connections")
    .select("*")
    .limit(1)
    .single();

  if (error || !conn) throw new Error("No Fathom connection found. Please connect via Ad Accounts.");

  // Check if token is expired (with 5 min buffer)
  const now = Date.now();
  const expiresAt = conn.expires_at ? Number(conn.expires_at) : 0;

  if (expiresAt > 0 && now > expiresAt - 300000 && conn.refresh_token) {
    // Token expired or about to expire — refresh it
    const clientId = Deno.env.get("FATHOM_CLIENT_ID")!;
    const clientSecret = Deno.env.get("FATHOM_CLIENT_SECRET")!;

    const tokenRes = await fetch("https://api.fathom.ai/external/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: conn.refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token refresh failed:", tokenRes.status, errText);
      throw new Error("Fathom token expired and refresh failed. Please reconnect.");
    }

    const tokenData = await tokenRes.json();
    const newExpiresAt = Date.now() + (tokenData.expires_in || 7200) * 1000;

    await supabase.from("fathom_connections").update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || conn.refresh_token,
      expires_at: newExpiresAt,
    }).eq("id", conn.id);

    return tokenData.access_token;
  }

  return conn.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const accessToken = await getAccessToken(supabase);

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
      headers: { "Authorization": `Bearer ${accessToken}` },
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
