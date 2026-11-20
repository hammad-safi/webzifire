import { services } from "@/data/services";
import { getAllExistingSlugsAndTitles } from "@/lib/journals";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  callGeminiGroundedSearch,
  callGeminiStructuredJson,
} from "@/lib/automation/geminiClient";
import { TopicResearchResult } from "@/lib/automation/types";
import {
  getAllExistingTargetKeywords,
  checkKeywordCannibalization,
  CannibalizationCheckResult,
} from "@/lib/seo/keywordCannibalization";

const SERVICE_PILLARS = [
  { pillar: "Website & Web Application Development", category: "Engineering Architecture", focus: "high-converting Next.js enterprise websites, corporate web portals, custom React applications, Core Web Vitals" },
  { pillar: "SaaS Product Engineering", category: "SaaS Architecture", focus: "multi-tenant B2B SaaS platforms, PostgreSQL/Supabase isolation, subscription billing, scalable API architecture" },
  { pillar: "ERP & Custom Operations Software", category: "Enterprise Systems", focus: "custom ERP software vs off-the-shelf ERPs, inventory & finance workflows, PostgreSQL/MySQL transactional integrity" },
  { pillar: "POS & Retail Automation Systems", category: "Retail & POS Systems", focus: "cloud-synced omnichannel POS systems, offline-first retail checkout, real-time multi-branch inventory sync" },
  { pillar: "Custom CRM & Sales Automation", category: "Business Automation", focus: "bespoke CRM pipelines, lead scoring automation, ERP-to-CRM integration, replacing bloated per-seat SaaS" },
  { pillar: "Mobile Application Development", category: "Mobile Systems", focus: "React Native cross-platform iOS & Android apps, offline-first sync, biometric checkout, enterprise field apps" },
  { pillar: "E-Commerce Engineering", category: "E-Commerce Architecture", focus: "headless custom e-commerce engines, high-conversion checkout optimization, multi-currency international commerce" },
  { pillar: "Applied AI & Business Automation", category: "Applied AI", focus: "autonomous AI agents, RAG over enterprise PostgreSQL/pgvector data, support triage, document & workflow automation" },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 76)
    .replace(/^-+|-+$/g, "");
}

function normalizeFingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["the", "and", "for", "with", "how", "why", "your", "from", "into"].includes(w))
    .sort()
    .join("-");
}

/**
 * Steps 1 & 2: Automated Topic Discovery + Grounded SEO Competitor Research.
 * - Pulls existing titles/slugs to guarantee zero duplication.
 * - Uses real Google Search Console opportunities if available.
 * - Uses Gemini + Google Search Grounding for live competitor gap research.
 * - Strictly forbids inventing keyword volumes or search statistics.
 */
