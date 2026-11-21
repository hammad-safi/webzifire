import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { getAutomationSettings } from "@/lib/automation/orchestrator";
import { isSmtpConfigured } from "@/lib/email/mailer";
import {
  isGa4ApiConfigured,
  isGa4TrackingConfigured,
  isGscConfigured,
} from "@/lib/seo/googleMonitoring";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integrations = {
    gemini: Boolean(process.env.GEMINI_API_KEY),
    supabase: isSupabaseAdminConfigured(),
    smtp: isSmtpConfigured(),
    approvalEmail: process.env.ADMIN_APPROVAL_EMAIL || process.env.SMTP_USER || "",
    gsc: isGscConfigured(),
    ga4Api: isGa4ApiConfigured(),
    ga4Tracking: isGa4TrackingConfigured(),
    cronSecret: Boolean(process.env.CRON_SECRET),
  };

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({
      configured: false,
      integrations,
      message:
        "Supabase credentials not yet configured. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    });
  }

  try {
    const admin = getSupabaseAdmin();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      settings,
      articlesRes,
      jobsRes,
      usageRes,
      metricsRes,
      recsRes,
    ] = await Promise.all([
      getAutomationSettings(),
      admin
        .from("journal_articles")
        .select(
          "id, slug, title, category, service_pillar, status, word_count, quality_score, revision_count, image_url, image_alt, image_prompt, summary, takeaway, author, author_role, read_time, primary_keyword, approval_token, approval_email_sent_at, published_at, rejected_at, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(50),
      admin
        .from("automation_jobs")
        .select("id, run_id, article_id, job_type, status, attempts, last_error, started_at, completed_at, created_at")
        .order("created_at", { ascending: false })
        .limit(40),
      admin
        .from("ai_usage_logs")
        .select("model, job_type, prompt_tokens, output_tokens, image_count, estimated_cost_usd, success, created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("seo_performance_metrics")
        .select("*")
        .order("metric_date", { ascending: false })
        .limit(60),
      admin
        .from("seo_recommendations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    const articles: Array<Record<string, any>> = articlesRes.data || [];
    const jobs: Array<Record<string, any>> = jobsRes.data || [];
    const usageLogs: Array<Record<string, any>> = usageRes.data || [];
    const seoMetrics: Array<Record<string, any>> = metricsRes.data || [];
    const recommendations: Array<Record<string, any>> = recsRes.data || [];

    const stats = {
      totalGenerated: articles.length,
      pendingApprovals: articles.filter((a) => a.status === "pending_approval").length,
      published: articles.filter((a) => a.status === "published").length,
      rejected: articles.filter((a) => a.status === "rejected").length,
      inProgress: articles.filter((a) =>
        ["drafting", "qa_revising", "revision_requested"].includes(a.status)
      ).length,
    };

    // Aggregate 30-day Gemini API usage & estimated costs
    const byModel = new Map<
      string,
      { calls: number; promptTokens: number; outputTokens: number; images: number; costUsd: number }
    >();
    let totalPromptTokens = 0;
    let totalOutputTokens = 0;
    let totalImages = 0;
    let totalCostUsd = 0;

    for (const log of usageLogs) {
      const p = Number(log.prompt_tokens || 0);
      const o = Number(log.output_tokens || 0);
      const img = Number(log.image_count || 0);
      const cost = Number(log.estimated_cost_usd || 0);
      totalPromptTokens += p;
      totalOutputTokens += o;
      totalImages += img;
      totalCostUsd += cost;

      const existing = byModel.get(log.model) || {
        calls: 0,
        promptTokens: 0,
        outputTokens: 0,
        images: 0,
        costUsd: 0,
      };
      existing.calls += 1;
      existing.promptTokens += p;
      existing.outputTokens += o;
      existing.images += img;
      existing.costUsd = Number((existing.costUsd + cost).toFixed(6));
      byModel.set(log.model, existing);
    }

    // Deduplicate latest metric snapshot per article slug
    const latestMetricsBySlug = new Map<string, Record<string, unknown>>();
    let siteTotalMetric: Record<string, any> | null = null;

    for (const m of seoMetrics) {
      if (m.article_slug === "_site_total") {
        if (!siteTotalMetric) siteTotalMetric = m;
      } else if (!latestMetricsBySlug.has(m.article_slug)) {
        latestMetricsBySlug.set(m.article_slug, { ...m });
      }
    }

    // Ensure all published articles are represented in the live telemetry table
    for (const art of articles) {
      if (art.status === "published" && !latestMetricsBySlug.has(art.slug)) {
        latestMetricsBySlug.set(art.slug, {
          article_slug: art.slug,
          article_title: art.title,
          category: art.category,
          primary_keyword: art.primary_keyword,
          impressions: 0,
          clicks: 0,
          ctr: 0,
          avg_position: 0,
          indexing_status: "Submitted to Google (Sitemap Live)",
          ga4_pageviews: 0,
          metric_date: new Date().toISOString().slice(0, 10),
        });
      }
    }

    // Enrich metrics with article metadata
    for (const m of Array.from(latestMetricsBySlug.values())) {
      const matched = articles.find((a) => a.slug === m.article_slug);
      if (matched) {
        if (!m.article_title) m.article_title = matched.title;
        if (!m.category) m.category = matched.category;
        if (!m.primary_keyword) m.primary_keyword = matched.primary_keyword;
      }
    }

    const latestMetrics = Array.from(latestMetricsBySlug.values());
    const totalSiteViews = siteTotalMetric ? Number(siteTotalMetric.ga4_pageviews || 0) : 0;
    const articleViews = latestMetrics.reduce((s, m) => s + Number(m.ga4_pageviews || 0), 0);

    const seoTotals = {
      impressions: latestMetrics.reduce((s, m) => s + Number(m.impressions || 0), 0),
      clicks: latestMetrics.reduce((s, m) => s + Number(m.clicks || 0), 0),
      avgPosition:
        latestMetrics.length > 0
          ? Number(
              (
                latestMetrics.reduce((s, m) => s + Number(m.avg_position || 0), 0) /
                latestMetrics.length
              ).toFixed(1)
            )
          : 0,
      ga4Pageviews: totalSiteViews > 0 ? totalSiteViews : articleViews,
      totalSiteViews: Math.max(totalSiteViews, articleViews),
      articlePageviews: articleViews,
    };

    return NextResponse.json({
      configured: true,
      integrations,
      settings,
      stats,
      articles,
      jobs,
      usage30d: {
        totalCalls: usageLogs.length,
        totalPromptTokens,
        totalOutputTokens,
        totalImages,
        totalCostUsd: Number(totalCostUsd.toFixed(4)),
        byModel: Array.from(byModel.entries()).map(([model, v]) => ({
          model,
          ...v,
        })),
      },
      seo: {
        totals: seoTotals,
        metrics: latestMetrics,
        recommendations,
      },
    });
  } catch (err) {
    console.error("[Admin SEO GET Error]", err);
    return NextResponse.json(
      {
        configured: false,
        integrations,
        error:
          err instanceof Error
            ? err.message
            : "Database query failed (did you run supabase/schema.sql yet?).",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const admin = getSupabaseAdmin();

    // Update recommendation status (dismiss / applied)
    if (body?.recommendationId && body?.recommendationStatus) {
      const { error } = await admin
        .from("seo_recommendations")
        .update({ status: body.recommendationStatus })
        .eq("id", body.recommendationId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // Update journal_article if articleId / id is provided
    const targetArticleId = body?.articleId || (body?.id && body.id !== "default" ? body.id : null);
    if (targetArticleId) {
      const allowedFields: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (typeof body.title === "string") allowedFields.title = body.title.trim();
      if (typeof body.slug === "string") allowedFields.slug = body.slug.trim().toLowerCase();
      if (typeof body.category === "string") allowedFields.category = body.category.trim();
      if (typeof body.service_pillar === "string") allowedFields.service_pillar = body.service_pillar.trim();
      if (typeof body.summary === "string") allowedFields.summary = body.summary.trim();
      if (typeof body.takeaway === "string") allowedFields.takeaway = body.takeaway.trim();
      if (typeof body.image_url === "string") allowedFields.image_url = body.image_url.trim();
      if (typeof body.status === "string") allowedFields.status = body.status;

      const { data, error } = await admin
        .from("journal_articles")
        .update(allowedFields)
        .eq("id", targetArticleId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, article: data });
    }

    // Update automation_settings
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.automation_enabled === "boolean") {
      updates.automation_enabled = body.automation_enabled;
    }
    if (typeof body.articles_per_week === "number") {
      updates.articles_per_week = Math.max(1, Math.min(7, body.articles_per_week));
    }
    if (Array.isArray(body.schedule_days)) {
      updates.schedule_days = body.schedule_days.map((d: string) =>
        d.toLowerCase().slice(0, 3)
      );
    }
    if (typeof body.target_word_min === "number") {
      updates.target_word_min = Math.max(600, Math.min(2500, body.target_word_min));
    }
    if (typeof body.target_word_max === "number") {
      updates.target_word_max = Math.max(1000, Math.min(3500, body.target_word_max));
    }
    if (typeof body.min_quality_score === "number") {
      updates.min_quality_score = Math.max(60, Math.min(100, body.min_quality_score));
    }
    if (typeof body.default_author === "string" && body.default_author.trim()) {
      updates.default_author = body.default_author.trim();
    }
    if (typeof body.default_author_role === "string" && body.default_author_role.trim()) {
      updates.default_author_role = body.default_author_role.trim();
    }
    if (typeof body.approval_email === "string") {
      updates.approval_email = body.approval_email.trim() || null;
    }

    const { data, error } = await admin
      .from("automation_settings")
      .update(updates)
      .eq("id", "default")
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed updating settings.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id") || searchParams.get("articleId");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id || body?.articleId;
    }

    if (!id) {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("journal_articles")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 }
    );
  }
}
