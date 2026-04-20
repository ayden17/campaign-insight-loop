import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const EXA_API_KEY = Deno.env.get("EXA_API_KEY");
  if (!EXA_API_KEY) {
    return new Response(JSON.stringify({ error: "EXA_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      query,
      category = "people",
      type = "auto",
      numResults = 10,
      includeDomains,
      excludeDomains,
      startPublishedDate,
      endPublishedDate,
    } = body ?? {};

    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "`query` (string) is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: Record<string, unknown> = {
      query,
      category,
      type,
      numResults: Math.min(Math.max(Number(numResults) || 10, 1), 100),
      contents: {
        text: { maxCharacters: 800 },
        summary: { query: "Brief professional summary including title, company, and recent career context." },
      },
    };
    if (Array.isArray(includeDomains) && includeDomains.length) payload.includeDomains = includeDomains;
    if (Array.isArray(excludeDomains) && excludeDomains.length) payload.excludeDomains = excludeDomains;
    if (startPublishedDate) payload.startPublishedDate = startPublishedDate;
    if (endPublishedDate) payload.endPublishedDate = endPublishedDate;

    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "x-api-key": EXA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Audience Builder API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    // Normalize results into a clean prospect shape (brand-neutral, no Exa references)
    const results = Array.isArray(data?.results) ? data.results : [];
    const prospects = results.map((r: any) => ({
      id: r.id || r.url,
      name: r.title || r.author || r.url,
      title: r.title || null,
      url: r.url,
      author: r.author || null,
      published_date: r.publishedDate || null,
      summary: r.summary || null,
      snippet: typeof r.text === "string" ? r.text.slice(0, 400) : null,
      image: r.image || null,
      score: r.score ?? null,
    }));

    return new Response(
      JSON.stringify({
        prospects,
        total: prospects.length,
        autopromptString: data?.autopromptString ?? null,
        requestId: data?.requestId ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("AngelFlows Audience Builder error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});