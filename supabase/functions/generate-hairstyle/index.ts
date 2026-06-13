import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, hairstyleName, hairstyleDescription } = await req.json();
    if (!imageBase64 || !hairstyleName) {
      return new Response(JSON.stringify({ error: "imageBase64 and hairstyleName are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasImage = typeof imageBase64 === "string" && imageBase64.length > 100 &&
      (imageBase64.startsWith("data:image") || imageBase64.startsWith("http"));
    console.log("[generate-hairstyle] received request", {
      style: hairstyleName,
      hasImage,
      imageLength: typeof imageBase64 === "string" ? imageBase64.length : 0,
      imagePreview: typeof imageBase64 === "string" ? imageBase64.substring(0, 60) + "…" : null,
    });
    if (!hasImage) {
      return new Response(JSON.stringify({ error: "imageBase64 must be a data URL or https URL of the user's photo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `EDIT the EXACT person in the reference image. Change ONLY their hair to a "${hairstyleName}" hairstyle. ${hairstyleDescription || ""}

ABSOLUTE IDENTITY-PRESERVATION RULES (most important):
- This is an IMAGE EDIT, not a new generation. The output must be the SAME individual.
- Preserve identity 1:1: same face geometry, same eyes (color, shape, spacing), same nose, same mouth, same jawline, same chin, same ears, same skin tone, same ethnicity, same age, same gender, same expression, same facial hair (unless the style explicitly changes it).
- Do NOT replace the subject with a different model, stock photo, celebrity, or AI-generated face.
- Do NOT invent a new face. Do NOT change body, clothing, background, or lighting more than necessary.
- Only the hair on top of the head (and beard if explicitly part of the style) should change.
- If you cannot edit the hair while preserving identity, return the original image unchanged rather than a different person.

Output: a photorealistic image of the SAME individual from the reference, with the new "${hairstyleName}" haircut.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageBase64 } },
              { type: "text", text: prompt },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.warn("AI gateway returned no image, signaling fallback");
      return new Response(
        JSON.stringify({ imageUrl: null, fallback: true, error: "No image generated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-hairstyle error:", e);
    return new Response(
      JSON.stringify({
        imageUrl: null,
        fallback: true,
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
