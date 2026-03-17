import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FATHOM_AUTH_URL = "https://app.fathom.video/oauth/authorize";
const FATHOM_TOKEN_URL = "https://api.fathom.ai/external/v1/oauth2/token";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const clientId = Deno.env.get("FATHOM_CLIENT_ID");
    const clientSecret = Deno.env.get("FATHOM_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: "Fathom OAuth credentials not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "start";

    if (action === "start") {
      // Step 1: Generate authorization URL and return it
      const redirectUri = `${supabaseUrl}/functions/v1/fathom-auth?action=callback`;
      const state = crypto.randomUUID();
      const authUrl = `${FATHOM_AUTH_URL}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=public_api&state=${state}`;

      return new Response(JSON.stringify({ auth_url: authUrl, state }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "callback") {
      // Step 2: Exchange authorization code for tokens
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("<html><body><h2>Error: No authorization code received.</h2></body></html>", {
          status: 400, headers: { "Content-Type": "text/html" },
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
          status: 400, headers: { "Content-Type": "text/html" },
        });
      }

      const tokenData = await tokenRes.json();
      const { access_token, refresh_token, expires_in } = tokenData;
      const expiresAt = Date.now() + (expires_in || 7200) * 1000;

      // Store tokens in database
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Clear old connections and insert new one
      await supabase.from("fathom_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: insertError } = await supabase.from("fathom_connections").insert({
        access_token,
        refresh_token: refresh_token || null,
        token_type: "Bearer",
        expires_at: expiresAt,
      });

      if (insertError) {
        console.error("DB insert error:", insertError);
        return new Response(`<html><body><h2>Failed to store connection</h2></body></html>`, {
          status: 500, headers: { "Content-Type": "text/html" },
        });
      }

      // Redirect back to the app's ad accounts page
      const appUrl = Deno.env.get("SITE_URL") || "https://campaign-insight-loop.lovable.app";
      return new Response(null, {
        status: 302,
        headers: { Location: `${appUrl}/ad-accounts?fathom=connected` },
      });
    }

    if (action === "refresh") {
      // Step 3: Refresh tokens
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: conn } = await supabase.from("fathom_connections").select("*").limit(1).single();
      if (!conn?.refresh_token) {
        return new Response(JSON.stringify({ error: "No refresh token available" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
        console.error("Fathom refresh error:", tokenRes.status, errText);
        return new Response(JSON.stringify({ error: "Token refresh failed" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const tokenData = await tokenRes.json();
      const expiresAt = Date.now() + (tokenData.expires_in || 7200) * 1000;

      await supabase.from("fathom_connections").update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || conn.refresh_token,
        expires_at: expiresAt,
      }).eq("id", conn.id);

      return new Response(JSON.stringify({ success: true, access_token: tokenData.access_token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fathom-auth error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
