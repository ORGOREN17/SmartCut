import type { FaceAnalysis, GeneratedHairstyle, ComparisonResult, HairstyleDefinition } from "@/data/types";
import { hairstyleDefinitions, scoreHairstyles } from "@/data/hairstyleDefinitions";
import { hairstyleImages } from "@/data/images";
import { demoAnalyzeFace } from "@/services/demoAnalysisService";
import { demoCompareHairstyles } from "@/services/demoComparisonService";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/services/storageService";

// ─── PRODUCTION + DEMO FALLBACK ─────────────────────────────
// Calls real Lovable AI edge functions when available; falls back
// to deterministic local logic so the demo flow never breaks.

const AI_TIMEOUT_MS = 15000;

function withTimeout<T>(p: Promise<T>, ms = AI_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("AI timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
  });
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch { return null; }
}

/** Read a File as a base64 data URL (raw, no orientation handling) */
function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert File to base64 data URL, normalizing EXIF orientation so mobile
 * photos (which often carry rotation metadata) render upright everywhere.
 */
export async function fileToBase64(file: File): Promise<string> {
  // Only attempt normalization for raster images.
  if (!file.type.startsWith("image/")) {
    return readFileAsDataURL(file);
  }

  // Target longest edge. Large source images (>2MP) cause Gemini's image
  // model to lose identity and synthesize a generic person, which is the
  // single biggest cause of "different face" outputs in production.
  const MAX_EDGE = 1024;

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    } as ImageBitmapOptions);

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    // Always output JPEG — smaller payload, faster upload, same identity quality.
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    console.log("[fileToBase64] normalized", {
      original: `${bitmap.width}x${bitmap.height}`,
      output: `${w}x${h}`,
      bytes: dataUrl.length,
    });
    return dataUrl;
  } catch (e) {
    console.warn("[fileToBase64] normalization failed, falling back to raw:", e);
    return readFileAsDataURL(file);
  }
}

/** Analyze face — tries real AI, falls back to demo */
export async function analyzeFace(imageBase64: string, file?: File): Promise<FaceAnalysis> {
  const userId = await getCurrentUserId();

  // Best-effort upload of input image (non-blocking on failure)
  let inputImageUrl: string | null = null;
  if (userId && file) {
    try {
      const { publicUrl } = await uploadImage("user-uploads", userId, file);
      inputImageUrl = publicUrl;
    } catch (e) { console.warn("[analyzeFace] upload failed:", e); }
  }

  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke("analyze-face", { body: { imageBase64 } })
    );
    if (error) throw error;
    if (!data || data.error) throw new Error(data?.message || "AI failed");

    const result = data as FaceAnalysis;

    // Save analysis (best effort)
    if (userId) {
      supabase.from("ai_analyses").insert({
        user_id: userId,
        analysis_type: "face",
        result_json: result as any,
        input_image_url: inputImageUrl,
      }).then(({ error: e }) => { if (e) console.warn("[analyzeFace] save failed:", e); });
    }
    return result;
  } catch (err) {
    console.warn("[analyzeFace] falling back to demo:", err);
    await new Promise((r) => setTimeout(r, 800));
    const demoFile = file ?? new File(["demo"], "demo-photo.jpg", { type: "image/jpeg" });
    const result = demoAnalyzeFace(demoFile);
    if (userId) {
      supabase.from("ai_analyses").insert({
        user_id: userId,
        analysis_type: "face_demo",
        result_json: result as any,
        input_image_url: inputImageUrl,
      }).then(() => {});
    }
    return result;
  }
}

/** Get a demo preview image for a hairstyle (uses pre-loaded catalog images) */
export function getDemoPreviewImage(styleId: string): string {
  const idx = (parseInt(styleId, 10) - 1) % hairstyleImages.length;
  return hairstyleImages[Math.max(0, idx)];
}

/** Generate hairstyle preview using the uploaded photo as the reference image.
 *  IMPORTANT: never silently fall back to a generic stock image — that would
 *  break the core promise of "see yourself with a new haircut". On failure,
 *  throw so the UI can show a clear retry state on the user's own photo. */
