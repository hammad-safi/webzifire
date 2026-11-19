import { getSupabaseAdmin } from "@/lib/supabase";
import { callGeminiImageGen } from "@/lib/automation/geminiClient";

/**
 * Step 4: Generates a featured editorial image with currently supported Gemini native
 * image generation models and uploads it permanently to Supabase Storage (journal-images).
 */
export async function runGenerateAndStoreFeaturedImage(params: {
  articleId: string;
  slug: string;
  title: string;
  imagePrompt: string;
  servicePillar?: string;
}): Promise<{ imageUrl: string; modelUsed: string }> {
  const admin = getSupabaseAdmin();

  const prompt =
    params.imagePrompt && params.imagePrompt.trim().length > 20
      ? params.imagePrompt
      : `Abstract minimalist enterprise software architecture visualization representing "${params.title}", sleek obsidian glass geometry illuminated by soft crimson light trails and subtle warm bronze highlights, cinematic studio lighting, ultra sharp 16:9 editorial cover`;

  const { buffer, mimeType, modelUsed } = await callGeminiImageGen({
    prompt,
    articleId: params.articleId,
    servicePillar: params.servicePillar,
  });

  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg")
    ? "jpg"
    : mimeType.includes("webp")
      ? "webp"
      : "png";

  const filePath = `${params.slug}-${Date.now()}.${ext}`;

  // Ensure bucket exists (idempotent check)
  const { data: bucket } = await admin.storage.getBucket("journal-images");
  if (!bucket) {
    await admin.storage.createBucket("journal-images", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });
  }

  const { error: uploadError } = await admin.storage
    .from("journal-images")
    .upload(filePath, buffer, {
      contentType: mimeType,
      cacheControl: "31536000",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = admin.storage
    .from("journal-images")
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Supabase Storage did not return a public URL for uploaded image.");
  }

  return {
    imageUrl: publicUrlData.publicUrl,
    modelUsed,
  };
}
