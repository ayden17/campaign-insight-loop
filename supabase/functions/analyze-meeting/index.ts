import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcript, summary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert sales analyst. Given a meeting transcript and summary, extract the following structured information:

1. **Offer**: What was offered including pricing range and services included
2. **Objections**: What objections did the prospect raise
3. **Objection Handling**: How were those objections addressed
4. **Lead Quality**: Rate as "high", "medium", or "low" based on buying signals
5. **Suggested Follow-ups**: 2-4 concrete next steps

Return your response as JSON with these exact keys: offer, objections, objection_handling, lead_quality, suggested_followups. Each value should be a string (paragraph form).`;

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
          { role: "user", content: `Meeting Summary:\n${summary || "No summary available"}\n\nTranscript:\n${transcript || "No transcript available"}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_meeting",
              description: "Extract structured sales analysis from a meeting",
              parameters: {
                type: "object",
                properties: {
                  offer: { type: "string", description: "What was offered including pricing and services" },
                  objections: { type: "string", description: "Objections raised by the prospect" },
                  objection_handling: { type: "string", description: "How objections were addressed" },
                  lead_quality: { type: "string", enum: ["high", "medium", "low"], description: "Lead quality assessment" },
                  suggested_followups: { type: "string", description: "Suggested follow-up actions" },
                },
                required: ["offer", "objections", "objection_handling", "lead_quality", "suggested_followups"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_meeting" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let analysis;
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse content as JSON
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        analysis = JSON.parse(content);
      } catch {
        analysis = {
          offer: "Unable to extract",
          objections: "Unable to extract",
          objection_handling: "Unable to extract",
          lead_quality: "medium",
          suggested_followups: "Review the transcript manually",
        };
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meeting error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
