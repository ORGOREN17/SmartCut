import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return jsonResponse(
        {
          error: "INVALID_INPUT",
          message: "imageBase64 is required",
          fallback: false,
          httpStatus: 400,
        },
        200,
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return jsonResponse(
        {
          error: "CONFIG_ERROR",
          message: "AI backend is not configured.",
          fallback: false,
          httpStatus: 500,
        },
        200,
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this person's face photo for a hairstyle recommendation system. Return a JSON object with exactly these fields:
{
  "faceShape": "one of: oval, round, square, heart, diamond, oblong",
  "hairType": "one of: straight, wavy, curly, coily",
  "hairDensity": "one of: thin, medium, thick",
  "skinTone": "descriptive warm/cool tone like 'Warm Beige', 'Cool Ivory', 'Deep Brown', etc.",
  "facialHair": "description like 'Clean Shaven', 'Light Stubble', 'Full Beard', etc.",
  "currentLength": "one of: very short, short, short-medium, medium, medium-long, long",
  "currentStyle": "brief description of current hairstyle",
  "hairlineType": "one of: straight, receding, widow's peak, rounded, high, low"
}
Only return the JSON, no other text.`,
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const rawError = await response.text();
      console.error("AI gateway error:", status, rawError);

      if (status === 402) {
        return jsonResponse({
          error: "AI_CREDITS_EXHAUSTED",
          message: "AI credits exhausted. Please add funds in Settings → Cloud & AI balance.",
          fallback: false,
          httpStatus: 402,
        });
      }

      if (status === 429) {
        return jsonResponse({
          error: "RATE_LIMITED",
          message: "Rate limited. Please try again in a moment.",
          fallback: false,
          httpStatus: 429,
        });
      }

      return jsonResponse({
        error: status >= 500 ? "SERVICE_UNAVAILABLE" : `API_ERROR_${status}`,
        message:
          status >= 500
            ? "The AI service is temporarily unavailable. Please try again shortly."
            : `AI request failed with status ${status}.`,
        fallback: status >= 500,
        httpStatus: status,
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return jsonResponse({
        error: "PARSE_ERROR",
        message: "Could not parse AI response.",
        fallback: true,
        httpStatus: 502,
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return jsonResponse(analysis);
  } catch (e) {
    console.error("analyze-face error:", e);
    return jsonResponse({
      error: "SERVICE_FAILED",
      message: e instanceof Error ? e.message : "Unknown error",
      fallback: true,
      httpStatus: 500,
    });
  }
});
