import { getSupabaseAdmin } from "@/lib/supabase";
import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { sendContentRefreshDigestEmail } from "@/lib/email/mailer";
import { JournalArticleRecord, SeoMetricRecord } from "@/lib/automation/types";

export interface ArticleRefreshAnalysis {
  articleId: string;
  slug: string;
  title: string;
  publishedAt: string;
  ageDays: number;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  topQueries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  healthVerdict: "healthy" | "underperforming" | "outdated" | "high_opportunity";
  keySignals: string[];
  recommendations: Array<{
    type: "ctr_optimization" | "content_expansion" | "technical_update";
    priority: "high" | "medium" | "low";
    title: string;
    rationale: string;
    suggestedAction: string;
  }>;
}

export interface ContentRefreshAuditResult {
  totalAudited: number;
  underperformingCount: number;
  outdatedCount: number;
  recommendationsCreated: number;
  articles: ArticleRefreshAnalysis[];
  emailSentTo?: string;
  auditedAt: string;
}

/**
 * Capability 4: 30–60 Day Automatic Content Refresh Engine.
 * Analyzes older articles against GSC performance and emerging engineering standards,
 * stores actionable refresh recommendations, and emails an executive report to the founder.
 */
export async function runContentRefreshAudit(options?: {
  minAgeDays?: number;
  recipientEmail?: string | null;
  forceAll?: boolean;
}): Promise<ContentRefreshAuditResult> {
  const admin = getSupabaseAdmin();
  const minAge = options?.minAgeDays ?? 30; // 30–60 days standard
  const cutoffDate = new Date(Date.now() - minAge * 24 * 60 * 60 * 1000).toISOString();

  // 1. Fetch published articles older than cutoffDate (or all published if forceAll)
  let query = admin
    .from("journal_articles")
    .select("*")
    .eq("status", "published");

  if (!options?.forceAll) {
    query = query.lte("published_at", cutoffDate);
  }

  const { data: publishedRows, error } = await query.order("published_at", {
    ascending: true,
  });
  if (error) {
    throw new Error(`Failed loading articles for refresh audit: ${error.message}`);
  }

  let articlesToAudit = (publishedRows || []) as JournalArticleRecord[];

  // Fallback: If no articles are older than 30 days yet (new site), audit the existing published articles
  if (articlesToAudit.length === 0) {
    const { data: anyPublished } = await admin
      .from("journal_articles")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: true })
      .limit(6);
    articlesToAudit = (anyPublished || []) as JournalArticleRecord[];
  }

  if (articlesToAudit.length === 0) {
    return {
      totalAudited: 0,
      underperformingCount: 0,
      outdatedCount: 0,
      recommendationsCreated: 0,
      articles: [],
      auditedAt: new Date().toISOString(),
    };
  }

  // 2. Fetch recent SEO performance metrics
  const slugs = articlesToAudit.map((a) => a.slug);
  const { data: metricRows } = await admin
    .from("seo_performance_metrics")
    .select("*")
    .in("article_slug", slugs)
    .order("metric_date", { ascending: false });

  const latestMetricBySlug = new Map<string, SeoMetricRecord>();
  for (const m of (metricRows || []) as SeoMetricRecord[]) {
    if (!latestMetricBySlug.has(m.article_slug)) {
      latestMetricBySlug.set(m.article_slug, m);
    }
  }

  const analyses: ArticleRefreshAnalysis[] = [];
  const recommendationsToInsert: Array<{
    article_id: string;
    article_slug: string;
    recommendation_type: string;
    priority: string;
    title: string;
    rationale: string;
    suggested_action: string;
    status: string;
  }> = [];

  // 3. Analyze each article with Gemini Auditor
  for (const art of articlesToAudit) {
    const metric = latestMetricBySlug.get(art.slug);
    const pubDate = art.published_at || art.created_at;
    const ageDays = Math.max(
      1,
      Math.round((Date.now() - new Date(pubDate).getTime()) / (24 * 60 * 60 * 1000))
    );

    const impressions = metric?.impressions || 0;
    const clicks = metric?.clicks || 0;
    const ctr = metric?.ctr || 0;
    const avgPosition = metric?.avg_position || 0;
    const topQueries = metric?.top_queries || [];

    const blocks = Array.isArray(art.content_blocks) ? art.content_blocks : [];
    const sectionHeadings = blocks
      .filter((b) => b.type === "heading2" || b.type === "heading3")
      .map((b) => b.text || "")
      .join("\n- ");

    const prompt = `
You are WebziFire's Senior Content & SEO Strategist.
Audit this older published article (published ${ageDays} days ago) to determine if it is underperforming or becoming outdated, and generate actionable refresh recommendations.

Article Title: ${art.title}
Slug: /blog/${art.slug}
Service Pillar: ${art.service_pillar}
Primary Keyword: ${art.primary_keyword}
Secondary Keywords: ${(art.secondary_keywords || []).join(", ")}
Age: ${ageDays} days live
28-Day Google Impressions: ${impressions}
28-Day Google Clicks: ${clicks}
28-Day CTR: ${(ctr * 100).toFixed(2)}%
Average Google Ranking Position: ${avgPosition || "unranked"}
Top Emerging Google Search Queries: ${JSON.stringify(topQueries)}
Current Headings Outline:
- ${sectionHeadings}

Summary: ${art.summary}

AUDIT OBJECTIVES:
1. Underperformance Check: If impressions are high but clicks/CTR are low (<2.5%), recommend a punchy title and meta description hook rewrite.
2. Outdated Content Check: Are there emerging 2026 software architecture patterns, updated library versions, or modern architectural trade-offs not addressed in the outline?
3. Keyword Expansion: Are there emerging queries from the Google Search Console data that deserve a dedicated new H2 section or FAQ answer?
4. Concrete Recommendations: Provide 1 to 2 high-impact, non-destructive recommendations. NEVER invent fake statistics.

Return ONLY valid JSON:
{
  "healthVerdict": "healthy | underperforming | outdated | high_opportunity",
  "keySignals": ["2 to 3 concise diagnostic observations about this article's performance or age"],
  "recommendations": [
    {
      "type": "ctr_optimization | content_expansion | technical_update",
      "priority": "high | medium | low",
      "title": "Clear action-oriented title",
      "rationale": "Why this update will boost rankings or conversion",
      "suggestedAction": "Exact steps for the founder/editor to apply"
    }
  ]
}
`;

    try {
      const { data: analysisRes } = await callGeminiStructuredJson<{
        healthVerdict: "healthy" | "underperforming" | "outdated" | "high_opportunity";
        keySignals: string[];
        recommendations: Array<{
          type: "ctr_optimization" | "content_expansion" | "technical_update";
          priority: "high" | "medium" | "low";
          title: string;
          rationale: string;
          suggestedAction: string;
        }>;
      }>({
        prompt,
        jobType: "content_refresh",
        articleId: art.id,
        preferPro: false,
        temperature: 0.2,
        maxOutputTokens: 1800,
      });

      const analysis: ArticleRefreshAnalysis = {
        articleId: art.id,
        slug: art.slug,
        title: art.title,
        publishedAt: pubDate,
        ageDays,
        impressions,
        clicks,
        ctr,
        avgPosition,
        topQueries,
        healthVerdict: analysisRes.healthVerdict || (ageDays >= 45 ? "outdated" : "healthy"),
        keySignals: analysisRes.keySignals || [`Published ${ageDays} days ago`],
        recommendations: analysisRes.recommendations || [],
      };

      analyses.push(analysis);

      // Collect recommendations for database persistence
      for (const rec of analysis.recommendations) {
        recommendationsToInsert.push({
          article_id: art.id,
          article_slug: art.slug,
          recommendation_type: rec.type,
          priority: rec.priority,
          title: rec.title,
          rationale: rec.rationale,
          suggested_action: rec.suggestedAction,
          status: "open",
        });
      }
    } catch (err) {
      console.error(`[ContentRefresh] Analysis failed for ${art.slug}:`, err);
    }
  }

  // 4. Save recommendations into Supabase
  let recommendationsCreated = 0;
  if (recommendationsToInsert.length > 0) {
    try {
      const { error: insErr } = await admin
        .from("seo_recommendations")
        .insert(recommendationsToInsert);
      if (!insErr) {
        recommendationsCreated = recommendationsToInsert.length;
      }
    } catch (dbErr) {
      console.warn("[ContentRefresh] Failed persisting recommendations:", dbErr);
    }
  }

  // 5. Send executive email report to founder
  let emailSentTo: string | undefined;
  try {
    const mailRes = await sendContentRefreshDigestEmail({
      analyses,
      recipientEmail: options?.recipientEmail,
    });
    emailSentTo = mailRes.to;
  } catch (mailErr) {
    console.error("[ContentRefresh] Email dispatch failed:", mailErr);
  }

  const underperformingCount = analyses.filter(
    (a) => a.healthVerdict === "underperforming"
  ).length;
  const outdatedCount = analyses.filter((a) => a.healthVerdict === "outdated").length;

  return {
    totalAudited: analyses.length,
    underperformingCount,
    outdatedCount,
    recommendationsCreated,
    articles: analyses,
    emailSentTo,
    auditedAt: new Date().toISOString(),
  };
}
