import { articles as staticArticles, Article as StaticArticle } from "@/data/articles";
import { getSupabaseAdmin, getSupabasePublic, isSupabaseAdminConfigured } from "@/lib/supabase";
import {
  JournalArticleRecord,
  UnifiedJournalArticle,
} from "@/lib/automation/types";

function mapStaticArticle(art: StaticArticle): UnifiedJournalArticle {
  return {
    id: art.id,
    slug: art.slug,
    title: art.title,
    category: art.category,
    readTime: art.readTime,
    date: art.date,
    summary: art.summary,
    metaTitle: `${art.title} | WebziFire Engineering Journal`,
    metaDescription: art.summary,
    keywords: [art.category, "WebziFire", "Enterprise Software"],
    author: art.author,
    authorRole: art.authorRole,
    image: art.image,
    imageAlt: art.title,
    content: art.content,
    status: "published",
    source: "static",
  };
}

function mapSupabaseArticle(
  row: JournalArticleRecord,
  options?: { isPreview?: boolean; previewToken?: string }
): UnifiedJournalArticle {
  const blocks = Array.isArray(row.content_blocks) ? row.content_blocks : [];
  const plainParagraphs = blocks
    .filter((b) => b.type === "paragraph" && b.text)
    .map((b) => b.text!);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    readTime: row.read_time || "7 min read",
    date: row.date_label,
    summary: row.summary,
    metaTitle: row.meta_title || `${row.title} | WebziFire Engineering Journal`,
    metaDescription: row.meta_description || row.summary,
    keywords: [
      row.primary_keyword,
      ...(Array.isArray(row.secondary_keywords) ? row.secondary_keywords : []),
    ].filter(Boolean),
    author: row.author || "Hammad Khan",
    authorRole: row.author_role || "Founder & Principal Software Architect",
    image:
      row.image_url ||
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    imageAlt: row.image_alt || row.title,
    content: plainParagraphs,
    contentBlocks: blocks,
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    internalLinks: Array.isArray(row.internal_links) ? row.internal_links : [],
    takeaway: row.takeaway || "",
    ctaHeading: row.cta_heading || "Ready to engineer your digital platform?",
    ctaDescription:
      row.cta_description ||
      "Schedule an architectural scoping session with our principal team.",
    publishedAt: row.published_at,
    status: row.status,
    isPreview: options?.isPreview || false,
    previewToken: options?.previewToken,
    source: "supabase",
  };
}

/**
 * Returns all published journal articles: live Supabase rows (newest first)
 * merged with static evergreen articles (deduplicated by slug).
 */
export async function getPublishedJournals(): Promise<UnifiedJournalArticle[]> {
  const fallback = staticArticles.map(mapStaticArticle);

  const client = getSupabasePublic();
  if (!client) {
    return fallback;
  }

  try {
    const { data, error } = await client
      .from("journal_articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error || !data) {
      console.error("[Journals] Failed to load published Supabase rows:", error?.message);
      return fallback;
    }

    const dbArticles = (data as JournalArticleRecord[]).map((r) =>
      mapSupabaseArticle(r)
    );
    const seenSlugs = new Set(dbArticles.map((a) => a.slug));
    const merged = [
      ...dbArticles,
      ...fallback.filter((s) => !seenSlugs.has(s.slug)),
    ];
    return merged;
  } catch (err) {
    console.error("[Journals] Unexpected error loading journals:", err);
    return fallback;
  }
}

/**
 * Fetches a single published article by slug, or — when a valid previewToken
 * is supplied from an approval email — returns the pending/draft article for live preview.
 */
export async function getJournalBySlug(
  slug: string,
  previewToken?: string
): Promise<UnifiedJournalArticle | null> {
  // 1. If a preview token is provided, verify via privileged admin client
  if (previewToken && isSupabaseAdminConfigured()) {
    try {
      const admin = getSupabaseAdmin();
      const { data } = await admin
        .from("journal_articles")
        .select("*")
        .eq("slug", slug)
        .eq("approval_token", previewToken)
        .maybeSingle();

      if (data) {
        const row = data as JournalArticleRecord;
        const isExpired =
          row.token_expires_at && new Date(row.token_expires_at).getTime() < Date.now();
        if (!isExpired || row.status === "published") {
          return mapSupabaseArticle(row, {
            isPreview: row.status !== "published",
            previewToken,
          });
        }
      }
    } catch (err) {
      console.error("[Journals] Preview lookup error:", err);
    }
  }

  // 2. Check published Supabase articles
  const client = getSupabasePublic();
  if (client) {
    try {
      const { data } = await client
        .from("journal_articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (data) {
        return mapSupabaseArticle(data as JournalArticleRecord);
      }
    } catch (err) {
      console.error("[Journals] Single slug lookup error:", err);
    }
  }

  // 3. Fallback to static articles
  const staticFound = staticArticles.find((a) => a.slug === slug);
  return staticFound ? mapStaticArticle(staticFound) : null;
}

/**
 * Returns all existing slugs & titles (static + all non-failed Supabase rows including rejected/pending)
 * so the AI topic researcher never creates duplicate topics or colliding slugs.
 */
export async function getAllExistingSlugsAndTitles(): Promise<{
  slugs: string[];
  titles: string[];
  publishedSlugs: string[];
}> {
  const staticSlugs = staticArticles.map((a) => a.slug);
  const staticTitles = staticArticles.map((a) => a.title);

  if (!isSupabaseAdminConfigured()) {
    return {
      slugs: staticSlugs,
      titles: staticTitles,
      publishedSlugs: staticSlugs,
    };
  }

  try {
    const admin = getSupabaseAdmin();
    const [{ data: articleRows }, { data: topicRows }] = await Promise.all([
      admin.from("journal_articles").select("slug, title, status"),
      admin.from("topic_research_queue").select("suggested_slug, topic_title"),
    ]);

    const slugs = new Set<string>(staticSlugs);
    const titles = new Set<string>(staticTitles);
    const publishedSlugs = new Set<string>(staticSlugs);

    for (const row of articleRows || []) {
      if (row.slug) slugs.add(row.slug);
      if (row.title) titles.add(row.title);
      if (row.status === "published" && row.slug) publishedSlugs.add(row.slug);
    }

    for (const row of topicRows || []) {
      if (row.suggested_slug) slugs.add(row.suggested_slug);
      if (row.topic_title) titles.add(row.topic_title);
    }

    return {
      slugs: Array.from(slugs),
      titles: Array.from(titles),
      publishedSlugs: Array.from(publishedSlugs),
    };
  } catch (err) {
    console.error("[Journals] Deduplication lookup error:", err);
    return {
      slugs: staticSlugs,
      titles: staticTitles,
      publishedSlugs: staticSlugs,
    };
  }
}
