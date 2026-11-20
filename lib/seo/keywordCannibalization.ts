import { articles as staticArticles } from "@/data/articles";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

export interface TargetedKeywordItem {
  id?: string;
  slug: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  servicePillar?: string;
  status?: string;
  source: "supabase_article" | "static_article" | "research_queue";
}

export interface CannibalizationCheckResult {
  isCannibalized: boolean;
  severity: "none" | "low" | "medium" | "high";
  candidateKeyword: string;
  conflictingArticle?: TargetedKeywordItem;
  similarity: number;
  reason?: string;
  suggestions: string[];
}

/**
 * Normalizes keyword tokens for semantic similarity comparison:
 * lowercases, removes non-alphanumeric chars, filters stop words.
 */
export function normalizeKeywordTokens(text: string): string[] {
  const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
    "by", "about", "against", "between", "into", "through", "during",
    "before", "after", "above", "below", "from", "up", "down", "of",
    "how", "why", "what", "which", "who", "whom", "this", "that", "these",
    "those", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "guide", "blueprint",
    "best", "top", "practices", "scaling", "architecture", "overview",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Computes Jaccard token similarity between two keywords (0.0 to 1.0).
 */
export function computeKeywordSimilarity(kw1: string, kw2: string): number {
  const norm1 = kw1.toLowerCase().trim();
  const norm2 = kw2.toLowerCase().trim();

  // Exact match
  if (norm1 === norm2) return 1.0;

  // Substring containment (e.g. "custom crm" inside "custom crm development")
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const shorter = Math.min(norm1.length, norm2.length);
    const longer = Math.max(norm1.length, norm2.length);
    if (shorter / longer > 0.65) return 0.9;
  }

  const tokens1 = normalizeKeywordTokens(kw1);
  const tokens2 = normalizeKeywordTokens(kw2);
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach((t) => {
    if (set2.has(t)) intersection++;
  });

  const union = new Set(tokens1.concat(tokens2)).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Fetches all targeted keywords currently reserved or published across:
 * 1. Supabase journal_articles (published, drafting, pending_approval, revision_requested)
 * 2. Static evergreen articles (data/articles.ts)
 * 3. Topic research queue (queued or in_progress topics)
 */
export async function getAllExistingTargetKeywords(): Promise<TargetedKeywordItem[]> {
  const items: TargetedKeywordItem[] = [];

  // 1. Static evergreen articles
  for (const sa of staticArticles) {
    items.push({
      slug: sa.slug,
      title: sa.title,
      primaryKeyword: sa.title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").slice(0, 50).trim(),
      secondaryKeywords: [sa.category.toLowerCase(), "enterprise software"],
      servicePillar: sa.category,
      status: "published",
      source: "static_article",
    });
  }

  if (!isSupabaseAdminConfigured()) {
    return items;
  }

  try {
    const admin = getSupabaseAdmin();

    const [{ data: articles }, { data: queue }] = await Promise.all([
      (admin as any)
        .from("journal_articles")
        .select("id, slug, title, primary_keyword, secondary_keywords, service_pillar, status"),
      (admin as any)
        .from("topic_research_queue")
        .select("id, suggested_slug, topic_title, primary_keyword, secondary_keywords, service_pillar, status")
        .in("status", ["queued", "in_progress"]),
    ]);

    for (const a of articles || []) {
      if (a.primary_keyword) {
        items.push({
          id: a.id,
          slug: a.slug,
          title: a.title,
          primaryKeyword: a.primary_keyword,
          secondaryKeywords: Array.isArray(a.secondary_keywords) ? a.secondary_keywords : [],
          servicePillar: a.service_pillar,
          status: a.status,
          source: "supabase_article",
        });
      }
    }

    for (const q of queue || []) {
      if (q.primary_keyword) {
        items.push({
          id: q.id,
          slug: q.suggested_slug,
          title: q.topic_title,
          primaryKeyword: q.primary_keyword,
          secondaryKeywords: Array.isArray(q.secondary_keywords) ? q.secondary_keywords : [],
          servicePillar: q.service_pillar,
          status: q.status,
          source: "research_queue",
        });
      }
    }
  } catch (err) {
    console.error("[KeywordCannibalization] Failed loading existing keywords:", err);
  }

  return items;
}

/**
 * Checks a candidate keyword against all existing WebziFire targeted keywords.
 * Returns cannibalization diagnosis and recommendations to avoid competing with oneself.
 */
export function checkKeywordCannibalization(
  candidateKeyword: string,
  existingKeywords: TargetedKeywordItem[],
  currentSlugToExclude?: string
): CannibalizationCheckResult {
  const cleanCandidate = (candidateKeyword || "").trim();
  if (!cleanCandidate) {
    return {
      isCannibalized: false,
      severity: "none",
      candidateKeyword: "",
      similarity: 0,
      suggestions: [],
    };
  }

  let highestSimilarity = 0;
  let mostConflictingArticle: TargetedKeywordItem | undefined;

  for (const existing of existingKeywords) {
    if (currentSlugToExclude && existing.slug === currentSlugToExclude) {
      continue;
    }

    // Check against primary keyword
    const simPrimary = computeKeywordSimilarity(cleanCandidate, existing.primaryKeyword);
    if (simPrimary > highestSimilarity) {
      highestSimilarity = simPrimary;
      mostConflictingArticle = existing;
    }

    // Check against secondary keywords
    for (const sec of existing.secondaryKeywords || []) {
      const simSec = computeKeywordSimilarity(cleanCandidate, sec);
      if (simSec * 0.9 > highestSimilarity) {
        highestSimilarity = simSec * 0.9;
        mostConflictingArticle = existing;
      }
    }
  }

  highestSimilarity = Number(highestSimilarity.toFixed(2));

  // Determine severity threshold
  if (highestSimilarity >= 0.75) {
    return {
      isCannibalized: true,
      severity: "high",
      candidateKeyword: cleanCandidate,
      conflictingArticle: mostConflictingArticle,
      similarity: highestSimilarity,
      reason: `High risk of keyword cannibalization with "${mostConflictingArticle?.title}" (/blog/${mostConflictingArticle?.slug}) which already targets "${mostConflictingArticle?.primaryKeyword}".`,
      suggestions: [
        `Target a more specific long-tail buyer question (e.g. add industry or technical constraint).`,
        `Focus on comparison or implementation trade-offs instead of broad introductory definitions.`,
        `Update and expand the existing article (${mostConflictingArticle?.slug}) rather than publishing a competing post.`,
      ],
    };
  }

  if (highestSimilarity >= 0.5) {
    return {
      isCannibalized: false,
      severity: "medium",
      candidateKeyword: cleanCandidate,
      conflictingArticle: mostConflictingArticle,
      similarity: highestSimilarity,
      reason: `Moderate thematic overlap with "${mostConflictingArticle?.title}" (/blog/${mostConflictingArticle?.slug}). Acceptable if search intent is differentiated.`,
      suggestions: [
        `Ensure H2 headings focus on a distinct use-case not covered in /blog/${mostConflictingArticle?.slug}.`,
        `Cross-link between the two articles to pass topical authority.`,
      ],
    };
  }

  return {
    isCannibalized: false,
    severity: "none",
    candidateKeyword: cleanCandidate,
    similarity: highestSimilarity,
    suggestions: ["Keyword is unique and ready for topic targeting."],
  };
}
