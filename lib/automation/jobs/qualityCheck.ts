import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { getValidInternalRoutes } from "@/lib/automation/jobs/writeArticle";
import { runFactAndSourceVerification } from "@/lib/automation/jobs/factVerification";
import {
  AutomationSettings,
  JournalArticleRecord,
  QualityCheckItem,
  QualityReport,
} from "@/lib/automation/types";

const INVENTED_KEYWORD_STAT_PATTERNS = [
  /\b\d{1,3}(?:,\d{3})+\s+(?:monthly\s+)?searches\b/i,
  /\bsearch\s+volume\s+of\s+\d/i,
  /\bkeyword\s+difficulty\s+(?:score\s+)?of\s+\d/i,
  /\bCPC\s+of\s+\$\d/i,
];

/**
 * Step 5: Comprehensive Automated Quality Check.
 * Runs deterministic programmatic checks + an independent Gemini editorial/SEO audit.
 * Returns pass/fail + specific revision instructions if anything needs fixing.
 */
export async function runQualityCheck(params: {
  article: JournalArticleRecord;
  settings: AutomationSettings;
}): Promise<QualityReport> {
  const { article, settings } = params;
  const checks: QualityCheckItem[] = [];
  const revisionInstructions: string[] = [];

  const blocks = Array.isArray(article.content_blocks) ? article.content_blocks : [];
  const faqs = Array.isArray(article.faqs) ? article.faqs : [];
  const internalLinks = Array.isArray(article.internal_links) ? article.internal_links : [];

  const fullText = [
    article.title,
    article.summary,
    ...blocks.map((b) => [b.title || "", b.text || "", ...(b.items || [])].join(" ")),
    ...faqs.map((f) => `${f.question} ${f.answer}`),
    article.takeaway || "",
  ].join("\n");

  // 1. Word Count Check
  const minWords = Math.max(950, (settings.target_word_min || 1000) - 50);
  const maxWords = Math.min(2100, (settings.target_word_max || 1800) + 250);
  const wordCountOk = article.word_count >= minWords && article.word_count <= maxWords;
  checks.push({
    name: "Target Length (1,000–1,800 words)",
    passed: wordCountOk,
    details: `${article.word_count} words (target ${settings.target_word_min}–${settings.target_word_max})`,
  });
  if (!wordCountOk) {
    revisionInstructions.push(
      article.word_count < minWords
        ? `Expand the article depth with concrete architecture examples and implementation details so total word count is between ${settings.target_word_min} and ${settings.target_word_max} words (currently ${article.word_count}).`
        : `Tighten repetitive sections so total word count stays within ${settings.target_word_min}–${settings.target_word_max} words (currently ${article.word_count}).`
    );
  }

  // 2. Headings & Structure Check
  const h2Count = blocks.filter((b) => b.type === "heading2").length;
  const hasExample = blocks.some((b) => b.type === "example");
  const structureOk = h2Count >= 4 && hasExample;
  checks.push({
    name: "SEO Heading Hierarchy & Examples",
    passed: structureOk,
    details: `${h2Count} H2 headings, concrete examples: ${hasExample ? "Yes" : "Missing"}`,
  });
  if (!structureOk) {
    revisionInstructions.push(
      "Ensure the article includes at least 5 H2 headings and at least 2 concrete real-world architecture example blocks (type: 'example')."
    );
  }

  // 3. FAQ Section Check
  const faqOk = faqs.length >= 3;
  checks.push({
    name: "Structured FAQ Section",
    passed: faqOk,
    details: `${faqs.length} FAQs included for AEO & FAQPage schema`,
  });
  if (!faqOk) {
    revisionInstructions.push("Include at least 4 practical buyer/technical FAQs.");
  }

  // 4. Internal Links Verification (against live valid routes)
  const validRoutes = new Set(await getValidInternalRoutes());
  const validLinks = internalLinks.filter((l) => l.href && validRoutes.has(l.href));
  const invalidLinks = internalLinks
    .filter((l) => !l.href || !validRoutes.has(l.href))
    .map((l) => l.href || "(empty)");
  const linksOk = validLinks.length >= 2 && invalidLinks.length === 0;
  checks.push({
    name: "Verified Internal Links",
    passed: linksOk,
    details:
      invalidLinks.length === 0
        ? `${validLinks.length} valid WebziFire internal links`
        : `${validLinks.length} valid, ${invalidLinks.length} invalid (${invalidLinks.join(", ")})`,
  });
  if (!linksOk) {
    revisionInstructions.push(
      `Fix internal links: remove invalid URLs (${invalidLinks.join(", ") || "none"}) and include 3–5 links strictly from the valid WebziFire routes list.`
    );
  }

  // 5. Metadata & Keyword Placement Check
  const metaTitleLen = (article.meta_title || "").trim().length;
  const metaDescLen = (article.meta_description || "").trim().length;
  const primaryKwLower = (article.primary_keyword || "").toLowerCase();
  const hasPrimaryKwInBody =
    !primaryKwLower || fullText.toLowerCase().includes(primaryKwLower);
  const metaOk =
    metaTitleLen >= 35 &&
    metaTitleLen <= 72 &&
    metaDescLen >= 115 &&
    metaDescLen <= 170 &&
    hasPrimaryKwInBody;
  checks.push({
    name: "SEO Metadata & Primary Keyword",
    passed: metaOk,
    details: `Meta title: ${metaTitleLen} chars, Meta desc: ${metaDescLen} chars, Keyword present: ${
      hasPrimaryKwInBody ? "Yes" : "No"
    }`,
  });
  if (!metaOk) {
    revisionInstructions.push(
      `Optimize SEO metadata: metaTitle must be 48–64 chars (currently ${metaTitleLen}), metaDescription must be 135–158 chars (currently ${metaDescLen}), and naturally include primary keyword "${article.primary_keyword}" in the article.`
    );
  }

  // 6. Featured Image & Alt Text Check
  const hasFeaturedImage = Boolean(
    article.image_url && article.image_url.startsWith("http")
  );
  const altLen = (article.image_alt || "").trim().length;
  const hasAltText = altLen >= 20 && altLen <= 160;
  const imageOk = hasFeaturedImage && hasAltText;
  checks.push({
    name: "Featured Image & Alt Text",
    passed: imageOk,
    details: hasFeaturedImage
      ? `Permanent image hosted, alt text ${altLen} chars`
      : "Featured image missing",
  });
  if (!hasAltText) {
    revisionInstructions.push(
      `Write a concise, descriptive SEO imageAlt between 40 and 120 characters (currently ${altLen}).`
    );
  }

  // 7. No Invented Keyword Statistics Guard
  const hasInventedStats = INVENTED_KEYWORD_STAT_PATTERNS.some((re) =>
    re.test(fullText)
  );
  checks.push({
    name: "No Fabricated Keyword Metrics",
    passed: !hasInventedStats,
    details: hasInventedStats
      ? "Detected potential invented search volume / keyword difficulty statistic"
      : "Clean — zero invented keyword statistics",
  });
  if (hasInventedStats) {
    revisionInstructions.push(
      "Remove any invented monthly search volume, keyword difficulty, or unverified CPC/percentage figures."
    );
  }

  // 8. Capability 2: Source & Technical Fact Verification
  const factReport = await runFactAndSourceVerification({
    title: article.title,
    summary: article.summary,
    contentBlocks: blocks,
    internalLinks,
    researchSources: article.research_sources,
    articleId: article.id,
  });

  checks.push({
    name: "Source & Technical Fact Verification",
    passed: factReport.overallPassed,
    details: factReport.overallPassed
      ? `Factual score: ${factReport.factualScore}/100 — no fabricated claims`
      : `Flagged ${factReport.violations.length} factual/source violations`,
  });

  if (!factReport.overallPassed) {
    for (const v of factReport.violations) {
      revisionInstructions.push(`${v.reason} (${v.suggestedFix})`);
    }
  }

  // 9. Independent Gemini Editorial, Originality, Accuracy & Readability Critic
  const auditPrompt = `
You are a strict Senior Technical Editor and SEO Quality Auditor for WebziFire.
Evaluate this draft article rigorously before it is emailed to the founder for approval.

Article Title: ${article.title}
Primary Keyword: ${article.primary_keyword}
Secondary Keywords: ${(article.secondary_keywords || []).join(", ")}
Grounded Research Sources: ${JSON.stringify(article.research_sources || [])}
Competitor Gaps Intended to Cover: ${JSON.stringify(article.competitor_gaps || [])}
Summary: ${article.summary}
Content Blocks: ${JSON.stringify(blocks)}
FAQs: ${JSON.stringify(faqs)}
Takeaway: ${article.takeaway}
CTA: ${article.cta_heading} — ${article.cta_description}

Evaluate across:
1. Originality & depth (no generic AI cliches or fluff)
2. Technical & factual accuracy (no fabricated studies, accurate software architecture claims)
3. Grammar, conversational clarity, and plain-English readability (accessible to any business owner; penalize dense academic jargon or robotic filler)
4. Relevance to international B2B clients looking for WebziFire services
5. Natural CTA & SEO structure

Return ONLY valid JSON:
{
  "editorialScore": 0-100,
  "originalityPassed": true/false,
  "accuracyPassed": true/false,
  "readabilityPassed": true/false,
  "editorSummary": "2-sentence concise quality verdict for the founder's email report",
  "issues": ["list of concrete issues to fix, or empty array if strong"]
}
`;

  const { data: critic } = await callGeminiStructuredJson<{
    editorialScore: number;
    originalityPassed: boolean;
    accuracyPassed: boolean;
    readabilityPassed: boolean;
    editorSummary: string;
    issues: string[];
  }>({
    prompt: auditPrompt,
    jobType: "quality_check",
    articleId: article.id,
    preferPro: false,
    temperature: 0.2,
    maxOutputTokens: 1500,
  });

  checks.push({
    name: "Originality & Anti-Fluff Audit",
    passed: Boolean(critic.originalityPassed),
    details: critic.originalityPassed ? "Original, technical B2B voice" : "Needs deeper specificity",
  });
  checks.push({
    name: "Research Accuracy & Sources",
    passed: Boolean(critic.accuracyPassed),
    details: critic.accuracyPassed
      ? `${(article.research_sources || []).length} grounded sources verified`
      : "Accuracy concerns flagged",
  });
  checks.push({
    name: "Grammar & Executive Readability",
    passed: Boolean(critic.readabilityPassed),
    details: critic.readabilityPassed ? "Crisp, publication-ready prose" : "Readability edits needed",
  });

  if (Array.isArray(critic.issues) && critic.issues.length > 0 && critic.editorialScore < (settings.min_quality_score || 85)) {
    revisionInstructions.push(...critic.issues);
  }

  // Compute composite score combining deterministic pass ratio + Gemini critic score + fact verification score
  const hardChecksPassedCount = checks.filter((c) => c.passed).length;
  const deterministicScore = Math.round((hardChecksPassedCount / checks.length) * 100);
  const overallScore = Math.round(
    deterministicScore * 0.35 +
    Number(critic.editorialScore || 80) * 0.35 +
    Number(factReport.factualScore || 85) * 0.30
  );

  const minScore = settings.min_quality_score || 85;
  const criticalHardFail =
    !wordCountOk ||
    !hasFeaturedImage ||
    !linksOk ||
    hasInventedStats ||
    !faqOk ||
    !factReport.overallPassed;

  const passed = overallScore >= minScore && !criticalHardFail;

  return {
    overallScore,
    passed,
    wordCount: article.word_count,
    headingCount: h2Count,
    faqCount: faqs.length,
    validInternalLinks: validLinks.length,
    invalidInternalLinks: invalidLinks,
    hasAltText,
    hasFeaturedImage,
    hasInventedStats,
    factVerificationPassed: factReport.overallPassed,
    factualScore: factReport.factualScore,
    factViolations: factReport.violations.map((v) => ({
      category: v.category,
      claimText: v.claimText,
      reason: v.reason,
    })),
    checks,
    editorSummary:
      critic.editorSummary ||
      factReport.summary ||
      "Automated SEO, structural, fact, and editorial review completed.",
    revisionInstructions: passed ? [] : revisionInstructions,
    checkedAt: new Date().toISOString(),
  };
}
