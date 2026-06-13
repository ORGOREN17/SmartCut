import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Generates 3 AI promotional images for a barbershop business using the
// Lovable AI Gateway (Nano Banana / gemini-2.5-flash-image), uploads them
// to the public `business-content-images` bucket, and stores metadata.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

type Variant = { key: string; label: string; aspect: string; suffix: string };

const VARIANTS: Variant[] = [
  {
    key: "square",
    label: "Promo Image",
    aspect: "1:1",
    suffix:
      "Square 1:1 social post composition, perfectly centered subject, generous negative space, suitable for Instagram and Facebook feed marketing. No text overlays.",
  },
];

function buildCaption(businessName: string, variantLabel: string) {
  return (
    `Fresh cuts, sharp fades, and a confident new look at ${businessName}. ` +
    `Book your next appointment today. 💈✂️ (${variantLabel})`
  );
}

async function generateOne(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const url: string | undefined =
    data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("No image returned");
  return url; // data:image/png;base64,...
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1];
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { businessName, businessDescription, selectedPrompt } = await req.json();
    if (!selectedPrompt || typeof selectedPrompt !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeName = (businessName || "Your Barbershop").toString().slice(0, 80);
    const hashtags = [
      "#SmartCut",
      "#BarberShop",
      "#FreshFade",
      "#MensGrooming",
      "#BarberLife",
      "#HaircutGoals",
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          error: "AI image generation is not configured.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Identify user (optional)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await admin.auth.getUser(authHeader.slice(7));
      userId = data.user?.id ?? null;
    }

    const basePrompt =
      `${selectedPrompt}\n\nBusiness context: ${businessDescription || safeName}.\n` +
      `Style requirements: premium, modern, photo-realistic, cinematic lighting, ` +
      `polished social-media marketing visual for ${safeName}. Confident male model ` +
      `with sharp grooming, clean barbershop interior. Editorial color grading.`;

    // Generate sequentially to avoid bursting rate limits
    const images: Array<{
      variant: string;
      label: string;
      aspect: string;
      imageUrl: string;
      title: string;
      caption: string;
      hashtags: string[];
    }> = [];

    for (const v of VARIANTS) {
      const fullPrompt = `${basePrompt}\n\nAspect: ${v.aspect}. ${v.suffix}`;
      let dataUrl: string;
      try {
        dataUrl = await generateOne(LOVABLE_API_KEY, fullPrompt);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "unknown";
        if (msg === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({ success: false, error: "Rate limits exceeded, please try again in a minute." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(
            JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits in workspace settings." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        console.error("image gen error:", e);
        continue; // skip this variant, keep going
      }

      let finalUrl = dataUrl;
      if (userId) {
        try {
          const { bytes, mime } = dataUrlToBytes(dataUrl);
          const ext = mime.includes("png") ? "png" : "jpg";
          const path = `${userId}/${crypto.randomUUID()}.${ext}`;
          const up = await admin.storage
            .from("business-content-images")
            .upload(path, bytes, { contentType: mime, upsert: false });
          if (!up.error) {
            const { data: pub } = admin.storage
              .from("business-content-images")
              .getPublicUrl(path);
            if (pub?.publicUrl) finalUrl = pub.publicUrl;
          }
        } catch (e) {
          console.warn("upload failed, returning data URL:", e);
        }
      }

      const title = `${safeName} — ${v.label}`;
      const caption = buildCaption(safeName, v.label);

      images.push({
        variant: v.key,
        label: v.label,
        aspect: v.aspect,
        imageUrl: finalUrl,
        title,
        caption,
        hashtags,
      });

      if (userId) {
        await admin.from("business_content_images").insert({
          user_id: userId,
          business_name: safeName,
          prompt: fullPrompt,
          image_url: finalUrl,
          title,
          caption,
          hashtags_json: hashtags,
          aspect_ratio: v.aspect,
        });
      }
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ success: false, configured: true, error: "Image generation failed. Please try again." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, configured: true, images }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-business-images error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
