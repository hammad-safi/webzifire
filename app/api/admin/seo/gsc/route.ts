import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  inspectArticleIndexing,
  syncSeoPerformanceMetrics,
  isGscConfigured,
} from "@/lib/seo/googleMonitoring";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/seo/gsc
 * Retrieves Google Search Console tracking data (indexing status, impressions, clicks, CTR, top queries).
 * Query parameter: ?slug=optional-article-slug
 */
export async function GET(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      const inspection = await inspectArticleIndexing(slug);
      return NextResponse.json({
        success: true,
        data: inspection,
      });
    }

    // Return GSC summary across all published articles
    const admin = getSupabaseAdmin();
    const [{ data: published }, { data: metrics }] = await Promise.all([
      admin
        .from("journal_articles")
        .select("id, slug, title, primary_keyword, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false }),
      admin
        .from("seo_performance_metrics")
        .select("*")
        .order("metric_date", { ascending: false }),
    ]);

    const latestMetricBySlug = new Map<string, any>();
    for (const m of metrics || []) {
      if (!latestMetricBySlug.has(m.article_slug)) {
        latestMetricBySlug.set(m.article_slug, m);
      }
    }

    const articlesWithGsc = ((published as any[]) || []).map((art: any) => {
      const metric = latestMetricBySlug.get(art.slug);
      return {
        id: art.id,
        slug: art.slug,
        title: art.title,
        primary_keyword: art.primary_keyword,
        published_at: art.published_at,
        indexing_status: metric?.indexing_status || "submitted",
        impressions: metric?.impressions || 0,
        clicks: metric?.clicks || 0,
        ctr: metric?.ctr || 0,
        avg_position: metric?.avg_position || 0,
        top_queries: metric?.top_queries || [],
        metric_date: metric?.metric_date || null,
      };
    });

    return NextResponse.json({
      success: true,
      gscConfigured: isGscConfigured(),
      articles: articlesWithGsc,
      totalTracked: articlesWithGsc.length,
    });
  } catch (err) {
    console.error("[GSC API Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed loading Google Search Console data.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/seo/gsc
 * Triggers on-demand Google Search Console inspection or full sync.
 * Body: { action: "inspect" | "sync", slug?: string }
 */
export async function POST(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action || "inspect";
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";

    if (action === "inspect" && slug) {
      const result = await inspectArticleIndexing(slug);
      return NextResponse.json({
        success: true,
        action: "inspect",
        result,
      });
    }

    if (action === "sync") {
      const result = await syncSeoPerformanceMetrics();
      return NextResponse.json({
        success: true,
        action: "sync",
        result,
      });
    }

    return NextResponse.json(
      { error: "Invalid action or missing slug for inspect." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[GSC Action Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed performing Google Search Console action.",
      },
      { status: 500 }
    );
  }
}