export async function generateHairstylePreview(
  imageBase64: string,
  hairstyleName: string,
  hairstyleDescription: string,
  styleId?: string
): Promise<string> {
  const usingUploadedImage =
    typeof imageBase64 === "string" &&
    (imageBase64.startsWith("data:image") || imageBase64.startsWith("http"));
  console.log("[generateHairstylePreview] Using uploaded image:", usingUploadedImage, {
    style: hairstyleName,
    styleId,
    imagePreview: typeof imageBase64 === "string" ? imageBase64.substring(0, 60) + "…" : typeof imageBase64,
    imageLength: typeof imageBase64 === "string" ? imageBase64.length : 0,
  });
  if (!usingUploadedImage) {
    throw new Error("Missing uploaded user image — cannot generate preview without a source photo");
  }

  const { data, error } = await withTimeout(
    supabase.functions.invoke("generate-hairstyle", {
      body: { imageBase64, hairstyleName, hairstyleDescription },
    })
  );
  if (error) {
    console.error("[generateHairstylePreview] edge function error:", error);
    throw error;
  }
  if (!data?.imageUrl) {
    console.warn("[generateHairstylePreview] No image returned. fallback:", data?.fallback, "error:", data?.error);
    throw new Error(data?.error || "AI did not return an image");
  }

  console.log("[generateHairstylePreview] Got image URL (truncated):", String(data.imageUrl).substring(0, 80) + "…");

  // Best-effort save to history
  const userId = await getCurrentUserId();
  if (userId) {
    supabase.from("hairstyle_results").insert({
      user_id: userId,
      name: hairstyleName,
      image_url: data.imageUrl,
      category: styleId ?? null,
    }).then(() => {});
  }
  return data.imageUrl;
}

/** Compare hairstyles — tries real AI, falls back to demo */
export async function compareHairstyles(
  referenceImageBase64: string,
  comparisonImageBase64: string,
  styleId?: string,
  fileName?: string,
  fileSize?: number
): Promise<ComparisonResult> {
  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke("compare-hairstyles", {
        body: { referenceImageBase64, comparisonImageBase64 },
      })
    );
    if (error) throw error;
    if (!data) throw new Error("No comparison result");

    const result: ComparisonResult = {
      similarityScore: data.similarityScore,
      matchLevel: data.matchLevel,
      feedback: data.feedback,
      details: data.details ?? [],
      barberFeedback: data.barberFeedback,
    };

    const userId = await getCurrentUserId();
    if (userId) {
      supabase.from("comparison_results").insert({
        user_id: userId,
        target_image_url: typeof referenceImageBase64 === "string" && referenceImageBase64.startsWith("http") ? referenceImageBase64 : null,
        match_score: result.similarityScore,
        match_level: result.matchLevel,
        breakdown_json: result as any,
      }).then(() => {});
    }
    return result;
  } catch (err) {
    console.warn("[compareHairstyles] falling back to demo:", err);
    await new Promise((r) => setTimeout(r, 600));
    return demoCompareHairstyles(
      styleId ?? "unknown",
      fileName ?? "result.jpg",
      fileSize ?? 50000
    );
  }
}

/** Get scored hairstyle definitions */
export function getRecommendations(
  analysis: FaceAnalysis,
  preferences?: { vibe?: string; maintenance?: string; length?: string }
): Array<HairstyleDefinition & { matchScore: number; explanation: string }> {
  const scored = scoreHairstyles(
    hairstyleDefinitions,
    analysis.faceShape,
    analysis.hairType,
    preferences
  );
  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

/** Assign badges to top results */
export function assignBadges(styles: GeneratedHairstyle[]): GeneratedHairstyle[] {
  const sorted = [...styles].sort((a, b) => b.matchScore - a.matchScore);
  if (sorted[0]) sorted[0].badge = "best-match";
  const professional = sorted.find((s) => s.vibes.includes("professional") && !s.badge);
  if (professional) professional.badge = "most-professional";
  const lowMaint = sorted.find((s) => s.maintenance === "low" && !s.badge);
  if (lowMaint) lowMaint.badge = "lowest-maintenance";
  const boldest = sorted.find((s) => s.category === "bold" && !s.badge);
  if (boldest) boldest.badge = "boldest-change";
  return sorted;
}

// ─── Local storage helpers ──────────────────────────────────
const FAVORITES_KEY = "smartcut_favorites";
const HISTORY_KEY = "smartcut_history";

export function getFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
}

export function toggleFavorite(id: string): string[] {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getHistory(): Array<{
  id: string; date: string; faceShape: string; topRecommendation: string; stylesViewed: number; userImageUrl?: string;
}> {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export function addHistory(entry: Omit<ReturnType<typeof getHistory>[0], "id">): void {
  const history = getHistory();
  history.unshift({ ...entry, id: crypto.randomUUID() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}
