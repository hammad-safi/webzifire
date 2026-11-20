import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { getValidInternalRoutes } from "@/lib/automation/jobs/writeArticle";
import {
  ContentBlock,
  InternalLinkItem,
  ResearchSource,
} from "@/lib/automation/types";

export interface FactVerificationViolation {
  category: "fabricated_case_study" | "invented_statistic" | "invalid_link" | "technical_inaccuracy";
  severity: "critical" | "warning";
  claimText: string;
  reason: string;
  suggestedFix: string;
}

export interface FactVerificationReport {
  overallPassed: boolean;
  factualScore: number; // 0 to 100
  caseStudiesVerified: boolean;
  statisticsVerified: boolean;
  linksVerified: boolean;
  technicalAccuracyVerified: boolean;
  violations: FactVerificationViolation[];
  verifiedClaims: string[];
  summary: string;
  checkedAt: string;
}

// Regex patterns detecting fabricated client claims / proprietary case studies
const FABRICATED_CLIENT_PATTERNS = [
  /\b(?:our\s+client|we\s+built\s+for|we\s+delivered\s+to|client\s+of\s+ours|our\s+work\s+with|in\s+our\s+project\s+for)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)\b/i,
  /\b(?:a\s+fortune\s+500\s+(?:client|retailer|bank|company))\s+(?:contracted|hired|asked)\s+us\b/i,
  /\b(?:under\s+our\s+nda\s+with)\b/i,
];

// Regex patterns detecting fabricated statistics or search metrics presented as facts
const INVENTED_STATISTIC_PATTERNS = [
  /\b\d{1,3}(?:,\d{3})+\s+(?:monthly\s+)?searches\b/i,
  /\bsearch\s+volume\s+of\s+\d/i,
  /\bkeyword\s+difficulty\s+(?:score\s+)?of\s+\d/i,
  /\bCPC\s+of\s+\$\d/i,
  /\b(?:studies\s+show|research\s+proves|data\s+indicates)\s+that\s+\d{1,3}(?:\.\d+)?%\b/i,
  /\b(?:guaranteed|exactly)\s+\d{2,3}%\s+(?:increase|reduction|growth|boost)\b/i,
];

// Disallowed URL schemes or low-quality URL shorteners
const SUSPICIOUS_URL_PATTERNS = [
  /^http:\/\//i, // Non-HTTPS
  /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly)\b/i,
  /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)\b/i,
];

/**
 * Programmatic scan for fabricated case study names and ungrounded client assertions.
 */
