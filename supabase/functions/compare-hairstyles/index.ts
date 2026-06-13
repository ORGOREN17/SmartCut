import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const FALLBACK_RESULT = {
  similarityScore: 78,
  matchLevel: "Good Match",
  feedback: "The result looks close to the target style. Minor differences in texture and length.",
  details: [
    { aspect: "Hair Length", score: 80, note: "Very similar length" },
    { aspect: "Side Shape", score: 75, note: "Sides are well matched" },
    { aspect: "Top Texture", score: 72, note: "Slight texture difference" },
    { aspect: "Fade/Taper", score: 82, note: "Fade level is close" },
    { aspect: "Overall Silhouette", score: 78, note: "Good overall shape match" },
    { aspect: "Styling Direction", score: 76, note: "Similar styling direction" },
  ],
  fallback: true,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { referenceImageBase64, comparisonImageBase64 } = await req.json();

    if (!referenceImageBase64 || !comparisonImageBase64) {
      return json({ ...FALLBACK_RESULT, fallback: true, reason: "missing_input" });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return json({ ...FALLBACK_RESULT, fallback: true, reason: "config_error" });
    }

    // Race against a 7-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are a hairstyle comparison expert. Compare these two images:
- Image 1 is the TARGET hairstyle (the reference look the person wanted)
- Image 2 is the ACTUAL result (the real haircut they got)

Analyze how closely the actual result matches the target hairstyle. Return a JSON object with exactly these fields:
{
  "similarityScore": <number 0-100>,
  "matchLevel": "one of: Excellent Match, Very Close, Good Match, Partial Match, Needs Improvement",
  "feedback": "One sentence overall summary",
  "details": [
    { "aspect": "Hair Length", "score": <0-100>, "note": "brief comparison note" },
    { "aspect": "Side Shape", "score": <0-100>, "note": "brief comparison note" },
    { "aspect": "Top Texture", "score": <0-100>, "note": "brief comparison note" },
    { "aspect": "Fade/Taper", "score": <0-100>, "note": "brief comparison note" },
    { "aspect": "Overall Silhouette", "score": <0-100>, "note": "brief comparison note" },
    { "aspect": "Styling Direction", "score": <0-100>, "note": "brief comparison note" }
  ]
}
Only return the JSON, no other text.`,
                },
                {
                  type: "image_url",
                  image_url: { url: referenceImageBase64 },
                },
                {
                  type: "image_url",
                  image_url: { url: comparisonImageBase64 },
                },
              ],
            },
          ],
        }),
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      console.error("compare-hairstyles fetch error (likely timeout):", fetchErr.name, fetchErr.message);
      return json({ ...FALLBACK_RESULT, fallback: true, reason: "timeout" });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const rawErr = await response.text();
      console.error("AI gateway error:", response.status, rawErr);
      return json({ ...FALLBACK_RESULT, fallback: true, reason: `api_${response.status}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Could not parse AI response:", content.substring(0, 200));
      return json({ ...FALLBACK_RESULT, fallback: true, reason: "parse_error" });
    }

    const result = JSON.parse(jsonMatch[0]);
    return json({ ...result, fallback: false });
  } catch (e) {
    console.error("compare-hairstyles error:", e);
    return json({ ...FALLBACK_RESULT, fallback: true, reason: "unknown_error" });
  }
});
