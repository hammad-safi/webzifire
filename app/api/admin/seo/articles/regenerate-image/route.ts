import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { runGenerateAndStoreFeaturedImage } from "@/lib/automation/jobs/generateImage";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/seo/articles/regenerate-image
 * Regenerates an ultra-high-definition featured image for an article using FLUX.1 / Imagen 3
 * and stores it permanently in Supabase Storage.
 */
export async function POST(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { articleId, customPrompt } = body;

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: article, error: fetchErr } = await admin
      .from("journal_articles")
      .select("id, slug, title, image_prompt, service_pillar")
      .eq("id", articleId)
      .single();

    if (fetchErr || !article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const prompt =
      (customPrompt && customPrompt.trim().length > 10)
        ? customPrompt.trim()
        : article.image_prompt ||
          `Modern editorial tech photography illustrating ${article.title}, sleek modern workspace with clean displays in natural bright daylight, authentic professional atmosphere, sharp focus, 8k resolution, 16:9 widescreen, no text`;

    const { imageUrl, modelUsed } = await runGenerateAndStoreFeaturedImage({
      articleId: article.id,
      slug: article.slug,
      title: article.title,
      imagePrompt: prompt,
      servicePillar: article.service_pillar,
    });

    // Update article with new image_url
    const { data: updatedArticle, error: updateErr } = await admin
      .from("journal_articles")
      .update({
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .select("id, slug, title, image_url")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      modelUsed,
      article: updatedArticle,
    });
  } catch (err) {
    console.error("[Regenerate Image Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to regenerate image." },
      { status: 500 }
    );
  }
}