export async function runTopicAndSeoResearch(options?: {
  preferredPillar?: string;
}): Promise<TopicResearchResult> {
  const admin = getSupabaseAdmin();
  const [{ slugs, titles }, existingTargetKeywords] = await Promise.all([
    getAllExistingSlugsAndTitles(),
    getAllExistingTargetKeywords(),
  ]);

  const existingKeywordsList = existingTargetKeywords
    .map((k) => `- "${k.primaryKeyword}" (Used in: ${k.title} -> /blog/${k.slug})`)
    .slice(0, 40)
    .join("\n");

  // Pull recent GSC opportunities / recommendations if any exist
  let seoOpportunityContext = "No Google Search Console data connected yet; prioritize high-intent international B2B buyer questions (US, UK, UAE/GCC, Europe).";
  try {
    const [{ data: metrics }, { data: recs }] = await Promise.all([
      admin
        .from("seo_performance_metrics")
        .select("article_slug, top_queries, impressions, clicks, avg_position")
        .order("impressions", { ascending: false })
        .limit(8),
      admin
        .from("seo_recommendations")
        .select("title, rationale, suggested_action")
        .eq("status", "open")
        .eq("recommendation_type", "new_topic")
        .limit(5),
    ]);

    if ((metrics && metrics.length > 0) || (recs && recs.length > 0)) {
      seoOpportunityContext = `Real Google Search Console insights from our site:\nMetrics: ${JSON.stringify(
        metrics || []
      )}\nOpen Topic Recommendations: ${JSON.stringify(recs || [])}`;
    }
  } catch {
    // Ignore if tables are empty
  }

  // Pick least-recently-used service pillar to keep coverage balanced
  const { data: recentArticles } = await admin
    .from("journal_articles")
    .select("service_pillar")
    .order("created_at", { ascending: false })
    .limit(12);

  const recentCounts = new Map<string, number>();
  for (const r of recentArticles || []) {
    recentCounts.set(r.service_pillar, (recentCounts.get(r.service_pillar) || 0) + 1);
  }

  const chosenPillar =
    SERVICE_PILLARS.find((p) => p.pillar === options?.preferredPillar) ||
    [...SERVICE_PILLARS].sort(
      (a, b) => (recentCounts.get(a.pillar) || 0) - (recentCounts.get(b.pillar) || 0)
    )[0];

  const serviceCatalog = services
    .map((s) => `- ${s.title} (/services/${s.slug}): ${s.shortDescription}`)
    .join("\n");

  // Stage 1A: Grounded live Google Search research
  const researchPrompt = `
You are WebziFire's Principal Technical SEO Strategist.
WebziFire is an international software engineering agency building custom websites, SaaS, ERP, POS, CRM, mobile apps, e-commerce, and AI business automation for clients in the US, UK, UAE/GCC, and Europe.

Target Service Pillar for this article: ${chosenPillar.pillar} (${chosenPillar.focus})

Existing WebziFire Services:
${serviceCatalog}

${seoOpportunityContext}

Existing article titles we MUST NOT duplicate or closely overlap:
${titles.map((t) => `- ${t}`).join("\n")}

STRICT ANTI-KEYWORD CANNIBALIZATION GUARD:
Existing primary keywords already targeted across WebziFire articles:
${existingKeywordsList || "(No prior keywords recorded)"}
DO NOT target, duplicate, or cannibalize any of the above keywords! You MUST select a completely fresh, distinct long-tail commercial or technical keyword angle.

Task:
1. Research current high-intent technical and commercial topics that international founders, CTOs, and operations leaders actively search for related to "${chosenPillar.pillar}" in 2026.
2. Examine competing articles currently ranking for this angle and identify 4–5 concrete gaps they miss (e.g., real architecture trade-offs, PostgreSQL/MySQL/Supabase data modeling, total cost of ownership, security/compliance, realistic implementation phases).
3. Recommend ONE sharp, authoritative, non-duplicate article topic with a fresh primary keyword that does NOT cannibalize our existing content, 5–7 semantically related secondary keywords, search intent, target SEO title, meta description, and 6–7 key outline sections.

CRITICAL RULES:
- NEVER invent, guess, or estimate monthly search volumes, keyword difficulty numbers, CPCs, or fake percentages.
- Base competitor gaps on real content patterns found in live search results.
- Focus on practical engineering authority that converts international B2B decision-makers.
`;

  const grounded = await callGeminiGroundedSearch({
    prompt: researchPrompt,
    jobType: "research_topic",
  });

  // Stage 1B: Extract clean structured SEO Brief JSON from the grounded research
  const structurePrompt = `
Convert the following grounded SEO research into a strict JSON object.
Do NOT invent any search volume numbers, keyword difficulty metrics, or unverified statistics.

Grounded Research Notes:
${grounded.text}

Verified Sources Found:
${JSON.stringify(grounded.sources)}

Existing Slugs (your suggestedSlug MUST NOT match any of these):
${JSON.stringify(slugs)}

Existing Primary Keywords (DO NOT TARGET THESE):
${existingTargetKeywords.map((k) => k.primaryKeyword).slice(0, 30).join(", ")}

Return ONLY valid JSON with this exact schema:
{
  "topicTitle": "Compelling editorial H1 title (55-75 chars)",
  "servicePillar": "${chosenPillar.pillar}",
  "category": "${chosenPillar.category}",
  "targetRegion": "International (US, UK, UAE/GCC, Europe)",
  "primaryKeyword": "exact primary target keyword phrase (unique, non-cannibalizing)",
  "secondaryKeywords": ["5 to 7 natural semantic keywords"],
  "searchIntent": "commercial_informational | commercial_investigation | technical_evaluation",
  "competitorGaps": ["4 to 5 specific missing details in competing articles"],
  "suggestedSlug": "clean-kebab-case-slug-under-65-chars",
  "seoMetaTitle": "50 to 60 char SEO title tag",
  "seoMetaDescription": "140 to 158 char compelling meta description with primary keyword",
  "outlinePoints": ["6 to 7 structured H2 section titles covering the competitor gaps"]
}
`;

  const { data: structured } = await callGeminiStructuredJson<{
    topicTitle: string;
    servicePillar: string;
    category: string;
    targetRegion: string;
    primaryKeyword: string;
    secondaryKeywords: string[];
    searchIntent: string;
    competitorGaps: string[];
    suggestedSlug: string;
    seoMetaTitle: string;
    seoMetaDescription: string;
    outlinePoints: string[];
  }>({
    prompt: structurePrompt,
    jobType: "research_topic",
    preferPro: false,
    temperature: 0.25,
    maxOutputTokens: 2500,
  });

  // Step 1C: Programmatic Keyword Cannibalization Verification
  let candidateKeyword = structured.primaryKeyword;
  let cannibalizationCheck: CannibalizationCheckResult = checkKeywordCannibalization(
    candidateKeyword,
    existingTargetKeywords
  );

  // If cannibalization is detected, adjust the primary keyword to differentiate the topic
  if (cannibalizationCheck.isCannibalized && cannibalizationCheck.conflictingArticle) {
    console.warn(
      `[ResearchTopic] Cannibalization detected for "${candidateKeyword}" against "${cannibalizationCheck.conflictingArticle.title}". Adjusting angle.`
    );
    // Append architectural / industry differentiator based on service pillar
    candidateKeyword = `${candidateKeyword} ${chosenPillar.category.toLowerCase().split(" ")[0]}`.trim();
    cannibalizationCheck = checkKeywordCannibalization(
      candidateKeyword,
      existingTargetKeywords
    );
  }

  // Ensure slug uniqueness deterministically
  let cleanSlug = slugify(structured.suggestedSlug || structured.topicTitle);
  const existingSlugSet = new Set(slugs);
  if (existingSlugSet.has(cleanSlug)) {
    cleanSlug = `${cleanSlug}-${new Date().getFullYear()}`;
  }
  if (existingSlugSet.has(cleanSlug)) {
    cleanSlug = `${cleanSlug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const fingerprint = normalizeFingerprint(structured.topicTitle) || cleanSlug;

  // Persist into topic_research_queue with cannibalization check metadata
  const { data: insertedTopic, error } = await admin
    .from("topic_research_queue")
    .upsert(
      {
        topic_title: structured.topicTitle,
        normalized_fingerprint: fingerprint,
        service_pillar: structured.servicePillar || chosenPillar.pillar,
        target_region: structured.targetRegion || "Global (US, UK, UAE, EU)",
        primary_keyword: candidateKeyword,
        secondary_keywords: structured.secondaryKeywords || [],
        search_intent: structured.searchIntent || "commercial_informational",
        competitor_gaps: structured.competitorGaps || [],
        research_sources: grounded.sources,
        suggested_slug: cleanSlug,
        seo_meta_title: structured.seoMetaTitle,
        seo_meta_description: structured.seoMetaDescription,
        status: "in_progress",
      },
      { onConflict: "normalized_fingerprint" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("[ResearchTopic] Failed storing topic_research_queue:", error.message);
  }

  return {
    topicId: insertedTopic?.id,
    topicTitle: structured.topicTitle,
    normalizedFingerprint: fingerprint,
    servicePillar: structured.servicePillar || chosenPillar.pillar,
    category: structured.category || chosenPillar.category,
    targetRegion: structured.targetRegion || "Global (US, UK, UAE, EU)",
    primaryKeyword: candidateKeyword,
    secondaryKeywords: structured.secondaryKeywords || [],
    searchIntent: structured.searchIntent || "commercial_informational",
    competitorGaps: structured.competitorGaps || [],
    researchSources: grounded.sources,
    suggestedSlug: cleanSlug,
    seoMetaTitle: structured.seoMetaTitle,
    seoMetaDescription: structured.seoMetaDescription,
    outlinePoints: structured.outlinePoints || [],
    cannibalizationCheck: {
      isCannibalized: cannibalizationCheck.isCannibalized,
      severity: cannibalizationCheck.severity,
      similarity: cannibalizationCheck.similarity,
      conflictingArticleTitle: cannibalizationCheck.conflictingArticle?.title,
      conflictingSlug: cannibalizationCheck.conflictingArticle?.slug,
      reason: cannibalizationCheck.reason,
      suggestions: cannibalizationCheck.suggestions,
    },
  };
}
