import { services } from "@/data/services";
import { getAllExistingSlugsAndTitles } from "@/lib/journals";
import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import {
  ArticleFaq,
  AutomationSettings,
  ContentBlock,
  InternalLinkItem,
  JournalArticleRecord,
  TopicResearchResult,
} from "@/lib/automation/types";

export interface GeneratedArticlePayload {
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  contentBlocks: ContentBlock[];
  faqs: ArticleFaq[];
  internalLinks: InternalLinkItem[];
  takeaway: string;
  ctaHeading: string;
  ctaDescription: string;
  imagePrompt: string;
  imageAlt: string;
}

export function countArticleWords(
  summary: string,
  blocks: ContentBlock[],
  faqs: ArticleFaq[],
  takeaway: string
): number {
  const parts: string[] = [summary, takeaway];
  for (const b of blocks || []) {
    if (b.title) parts.push(b.title);
    if (b.text) parts.push(b.text);
    if (Array.isArray(b.items)) parts.push(b.items.join(" "));
  }
  for (const f of faqs || []) {
    if (f.question) parts.push(f.question);
    if (f.answer) parts.push(f.answer);
  }
  return parts
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function getValidInternalRoutes(): Promise<string[]> {
  const { publishedSlugs } = await getAllExistingSlugsAndTitles();
  const staticRoutes = [
    "/services",
    "/work",
    "/about",
    "/blog",
    "/book",
    "/contact",
  ];
  const serviceRoutes = services.map((s) => `/services/${s.slug}`);
  const blogRoutes = publishedSlugs.map((slug) => `/blog/${slug}`);
  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}

/**
 * Step 3: Writes an original, 1,000–1,800 word SEO & AEO-optimized article
 * OR revises an existing draft based on Quality Gate instructions or Founder feedback.
 */
export async function runWriteOrReviseArticle(params: {
  topic?: TopicResearchResult;
  existingArticle?: JournalArticleRecord;
  settings: AutomationSettings;
  revisionInstructions?: string[];
  founderFeedback?: string;
  articleId?: string | null;
}): Promise<{ payload: GeneratedArticlePayload; wordCount: number; modelUsed: string }> {
  const validRoutes = await getValidInternalRoutes();
  const serviceDirectory = services
    .map((s) => `- ${s.title} -> /services/${s.slug}`)
    .join("\n");

  const isRevision = Boolean(params.existingArticle);
  const wordMin = params.settings.target_word_min || 1000;
  const wordMax = params.settings.target_word_max || 1800;

  const systemInstruction = `
You are ${params.settings.default_author}, ${params.settings.default_author_role} at WebziFire ("Igniting Ideas Through Technology").
You write authoritative, original, deeply practical technical & executive articles for international B2B decision-makers (US, UK, UAE/GCC, Europe).

Brand & Technical Truths:
- WebziFire builds custom websites, Next.js/React web apps, multi-tenant SaaS, custom ERP, POS, CRM, React Native mobile apps, headless e-commerce, and AI business automation.
- WebziFire is polyglot on databases: PostgreSQL, MySQL, Supabase, Prisma ORM, MongoDB Atlas, Redis, and pgvector — never frame us as MERN-only.
- Founded in 2023. Senior-led engineering pods, zero template bloat, full IP handover.

Strict Integrity & Readability Rules:
1. Target ${wordMin}–${wordMax} total words across the article body, examples, and FAQs. Never be thin or fluffy.
2. Readability & Tone: Write in clear, conversational, engaging plain English (aim for 8th–10th grade reading level, Flesch-Kincaid score ~65). Use short paragraphs, clear subheadings, and simple, natural sentence structures.
3. Clarity Over Complexity: Explain technical ideas using relatable, real-world analogies (e.g., comparing databases to well-organized filing cabinets, or API caching to keeping popular menu items ready in advance).
4. Strictly NO Academic Jargon or Buzzwords: Avoid pompous phrasing like "hyper-converged paradigm", "deterministic synthesis", "architectural bloat", "delve into", "in today's fast-paced digital landscape", "uncompromising rigor", or "testament to". Write so that ANY business owner, startup founder, or non-technical manager can read, understand, and enjoy the article effortlessly.
5. Honesty & Accuracy: NEVER invent fake keyword search volumes, fake analyst citations, or fabricated statistics. Use real software principles, concrete architecture walkthroughs, and realistic scenarios clearly labeled as examples.
6. ONLY use internal link URLs from the provided Valid Internal Routes list. NEVER invent a broken URL.
`;

  let prompt = "";

  if (isRevision && params.existingArticle) {
    const art = params.existingArticle;
    prompt = `
Revise the following WebziFire journal article draft while preserving its core topic and slug (${art.slug}).

${
  params.founderFeedback
    ? `HIGHEST PRIORITY — FOUNDER FEEDBACK TO IMPLEMENT:\n${params.founderFeedback}\n`
    : ""
}
${
  params.revisionInstructions && params.revisionInstructions.length > 0
    ? `AUTOMATED QUALITY CHECK FIXES REQUIRED:\n${params.revisionInstructions
        .map((r, i) => `${i + 1}. ${r}`)
        .join("\n")}\n`
    : ""
}

Current Draft Summary & SEO Metadata:
- Title: ${art.title}
- Primary Keyword: ${art.primary_keyword}
- Secondary Keywords: ${(art.secondary_keywords || []).join(", ")}
- Meta Title: ${art.meta_title}
- Meta Description: ${art.meta_description}
- Current Word Count: ${art.word_count}
- Current Content Blocks: ${JSON.stringify(art.content_blocks)}
- Current FAQs: ${JSON.stringify(art.faqs)}
- Current Internal Links: ${JSON.stringify(art.internal_links)}
- Current Image Alt: ${art.image_alt}

Valid Internal Routes you may link to:
${validRoutes.join("\n")}

Return the complete revised article as strict JSON matching the schema below. Ensure total word count is strictly between ${wordMin} and ${wordMax} words.
`;
  } else if (params.topic) {
    const t = params.topic;
    prompt = `
Write a comprehensive, original, high-authority article based on this grounded SEO research brief:

- Topic Title: ${t.topicTitle}
- Service Pillar: ${t.servicePillar}
- Category: ${t.category}
- Target Audience: ${t.targetRegion} CTOs, Founders, Operations & Product Leaders
- Primary Keyword: ${t.primaryKeyword}
- Secondary Keywords: ${t.secondaryKeywords.join(", ")}
- Search Intent: ${t.searchIntent}
- Suggested Meta Title: ${t.seoMetaTitle}
- Suggested Meta Description: ${t.seoMetaDescription}
- Competitor Gaps to Address Thoroughly:
${t.competitorGaps.map((g) => `  • ${g}`).join("\n")}
- Recommended Outline:
${t.outlinePoints.map((o) => `  • ${o}`).join("\n")}
- Grounded Research Sources:
${t.researchSources.map((s) => `  • ${s.title} (${s.url})`).join("\n")}

WebziFire Service Routes for Natural Internal Linking:
${serviceDirectory}

All Valid Internal Routes (ONLY link to routes in this exact list):
${validRoutes.join("\n")}

Requirements:
- Write ${wordMin}–${wordMax} words total (rich depth, clear architectural reasoning, real-world implementation examples, trade-offs, and decision matrices).
- Include at least 5 H2 headings, helpful H3 subheadings, at least 2 concrete real-world examples (block type "example"), bulleted technical takeaways (block type "list"), and 4–5 insightful FAQs answering real buyer questions.
- Include 3–5 relevant internal links pointing ONLY to exact URLs from the Valid Internal Routes list above (including at least 1 relevant /services/... page and /book or /contact).
- Write a compelling custom Architectural Takeaway and WebziFire CTA aligned with the article topic.
- Write a vivid, no-text art-direction prompt for the 16:9 dark obsidian-crimson featured image plus a concise, descriptive SEO imageAlt (40–120 chars).
`;
  } else {
    throw new Error("Either topic or existingArticle is required to write/revise an article.");
  }

  prompt += `
Return ONLY valid JSON with this exact schema:
{
  "title": "Editorial H1 headline (50-78 chars)",
  "summary": "2-sentence executive summary hook (180-320 chars)",
  "metaTitle": "SEO title tag (48-64 chars, includes primary keyword)",
  "metaDescription": "Compelling meta description (135-158 chars, includes primary keyword)",
  "readTime": "X min read",
  "contentBlocks": [
    { "type": "heading2", "text": "Section Heading" },
    { "type": "paragraph", "text": "Detailed substantive paragraph..." },
    { "type": "heading3", "text": "Sub-section Heading" },
    { "type": "example", "title": "Real-World Architecture Example: ...", "text": "Concrete scenario showing architecture decisions and outcomes..." },
    { "type": "list", "title": "Key Engineering Criteria", "items": ["Point 1...", "Point 2..."] },
    { "type": "callout", "title": "Production Trade-Off", "text": "Sharp practical insight..." }
  ],
  "faqs": [
    { "question": "Practical buyer or technical question?", "answer": "Clear, substantive 2-4 sentence answer." }
  ],
  "internalLinks": [
    { "anchor": "descriptive anchor text", "href": "/services/exact-valid-slug", "context": "short 1-sentence link recommendation" }
  ],
  "takeaway": "2-3 sentence architectural takeaway paragraph",
  "ctaHeading": "Short relevant call-to-action heading",
  "ctaDescription": "1-sentence invitation to scope this solution with WebziFire",
  "imagePrompt": "Editorial 3D architectural visualization prompt describing abstract technology metaphor for this topic, dark obsidian background with subtle crimson and warm champagne lighting, NO text or letters",
  "imageAlt": "Descriptive SEO alt text for the featured image (45-120 chars)"
}
`;

  const { data: payload, modelUsed } = await callGeminiStructuredJson<GeneratedArticlePayload>({
    prompt,
    systemInstruction,
    jobType: isRevision ? "revise_article" : "write_article",
    articleId: params.articleId,
    preferPro: true,
    temperature: 0.5,
    maxOutputTokens: 8192,
  });

  const wordCount = countArticleWords(
    payload.summary || "",
    payload.contentBlocks || [],
    payload.faqs || [],
    payload.takeaway || ""
  );

  // Recalculate accurate read time (~220 wpm)
  const mins = Math.max(4, Math.round(wordCount / 220));
  payload.readTime = `${mins} min read`;

  return { payload, wordCount, modelUsed };
}
