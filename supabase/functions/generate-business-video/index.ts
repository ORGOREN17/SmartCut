import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// Generates a short vertical promotional video via fal.ai (Kling 9:16),
// uploads it to the `business-videos` bucket, and stores metadata.
// Falls back gracefully if no AI_VIDEO_API_KEY is configured.

const FAL_MODEL = "fal-ai/kling-video/v1.6/standard/text-to-video";

function buildPrompt(businessName: string, selectedPrompt: string) {
  return (
    `${selectedPrompt}\n\n` +
    `Style: 3-second vertical 9:16 promotional video for ${businessName}, ` +
    `a modern barbershop. Fast cinematic pacing, close-up fade and clipper details, ` +
    `premium lighting, confident final reveal. Energetic, professional, social-media ready ` +
    `(Instagram Reels / TikTok). No on-screen text.`
  );
}

function buildCaption(businessName: string) {
  return (
    `Fresh cuts, sharp fades, and a confident new look at ${businessName}. ` +
    `Book your next haircut today. 💈✂️`
  );
}

async function falGenerate(apiKey: string, prompt: string): Promise<string> {
  // Submit to queue
  const submit = await fetch(`https://queue.fal.run/${FAL_MODEL}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: "9:16",
      duration: "5", // Kling minimum; we ask for 3s pacing in the prompt
    }),
  });

  if (!submit.ok) {
    const t = await submit.text();
    throw new Error(`fal submit ${submit.status}: ${t.slice(0, 300)}`);
  }
  const queued = await submit.json();
  const statusUrl: string = queued.status_url;
  const responseUrl: string = queued.response_url;
  if (!statusUrl || !responseUrl) throw new Error("fal returned no queue URLs");

  // Poll
  const deadline = Date.now() + 4 * 60 * 1000; // 4 min cap
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const s = await fetch(statusUrl, {
      headers: { Authorization: `Key ${apiKey}` },
    });
    if (!s.ok) continue;
    const sj = await s.json();
    if (sj.status === "COMPLETED") break;
    if (sj.status === "FAILED") throw new Error("fal generation failed");
  }

  const finalRes = await fetch(responseUrl, {
    headers: { Authorization: `Key ${apiKey}` },
  });
  if (!finalRes.ok) throw new Error(`fal fetch ${finalRes.status}`);
  const final = await finalRes.json();
  const videoUrl: string | undefined = final?.video?.url;
  if (!videoUrl) throw new Error("fal returned no video url");
  return videoUrl;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      businessName,
      businessDescription,
      selectedPrompt,
    } = await req.json();

    if (!selectedPrompt || typeof selectedPrompt !== "string") {
      return new Response(JSON.stringify({ success: false, error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeName = (businessName || "Your Barbershop").toString().slice(0, 80);
    const title = `${safeName} — Barbershop Promo`;
    const caption = buildCaption(safeName);
    const hashtags = ["#SmartCut", "#BarberShop", "#FreshFade", "#MensGrooming", "#Reels", "#TikTokBarber"];

    const AI_VIDEO_API_KEY = Deno.env.get("AI_VIDEO_API_KEY");
    if (!AI_VIDEO_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          configured: false,
          error: "AI video generation is not configured yet. Add an AI video API key in Secrets to enable real video creation.",
          title, caption, hashtags,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Identify user from JWT (optional — function is public for fallback path)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await admin.auth.getUser(authHeader.slice(7));
      userId = data.user?.id ?? null;
    }

    const fullPrompt = buildPrompt(safeName, selectedPrompt);
    let providerVideoUrl: string;
    try {
      providerVideoUrl = await falGenerate(AI_VIDEO_API_KEY, fullPrompt);
    } catch (e) {
      console.error("video provider error:", e);
      return new Response(
        JSON.stringify({
          success: false,
          configured: true,
          error: "Video generation failed. Please try again.",
          title, caption, hashtags,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Best-effort: download and re-upload to our public bucket
    let finalUrl = providerVideoUrl;
    if (userId) {
      try {
        const vid = await fetch(providerVideoUrl);
        if (vid.ok) {
          const bytes = new Uint8Array(await vid.arrayBuffer());
          const path = `${userId}/${crypto.randomUUID()}.mp4`;
          const up = await admin.storage.from("business-videos").upload(path, bytes, {
            contentType: "video/mp4",
            upsert: false,
          });
          if (!up.error) {
            const { data: pub } = admin.storage.from("business-videos").getPublicUrl(path);
            if (pub?.publicUrl) finalUrl = pub.publicUrl;
          } else {
            console.warn("storage upload failed:", up.error);
          }
        }
      } catch (e) {
        console.warn("re-host failed, returning provider URL:", e);
      }

      // Best-effort metadata insert
      await admin.from("business_videos").insert({
        user_id: userId,
        business_name: safeName,
        prompt: fullPrompt,
        video_url: finalUrl,
        title,
        caption,
        hashtags_json: hashtags,
        provider: "fal.ai/kling-video",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        configured: true,
        videoUrl: finalUrl,
        title,
        caption,
        hashtags,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-business-video error:", e);
    return new Response(
      JSON.stringify({
        success: false,
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
