import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("FATHOM_API_KEY");
    if (!apiKey) throw new Error("FATHOM_API_KEY not configured");

    const { action } = await req.json().catch(() => ({ action: "connect" }));

    if (action === "connect") {
      // Verify the API key works by fetching user info
      const res = await fetch("https://api.usefathom.com/v1/account", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Fathom API error:", res.status, errText);
        return new Response(JSON.stringify({ error: "Invalid Fathom API key" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Store connection in database
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("fathom_connections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: insertError } = await supabase.from("fathom_connections").insert({
        access_token: apiKey,
        token_type: "api_key",
      });

      if (insertError) {
        console.error("DB insert error:", insertError);
        return new Response(JSON.stringify({ error: "Failed to store connection" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
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
