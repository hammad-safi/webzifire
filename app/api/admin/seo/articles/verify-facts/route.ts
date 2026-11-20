import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runFactAndSourceVerification } from "@/lib/automation/jobs/factVerification";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/seo/articles/verify-facts
 * Runs programmatic checks and Gemini Technical Fact Auditor on an existing or draft article.
 */
export async function POST(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { articleId, slug, title, summary, contentBlocks, internalLinks } = body;

    let targetTitle = title;
    let targetSummary = summary;
    let targetBlocks = contentBlocks;
    let targetLinks = internalLinks;
    let targetSources = body.researchSources;

    // If articleId or slug provided, load from Supabase
    if ((articleId || slug) && (!targetTitle || !targetBlocks)) {
      const admin = getSupabaseAdmin();
      let query = admin.from("journal_articles").select("*");
      if (articleId) query = query.eq("id", articleId);
      else if (slug) query = query.eq("slug", slug);

      const { data: art, error } = await query.maybeSingle();
      if (error || !art) {
        return NextResponse.json(
          { error: `Article not found: ${error?.message || "unknown"}` },
          { status: 404 }
        );
      }

      targetTitle = art.title;
      targetSummary = art.summary;
      targetBlocks = art.content_blocks;
      targetLinks = art.internal_links;
      targetSources = art.research_sources;
    }

    if (!targetTitle || !targetBlocks) {
      return NextResponse.json(
        { error: "Article title and contentBlocks are required for fact verification." },
        { status: 400 }
      );
    }

    const report = await runFactAndSourceVerification({
      title: targetTitle,
      summary: targetSummary || "",
      contentBlocks: targetBlocks,
      internalLinks: targetLinks || [],
      researchSources: targetSources || [],
      articleId,
    });

    return NextResponse.json({
      success: true,
      report,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Verify Facts API Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Fact verification failed.",
      },
      { status: 500 }
    );
  }
}
