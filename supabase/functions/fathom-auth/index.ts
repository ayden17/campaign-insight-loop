import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FATHOM_CLIENT_ID = "_vwFnNmZjTDxSeVhK9ZbsghxGCZ1szhmZfPKiB88Xhk";
const FATHOM_TOKEN_URL = "https://fathom.video/external/v1/oauth2/token";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, redirect_uri } = await req.json();
    const clientSecret = Deno.env.get("FATHOM_CLIENT_SECRET");
    if (!clientSecret) throw new Error("FATHOM_CLIENT_SECRET not configured");

    // Exchange authorization code for access token
    const tokenRes = await fetch(FATHOM_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: FATHOM_CLIENT_ID,
        client_secret: clientSecret,
        code,
        redirect_uri,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Fathom token error:", tokenRes.status, errText);
      return new Response(JSON.stringify({ error: "Failed to exchange code", details: errText }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokenData = await tokenRes.json();

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert - keep only one connection
    await supabase.from("fathom_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error: insertError } = await supabase.from("fathom_connections").insert({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_type: tokenData.token_type || "Bearer",
    });

    if (insertError) {
      console.error("DB insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to store token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