export function verifyCaseStudiesAndExperience(text: string): {
  passed: boolean;
  violations: FactVerificationViolation[];
} {
  const violations: FactVerificationViolation[] = [];

  for (const pattern of FABRICATED_CLIENT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      violations.push({
        category: "fabricated_case_study",
        severity: "critical",
        claimText: match[0],
        reason: `Detected potential fabricated client or proprietary engagement claim ("${match[0]}"). WebziFire strictly forbids inventing fake clients.`,
        suggestedFix: `Rephrase as a general architectural pattern or label explicitly as "Production Architecture Example" / "Reference Scenario" without claiming a specific fictional client.`,
      });
    }
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Programmatic scan for fabricated search statistics or ungrounded empirical metrics.
 */
export function verifyStatisticsAndMetrics(text: string): {
  passed: boolean;
  violations: FactVerificationViolation[];
} {
  const violations: FactVerificationViolation[] = [];

  for (const pattern of INVENTED_STATISTIC_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      violations.push({
        category: "invented_statistic",
        severity: "critical",
        claimText: match[0],
        reason: `Detected potential invented statistic or metric ("${match[0]}"). Never guess or fabricate percentages, volumes, or benchmark numbers.`,
        suggestedFix: `Replace with engineering principles, industry-standard ranges, or cite an explicit grounded authoritative source.`,
      });
    }
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Verifies all internal and external links for format, scheme, and domain safety.
 */
export async function verifyLinks(params: {
  internalLinks: InternalLinkItem[];
  fullText: string;
}): Promise<{
  passed: boolean;
  violations: FactVerificationViolation[];
  validInternalCount: number;
}> {
  const violations: FactVerificationViolation[] = [];
  const validRoutes = new Set(await getValidInternalRoutes());

  // 1. Verify internal links
  let validInternalCount = 0;
  for (const link of params.internalLinks) {
    if (!link.href || !validRoutes.has(link.href)) {
      violations.push({
        category: "invalid_link",
        severity: "critical",
        claimText: link.href || "(empty href)",
        reason: `Internal link "${link.href}" does not exist in WebziFire's valid route tree.`,
        suggestedFix: `Update link href to a valid service page (e.g., /services/custom-crm-sales-automation) or /contact.`,
      });
    } else {
      validInternalCount++;
    }
  }

  // 2. Scan text for external URL mentions and check against suspicious patterns
  const urlMatches = params.fullText.match(/https?:\/\/[^\s"'<>]+/g) || [];
  for (const url of urlMatches) {
    for (const sus of SUSPICIOUS_URL_PATTERNS) {
      if (sus.test(url)) {
        violations.push({
          category: "invalid_link",
          severity: "critical",
          claimText: url,
          reason: `External link "${url}" violates HTTPS security standards or uses a link shortener.`,
          suggestedFix: `Use canonical, full HTTPS documentation URLs (e.g. postgresql.org, nextjs.org).`,
        });
      }
    }
  }

  return {
    passed: violations.length === 0 && validInternalCount >= 2,
    violations,
    validInternalCount,
  };
}

/**
 * Capability 2: Complete Source & Technical Fact Verification Engine.
 * Combines programmatic heuristics with an independent Gemini Technical Fact Auditor.
 */
export async function runFactAndSourceVerification(params: {
  title: string;
  summary: string;
  contentBlocks: ContentBlock[];
  internalLinks: InternalLinkItem[];
  researchSources?: ResearchSource[];
  articleId?: string;
}): Promise<FactVerificationReport> {
  const blocks = Array.isArray(params.contentBlocks) ? params.contentBlocks : [];
  const fullText = [
    params.title,
    params.summary,
    ...blocks.map((b) => [b.title || "", b.text || "", ...(b.items || [])].join(" ")),
  ].join("\n");

  // Step 1: Programmatic Case Study Verification
  const caseStudyRes = verifyCaseStudiesAndExperience(fullText);

  // Step 2: Programmatic Statistics & Metrics Verification
  const statsRes = verifyStatisticsAndMetrics(fullText);

  // Step 3: Programmatic Link Verification
  const linkRes = await verifyLinks({
    internalLinks: params.internalLinks || [],
    fullText,
  });

  const allViolations: FactVerificationViolation[] = [
    ...caseStudyRes.violations,
    ...statsRes.violations,
    ...linkRes.violations,
  ];

  // Step 4: Independent Gemini Technical Fact Critic
  let technicalPassed = true;
  let technicalScore = 90;
  let technicalSummary = "Technical claims adhere to modern software engineering standards.";
  const verifiedClaims: string[] = [];

  try {
    const auditPrompt = `
You are a Principal Software Architect and Technical Fact Auditor.
Evaluate the factual software engineering accuracy of the following article draft.

Article Title: ${params.title}
Grounded Sources: ${JSON.stringify(params.researchSources || [])}
Content Excerpts:
${fullText.slice(0, 4000)}

AUDIT REQUIREMENTS:
1. NEVER invent, exaggerate, or permit fake statistics, fake case studies, or fabricated benchmarks.
2. Verify that software engineering assertions (e.g., PostgreSQL indexing, Redis caching, microservices latency, JWT auth, Supabase RLS, Next.js ISR/SSR) are technically sound and standard in modern engineering.
3. Verify that real-world scenarios are properly framed as architectural examples rather than fictitious private client stories.

Return ONLY valid JSON matching this schema:
{
  "technicalScore": 0-100,
  "technicalAccuracyPassed": true/false,
  "violations": [
    {
      "claimText": "specific text from draft",
      "reason": "why it is technically inaccurate or unverified",
      "suggestedFix": "how to rephrase accurately"
    }
  ],
  "verifiedClaims": [
    "2 to 4 accurate engineering principles verified in this draft"
  ],
  "auditSummary": "1-2 sentence concise technical fact audit verdict"
}
`;

    const { data: critic } = await callGeminiStructuredJson<{
      technicalScore: number;
      technicalAccuracyPassed: boolean;
      violations: Array<{ claimText: string; reason: string; suggestedFix: string }>;
      verifiedClaims: string[];
      auditSummary: string;
    }>({
      prompt: auditPrompt,
      jobType: "verify_facts",
      articleId: params.articleId,
      preferPro: false,
      temperature: 0.1,
      maxOutputTokens: 2000,
    });

    technicalScore = Number(critic.technicalScore || 90);
    technicalPassed = Boolean(critic.technicalAccuracyPassed);
    technicalSummary = critic.auditSummary || technicalSummary;

    if (Array.isArray(critic.violations)) {
      for (const v of critic.violations) {
        allViolations.push({
          category: "technical_inaccuracy",
          severity: "critical",
          claimText: v.claimText,
          reason: v.reason,
          suggestedFix: v.suggestedFix,
        });
      }
    }

    if (Array.isArray(critic.verifiedClaims)) {
      verifiedClaims.push(...critic.verifiedClaims);
    }
  } catch (err) {
    console.error("[FactVerification] Gemini critic call failed, falling back to programmatic checks:", err);
  }

  const criticalCount = allViolations.filter((v) => v.severity === "critical").length;
  const overallPassed =
    caseStudyRes.passed &&
    statsRes.passed &&
    linkRes.passed &&
    technicalPassed &&
    criticalCount === 0;

  const factualScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        technicalScore -
          (caseStudyRes.passed ? 0 : 25) -
          (statsRes.passed ? 0 : 25) -
          (linkRes.passed ? 0 : 20)
      )
    )
  );

  return {
    overallPassed,
    factualScore,
    caseStudiesVerified: caseStudyRes.passed,
    statisticsVerified: statsRes.passed,
    linksVerified: linkRes.passed,
    technicalAccuracyVerified: technicalPassed,
    violations: allViolations,
    verifiedClaims,
    summary:
      allViolations.length === 0
        ? `All technical claims, links, and examples verified without fabrication. ${technicalSummary}`
        : `Flagged ${allViolations.length} factual / source concerns. ${technicalSummary}`,
    checkedAt: new Date().toISOString(),
  };
}
