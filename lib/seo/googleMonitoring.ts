import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function b64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function isGscConfigured(): boolean {
  return Boolean(
    process.env.GSC_SITE_URL && process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  );
}

export function isGa4ApiConfigured(): boolean {
  return Boolean(
    process.env.GA4_PROPERTY_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  );
}

export function isGa4TrackingConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
}

async function getGoogleAccessToken(scopes: string[]): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured.");
  const sa = JSON.parse(raw) as GoogleServiceAccount;

  const nowSec = Math.floor(Date.now() / 1000);
  const header = b64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claimSet = b64Url(
    JSON.stringify({
      iss: sa.client_email,
      scope: scopes.join(" "),
      aud: sa.token_uri || "https://oauth2.googleapis.com/token",
      iat: nowSec,
      exp: nowSec + 3300,
    })
  );
  const unsigned = `${header}.${claimSet}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = b64Url(signer.sign(sa.private_key));
  const assertion = `${unsigned}.${signature}`;

  const tokenRes = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google OAuth token exchange failed: ${errText.slice(0, 250)}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

function isoDateDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/**
 * Step 9: Syncs Google Search Console (impressions, clicks, CTR, position, queries, indexing)
 * and Google Analytics 4 (pageviews, engagement) for published /blog/* articles,
 * then generates non-destructive SEO recommendations (NEVER auto-modifies published articles).
 */
export async function syncSeoPerformanceMetrics(): Promise<{
  gscSynced: number;
  ga4Synced: number;
  recommendationsCreated: number;
  notes: string[];
}> {
  const admin = getSupabaseAdmin();
  const notes: string[] = [];

  const { data: published } = await admin
    .from("journal_articles")
    .select("id, slug, title, primary_keyword")
    .eq("status", "published");

  const articles: Array<{
    id: string;
    slug: string;
    title: string;
    primary_keyword: string;
  }> = published || [];
  if (articles.length === 0) {
    return {
      gscSynced: 0,
      ga4Synced: 0,
      recommendationsCreated: 0,
      notes: ["No published Supabase journal articles yet."],
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const startDate = isoDateDaysAgo(28);
  const endDate = isoDateDaysAgo(1);

  const metricsMap = new Map<
    string,
    {
      article_id: string;
      article_slug: string;
      impressions: number;
      clicks: number;
      ctr: number;
      avg_position: number;
      top_queries: { query: string; impressions: number; clicks: number; position: number }[];
      indexing_status: string;
      ga4_pageviews: number;
      ga4_avg_engagement_sec: number;
    }
  >();

  for (const art of articles) {
    metricsMap.set(art.slug, {
      article_id: art.id,
      article_slug: art.slug,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      avg_position: 0,
      top_queries: [],
      indexing_status: "unknown",
      ga4_pageviews: 0,
      ga4_avg_engagement_sec: 0,
    });
  }

  let gscSynced = 0;
  let ga4Synced = 0;

  // 1. Google Search Console API
  if (isGscConfigured()) {
    try {
      const accessToken = await getGoogleAccessToken([
        "https://www.googleapis.com/auth/webmasters.readonly",
      ]);
      const siteUrl = encodeURIComponent(process.env.GSC_SITE_URL!);

      const res = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions: ["page", "query"],
            rowLimit: 500,
          }),
        }
      );

      if (res.ok) {
        const gscData = await res.json();
        const rows: Array<{
          keys: [string, string];
          clicks: number;
          impressions: number;
          ctr: number;
          position: number;
        }> = gscData.rows || [];

        const grouped = new Map<string, typeof rows>();
        for (const row of rows) {
          const pageUrl = row.keys[0] || "";
          const match = pageUrl.match(/\/blog\/([^/?#]+)/);
          if (!match) continue;
          const slug = match[1];
          if (!metricsMap.has(slug)) continue;
          const list = grouped.get(slug) || [];
          list.push(row);
          grouped.set(slug, list);
        }

        for (const [slug, slugRows] of Array.from(grouped.entries())) {
          const rec = metricsMap.get(slug)!;
          const totalImpr = slugRows.reduce((s, r) => s + r.impressions, 0);
          const totalClicks = slugRows.reduce((s, r) => s + r.clicks, 0);
          const weightedPos =
            totalImpr > 0
              ? slugRows.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpr
              : 0;

          rec.impressions = Math.round(totalImpr);
          rec.clicks = Math.round(totalClicks);
          rec.ctr = totalImpr > 0 ? Number((totalClicks / totalImpr).toFixed(4)) : 0;
          rec.avg_position = Number(weightedPos.toFixed(2));
          rec.top_queries = slugRows
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 6)
            .map((r) => ({
              query: r.keys[1],
              impressions: Math.round(r.impressions),
              clicks: Math.round(r.clicks),
              position: Number(r.position.toFixed(1)),
            }));
          gscSynced += 1;
        }

        // URL Indexing Inspection (sample up to 5 newest published articles per sync)
        const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://webzifire.com").replace(/\/+$/, "");
        for (const art of articles.slice(0, 5)) {
          try {
            const inspectRes = await fetch(
              "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  inspectionUrl: `${siteBase}/blog/${art.slug}`,
                  siteUrl: process.env.GSC_SITE_URL,
                }),
              }
            );
            if (inspectRes.ok) {
              const inspectJson = await inspectRes.json();
              const verdict =
                inspectJson?.inspectionResult?.indexStatusResult?.coverageState ||
                inspectJson?.inspectionResult?.indexStatusResult?.verdict ||
                "unknown";
              metricsMap.get(art.slug)!.indexing_status = String(verdict);
            }
          } catch {
            // Non-fatal per-URL inspection error
          }
        }
      } else {
        notes.push(`GSC query returned HTTP ${res.status}`);
      }
    } catch (err) {
      notes.push(`GSC sync error: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    notes.push("Google Search Console not connected yet (optional env vars not set).");
  }

  // 2. Google Analytics 4 Data API
  if (isGa4ApiConfigured()) {
    try {
      const accessToken = await getGoogleAccessToken([
        "https://www.googleapis.com/auth/analytics.readonly",
      ]);
      const propertyId = process.env.GA4_PROPERTY_ID!;
      const gaRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [
              { name: "screenPageViews" },
              { name: "userEngagementDuration" },
            ],
            dimensionFilter: {
              filter: {
                fieldName: "pagePath",
                stringFilter: { matchType: "BEGINS_WITH", value: "/blog/" },
              },
            },
          }),
        }
      );

      if (gaRes.ok) {
        const gaJson = await gaRes.json();
        for (const row of gaJson.rows || []) {
          const path: string = row.dimensionValues?.[0]?.value || "";
          const match = path.match(/^\/blog\/([^/?#]+)/);
          if (!match) continue;
          const slug = match[1];
          const rec = metricsMap.get(slug);
          if (!rec) continue;
          const views = Number(row.metricValues?.[0]?.value || 0);
          const totalDur = Number(row.metricValues?.[1]?.value || 0);
          rec.ga4_pageviews = views;
          rec.ga4_avg_engagement_sec =
            views > 0 ? Number((totalDur / views).toFixed(1)) : 0;
          ga4Synced += 1;
        }
      } else {
        notes.push(`GA4 Data API returned HTTP ${gaRes.status}`);
      }
    } catch (err) {
      notes.push(`GA4 sync error: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    notes.push("Google Analytics 4 Data API not connected yet (optional).");
  }

  // Persist metrics rows if either integration synced real data
  if (gscSynced > 0 || ga4Synced > 0) {
    const upsertRows = Array.from(metricsMap.values()).map((m) => ({
      ...m,
      metric_date: today,
    }));
    await admin
      .from("seo_performance_metrics")
      .upsert(upsertRows, { onConflict: "article_slug,metric_date" });
  }

  // 3. Non-Destructive AI Recommendations based ONLY on real synced performance data
  let recommendationsCreated = 0;
  if (gscSynced > 0) {
    try {
      const performanceSummary = Array.from(metricsMap.values()).filter(
        (m) => m.impressions > 0 || m.indexing_status !== "unknown"
      );
      if (performanceSummary.length > 0) {
        const { data: recRes } = await callGeminiStructuredJson<{
          recommendations: Array<{
            articleSlug: string | null;
            recommendationType:
              | "new_topic"
              | "ctr_optimization"
              | "content_expansion"
              | "indexing_alert";
            priority: "low" | "medium" | "high";
            title: string;
            rationale: string;
            suggestedAction: string;
          }>;
        }>({
          prompt: `Analyze these real 28-day Google Search Console & GA4 metrics for WebziFire published blog articles.
Metrics: ${JSON.stringify(performanceSummary)}

Produce 2–4 actionable, non-destructive SEO recommendations (e.g., new follow-up topics from emerging queries, CTR title suggestions for high-impression/low-CTR pages, or indexing alerts).
NEVER invent numbers outside the provided JSON.

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "articleSlug": "slug-or-null-for-new-topic",
      "recommendationType": "new_topic | ctr_optimization | content_expansion | indexing_alert",
      "priority": "low | medium | high",
      "title": "Short actionable headline",
      "rationale": "Grounded explanation citing only provided metrics",
      "suggestedAction": "Concrete next step requiring founder approval"
    }
  ]
}`,
          jobType: "sync_seo_metrics",
          preferPro: false,
          temperature: 0.25,
          maxOutputTokens: 1800,
        });

        const articleBySlug = new Map(articles.map((a) => [a.slug, a.id]));
        const toInsert = (recRes.recommendations || []).slice(0, 4).map((r) => ({
          article_id: r.articleSlug ? articleBySlug.get(r.articleSlug) || null : null,
          article_slug: r.articleSlug,
          recommendation_type: r.recommendationType,
          priority: r.priority,
          title: r.title,
          rationale: r.rationale,
          suggested_action: r.suggestedAction,
          status: "open",
        }));

        if (toInsert.length > 0) {
          await admin.from("seo_recommendations").insert(toInsert);
          recommendationsCreated = toInsert.length;
        }
      }
    } catch (recErr) {
      notes.push(
        `Recommendation generation skipped: ${
          recErr instanceof Error ? recErr.message : String(recErr)
        }`
      );
    }
  }

  await admin
    .from("automation_settings")
    .update({ last_seo_sync_at: new Date().toISOString() })
    .eq("id", "default");

  return { gscSynced, ga4Synced, recommendationsCreated, notes };
}

export interface ArticleGscInspectionResult {
  configured: boolean;
  slug: string;
  inspectionUrl: string;
  indexingStatus: string;
  verdict: string;
  lastCrawlTime?: string;
  robotsTxtState?: string;
  coverageState?: string;
  pageFetchState?: string;
  crawledAs?: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  topQueries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  message?: string;
  inspectedAt: string;
}

/**
 * Capability 3: Inspect a specific published article in Google Search Console.
 * Checks whether Google has indexed the article, retrieves crawl state, and queries
 * impressions and clicks.
 */
export async function inspectArticleIndexing(slug: string): Promise<ArticleGscInspectionResult> {
  const admin = getSupabaseAdmin();
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://webzifire.com").replace(/\/+$/, "");
  const inspectionUrl = `${siteBase}/blog/${slug}`;
  const today = new Date().toISOString().slice(0, 10);

  // Retrieve existing local metrics if any
  const { data: existingMetric } = await admin
    .from("seo_performance_metrics")
    .select("*")
    .eq("article_slug", slug)
    .order("metric_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  let indexingStatus = existingMetric?.indexing_status || "submitted";
  let verdict = "NEUTRAL";
  let lastCrawlTime: string | undefined;
  let coverageState: string | undefined;
  let pageFetchState: string | undefined;
  let robotsTxtState: string | undefined;
  let impressions = existingMetric?.impressions || 0;
  let clicks = existingMetric?.clicks || 0;
  let ctr = existingMetric?.ctr || 0;
  let avgPosition = existingMetric?.avg_position || 0;
  let topQueries = existingMetric?.top_queries || [];

  if (!isGscConfigured()) {
    return {
      configured: false,
      slug,
      inspectionUrl,
      indexingStatus,
      verdict: "NEUTRAL",
      coverageState: "Sitemap Submitted (GSC credentials pending)",
      impressions,
      clicks,
      ctr,
      avgPosition,
      topQueries,
      message: "Google Search Console service account not yet configured in environment variables. URL is live and submitted to /sitemap.xml.",
      inspectedAt: new Date().toISOString(),
    };
  }

  try {
    const accessToken = await getGoogleAccessToken([
      "https://www.googleapis.com/auth/webmasters.readonly",
    ]);

    // 1. Inspect URL Indexing Status
    const inspectRes = await fetch(
      "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inspectionUrl,
          siteUrl: process.env.GSC_SITE_URL,
        }),
      }
    );

    if (inspectRes.ok) {
      const inspectJson = await inspectRes.json();
      const statusRes = inspectJson?.inspectionResult?.indexStatusResult;
      verdict = statusRes?.verdict || "NEUTRAL";
      coverageState = statusRes?.coverageState || "Unknown";
      robotsTxtState = statusRes?.robotsTxtState;
      pageFetchState = statusRes?.pageFetchState;
      lastCrawlTime = statusRes?.lastCrawlTime;

      if (verdict === "PASS" || (coverageState && coverageState.toLowerCase().includes("indexed"))) {
        indexingStatus = "indexed";
      } else if (coverageState && coverageState.toLowerCase().includes("crawled")) {
        indexingStatus = "crawled";
      } else if (coverageState && coverageState.toLowerCase().includes("discovered")) {
        indexingStatus = "discovered";
      } else {
        indexingStatus = "submitted";
      }
    }

    // 2. Fetch recent Search Analytics for this specific article URL
    const siteUrl = encodeURIComponent(process.env.GSC_SITE_URL!);
    const startDate = isoDateDaysAgo(28);
    const endDate = isoDateDaysAgo(1);

    const queryRes = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          dimensionFilterGroups: [
            {
              filters: [
                {
                  dimension: "page",
                  operator: "equals",
                  expression: inspectionUrl,
                },
              ],
            },
          ],
          rowLimit: 50,
        }),
      }
    );

    if (queryRes.ok) {
      const queryJson = await queryRes.json();
      const rows: Array<{
        keys: [string];
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }> = queryJson.rows || [];

      if (rows.length > 0) {
        const totalImpr = rows.reduce((s, r) => s + r.impressions, 0);
        const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
        const weightedPos =
          totalImpr > 0
            ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpr
            : 0;

        impressions = Math.round(totalImpr);
        clicks = Math.round(totalClicks);
        ctr = totalImpr > 0 ? Number((totalClicks / totalImpr).toFixed(4)) : 0;
        avgPosition = Number(weightedPos.toFixed(2));
        topQueries = rows
          .sort((a, b) => b.impressions - a.impressions)
          .slice(0, 10)
          .map((r) => ({
            query: r.keys[0],
            impressions: Math.round(r.impressions),
            clicks: Math.round(r.clicks),
            position: Number(r.position.toFixed(1)),
          }));
      }
    }

    // Upsert into Supabase seo_performance_metrics
    const { data: artRow } = await admin
      .from("journal_articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    await admin.from("seo_performance_metrics").upsert(
      {
        article_id: artRow?.id || null,
        article_slug: slug,
        metric_date: today,
        impressions,
        clicks,
        ctr,
        avg_position: avgPosition,
        top_queries: topQueries,
        indexing_status: indexingStatus,
      },
      { onConflict: "article_slug,metric_date" }
    );
  } catch (err) {
    console.error("[GoogleMonitoring] Inspection error for slug", slug, err);
  }

  return {
    configured: true,
    slug,
    inspectionUrl,
    indexingStatus,
    verdict,
    lastCrawlTime,
    coverageState,
    pageFetchState,
    robotsTxtState,
    impressions,
    clicks,
    ctr,
    avgPosition,
    topQueries,
    inspectedAt: new Date().toISOString(),
  };
}
