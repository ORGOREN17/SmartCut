import { supabase } from "@/integrations/supabase/client";

export type Bucket = "user-uploads" | "generated-hairstyles" | "comparison-results";

export async function uploadImage(
  bucket: Bucket,
  userId: string,
  file: File | Blob,
  filename?: string
): Promise<{ path: string; publicUrl: string | null }> {
  const ext = (file instanceof File && file.name.split(".").pop()) || "png";
  const name = filename ?? `${Date.now()}.${ext}`;
  const path = `${userId}/${name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: (file as File).type || "image/png",
  });
  if (error) throw error;

  let publicUrl: string | null = null;
  if (bucket === "generated-hairstyles") {
    publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  } else {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24);
    publicUrl = data?.signedUrl ?? null;
  }

  return { path, publicUrl };
}

export async function getSignedUrl(bucket: Bucket, path: string, seconds = 3600) {
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}
