import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { type, product, audience, tone, platform, count } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "headlines") {
      systemPrompt = "You are an expert direct-response copywriter. Generate compelling ad headlines.";
      userPrompt = `Generate ${count || 5} ad headlines for:
Product/Service: ${product}
Target Audience: ${audience || "general"}
Tone: ${tone || "professional"}
Platform: ${platform || "Facebook"}

Return ONLY a JSON array of strings, each being a headline. No other text.`;
    } else if (type === "ad_copy") {
      systemPrompt = "You are an expert direct-response copywriter specializing in social media ads.";
      userPrompt = `Write ${count || 3} complete ad copy variations for:
Product/Service: ${product}
Target Audience: ${audience || "general"}
Tone: ${tone || "professional"}
Platform: ${platform || "Facebook"}

Return ONLY a JSON array of objects with fields: "headline", "primary_text", "description", "cta". No other text.`;
    } else if (type === "image_prompts") {
      systemPrompt = "You are a creative director who writes detailed image generation prompts for ad creatives.";
      userPrompt = `Generate ${count || 3} detailed image prompts for ad creatives:
Product/Service: ${product}
Target Audience: ${audience || "general"}
Platform: ${platform || "Facebook"}

Return ONLY a JSON array of objects with fields: "prompt", "style", "aspect_ratio". No other text.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid type. Use: headlines, ad_copy, image_prompts" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from the response
    let parsed;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = content;
    }

    return new Response(JSON.stringify({ results: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-ad-copy error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
