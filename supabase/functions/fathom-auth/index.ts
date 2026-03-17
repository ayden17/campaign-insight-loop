import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FATHOM_AUTH_URL = "https://app.fathom.video/oauth/authorize";
const FATHOM_TOKEN_URL = "https://api.fathom.ai/external/v1/oauth2/token";
const FATHOM_MEETINGS_URL = "https://api.fathom.ai/external/v1/meetings?calendar_invitees_domains_type=all";

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

async function refreshConnectionToken(params: {
  supabase: ReturnType<typeof createClient>;
  connection: any;
  clientId: string;
  clientSecret: string;
}) {
  const { supabase, connection, clientId, clientSecret } = params;

  if (!connection?.refresh_token) {
    throw new Error("No refresh token available");
  }

  const tokenRes = await fetch(FATHOM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: connection.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error("Fathom refresh error:", tokenRes.status, errText);
    throw new Error("Token refresh failed");
  }

  const tokenData = await tokenRes.json();
  const expiresAt = Date.now() + (tokenData.expires_in || 7200) * 1000;

  const { error: updateError } = await supabase
    .from("fathom_connections")
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || connection.refresh_token,
      token_type: "Bearer",
      expires_at: expiresAt,
    })
    .eq("id", connection.id);

  if (updateError) throw updateError;

  return {
    ...connection,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || connection.refresh_token,
    token_type: "Bearer",
    expires_at: expiresAt,
  };
}

async function ensureValidConnection(params: {
  supabase: ReturnType<typeof createClient>;
  clientId: string;
  clientSecret: string;
  validateWithApi?: boolean;
}) {
  const { supabase, clientId, clientSecret, validateWithApi = false } = params;

  let connection = await getLatestConnection(supabase);
  if (!connection) {
    return { connected: false, reason: "missing_connection" };
  }

  if (connection.token_type?.toLowerCase() === "api_key") {
    await supabase.from("fathom_connections").delete().eq("id", connection.id);
    return { connected: false, reason: "legacy_api_key_removed" };
  }

  if (!connection.access_token) {
    return { connected: false, reason: "missing_access_token" };
  }

  const expiresAt = connection.expires_at ? Number(connection.expires_at) : 0;
  const shouldRefresh = !!connection.refresh_token && (!expiresAt || Date.now() > expiresAt - 300000);

  if (shouldRefresh) {
    connection = await refreshConnectionToken({ supabase, connection, clientId, clientSecret });
  }

  if (validateWithApi) {
    const validationRes = await fetch(FATHOM_MEETINGS_URL, {
      headers: { Authorization: `Bearer ${connection.access_token}` },
    });

    if (validationRes.status === 401 && connection.refresh_token) {
      connection = await refreshConnectionToken({ supabase, connection, clientId, clientSecret });
      const retryRes = await fetch(FATHOM_MEETINGS_URL, {
        headers: { Authorization: `Bearer ${connection.access_token}` },
      });

      if (!retryRes.ok) {
        const errText = await retryRes.text();
        console.error("Fathom validation retry failed:", retryRes.status, errText);
        return { connected: false, reason: "invalid_token" };
      }
    } else if (!validationRes.ok) {
      const errText = await validationRes.text();
      console.error("Fathom validation failed:", validationRes.status, errText);
      return { connected: false, reason: validationRes.status === 401 ? "invalid_token" : "validation_failed" };
    }
  }

  return {
    connected: true,
    reason: null,
    connection,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientId = Deno.env.get("FATHOM_CLIENT_ID");
    const clientSecret = Deno.env.get("FATHOM_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "Fathom OAuth credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    let action = url.searchParams.get("action") || "start";
    let body: Record<string, unknown> = {};

    if (req.method === "POST") {
      try {
        body = await req.json();
        if (typeof body?.action === "string") action = body.action;
      } catch {
        body = {};
      }
    }

    if (action === "start") {
      const redirectUri = `${supabaseUrl}/functions/v1/fathom-auth?action=callback`;
      const state = crypto.randomUUID();
      const authUrl = `${FATHOM_AUTH_URL}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public_api&state=${state}`;

      return new Response(JSON.stringify({ auth_url: authUrl, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "status") {
      const status = await ensureValidConnection({
        supabase,
        clientId,
        clientSecret,
        validateWithApi: true,
      });

      return new Response(JSON.stringify(status), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("<html><body><h2>Error: No authorization code received.</h2></body></html>", {
          status: 400,
          headers: { "Content-Type": "text/html" },
        });
      }

      const redirectUri = `${supabaseUrl}/functions/v1/fathom-auth?action=callback`;

      const tokenRes = await fetch(FATHOM_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Fathom token exchange error:", tokenRes.status, errText);
        return new Response(`<html><body><h2>Authentication failed</h2><p>${errText}</p></body></html>`, {
          status: 400,
          headers: { "Content-Type": "text/html" },
        });
      }

      const tokenData = await tokenRes.json();
      const { access_token, refresh_token, expires_in } = tokenData;
      const expiresAt = Date.now() + (expires_in || 7200) * 1000;

      await supabase.from("fathom_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: insertError } = await supabase.from("fathom_connections").insert({
        access_token,
        refresh_token: refresh_token || null,
        token_type: "Bearer",
        expires_at: expiresAt,
      });

      if (insertError) {
        console.error("DB insert error:", insertError);
        return new Response("<html><body><h2>Failed to store connection</h2></body></html>", {
          status: 500,
          headers: { "Content-Type": "text/html" },
        });
      }

      const appUrl = Deno.env.get("SITE_URL") || "https://campaign-insight-loop.lovable.app";
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/ad-accounts?fathom=connected` },
      });
    }

    if (action === "refresh") {
      const connection = await getLatestConnection(supabase);
      if (!connection) {
        return new Response(JSON.stringify({ error: "No connection found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const refreshed = await refreshConnectionToken({ supabase, connection, clientId, clientSecret });

      return new Response(JSON.stringify({
        success: true,
        access_token: refreshed.access_token,
        expires_at: refreshed.expires_at,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fathom-auth error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
