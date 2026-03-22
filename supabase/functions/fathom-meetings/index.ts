import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-action, x-recording-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FATHOM_API = "https://api.fathom.ai/external/v1";
const FATHOM_TOKEN_URL = "https://fathom.video/external/v1/oauth2/token";

async function getLatestConnection(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("fathom_connections")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function refreshAccessToken(supabase: ReturnType<typeof createClient>, conn: any) {
  const clientId = Deno.env.get("FATHOM_CLIENT_ID");
  const clientSecret = Deno.env.get("FATHOM_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Fathom OAuth credentials are missing.");
  }

  if (!conn?.refresh_token) {
    throw new Error("Fathom connection is missing a refresh token. Please reconnect.");
  }

  const tokenRes = await fetch(FATHOM_TOKEN_URL, {
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
    throw new Error("Fathom token refresh failed. Please reconnect.");
  }

  const tokenData = await tokenRes.json();
  const newExpiresAt = Date.now() + (tokenData.expires_in || 7200) * 1000;

  const { error: updateError } = await supabase
    .from("fathom_connections")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || conn.refresh_token,
      token_type: "Bearer",
      expires_at: newExpiresAt,
    })
    .eq("id", conn.id);

  if (updateError) throw updateError;

  return {
    ...conn,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || conn.refresh_token,
    token_type: "Bearer",
    expires_at: newExpiresAt,
  };
}

async function getConnectionWithFreshToken(supabase: ReturnType<typeof createClient>) {
  let conn = await getLatestConnection(supabase);

  if (!conn) {
    throw new Error("No Fathom OAuth connection found. Please connect via Ad Accounts.");
  }

  if (conn.token_type?.toLowerCase() === "api_key") {
    throw new Error("Legacy Fathom API-key connection detected. Please reconnect with OAuth.");
  }

  const expiresAt = conn.expires_at ? Number(conn.expires_at) : 0;
  const shouldRefresh = !!conn.refresh_token && (!expiresAt || Date.now() > expiresAt - 300000);

  if (shouldRefresh) {
    conn = await refreshAccessToken(supabase, conn);
  }

  return conn;
}

async function fetchFromFathom(url: string, token: string) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let connection = await getConnectionWithFreshToken(supabase);

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

    let fathomRes = await fetchFromFathom(fathomUrl, connection.access_token);

    if (fathomRes.status === 401 && connection.refresh_token) {
      connection = await refreshAccessToken(supabase, connection);
      fathomRes = await fetchFromFathom(fathomUrl, connection.access_token);
    }

    if (!fathomRes.ok) {
      const errText = await fathomRes.text();
      console.error("Fathom API error:", fathomRes.status, "body:", errText, "url:", fathomUrl);
      return new Response(JSON.stringify({
        error: fathomRes.status === 401 ? "Fathom authorization is invalid. Please reconnect." : "Fathom API error",
        status: fathomRes.status,
        reauth_required: fathomRes.status === 401,
      }), {
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
