import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { B2BCampaign, LeadPriority, ScoreRationale } from "@/lib/marketing/types";
import { DiscoveredCompanyCandidate } from "./companyFinder";
import { CompanyResearchResult } from "./researchAgent";
import { calculateLeadPriority } from "@/lib/marketing/verifier";

export interface QualificationResult {
  lead_score: number;
  lead_priority: LeadPriority;
  score_rationale: ScoreRationale;
  confidence_score: number;
}

export async function qualifyCompany(
  candidate: DiscoveredCompanyCandidate,
  research: CompanyResearchResult,
  campaign: B2BCampaign
): Promise<QualificationResult> {
  const prompt = `
You are the Lead Qualification & ICP Scoring Agent for WebziFire.

WEBZIFIRE CORE VALUE PROPOSITION:
- Senior engineering team: React, Next.js, Node.js, Express, TypeScript, PostgreSQL, MongoDB.
- Flagship Deliverables: High-performance web apps, multi-tenant SaaS platforms, custom ERP & POS business management portals, API integrations, and code maintenance.
- Engagement Models: Fixed-bid milestone projects, ongoing dedicated retainer, and technical staff augmentation.

CAMPAIGN CRITERIA:
- Target Countries: ${campaign.target_countries.join(", ")}
- Target Industries: ${campaign.target_industries.join(", ")}
- Tech Keywords: ${campaign.tech_keywords.join(", ")}
- Minimum Score: ${campaign.min_lead_score}

PROSPECT DATA:
- Company: ${candidate.name} (${candidate.domain})
- Country: ${candidate.country}
- Industry: ${candidate.industry}
- Company Size: ${research.team_size_estimate || candidate.company_size}
- Tech Stack: ${research.tech_stack.join(", ")}
- Growth Signals: ${research.growth_signals.join(", ")}
- Potential Needs: ${research.potential_needs.join(", ")}

SCORING CRITERIA (0 - 100 TOTAL):
1. Technology Compatibility (Max 30 pts): Do they build with or need React, Next.js, Node.js, TypeScript, PostgreSQL?
2. Opportunity & Need Potential (Max 25 pts): Are they hiring, launching products, or managing complex web platforms?
3. Budget & Company Scale (Max 20 pts): Are they a viable commercial entity capable of funding engineering engagements?
4. Outreach Feasibility & Accessibility (Max 15 pts): Are decision-makers accessible?
5. Strategic Geographic Fit (Max 10 pts): Are they in target countries (${campaign.target_countries.join(", ")})?

Classification scale:
- 85-100: Hot Lead
- 70-84: High Priority
- 50-69: Medium Priority
- <50: Low Priority

Output strict JSON:
{
  "lead_score": 82,
  "confidence_score": 88,
  "score_rationale": {
    "tech_alignment_score": 26,
    "tech_alignment_reasons": ["Uses Next.js and TypeScript on core platform", "PostgreSQL database requirements"],
    "opportunity_score": 22,
    "opportunity_reasons": ["Actively scaling customer portal", "Engineering team hiring indicates backlog"],
    "budget_scale_score": 18,
    "outreach_feasibility_score": 12,
    "summary": "Excellent ICP match with immediate custom Next.js development potential.",
    "recommended_service": "Custom SaaS Development & Full-Stack Next.js Engineering",
    "confidence_rating": "high"
  }
}
`;

  try {
    const { data } = await callGeminiStructuredJson<{
      lead_score: number;
      confidence_score: number;
      score_rationale: ScoreRationale;
    }>({
      prompt,
      jobType: "b2b_qualification",
      temperature: 0.25,
    });

    const score = Math.max(0, Math.min(100, Math.round(data?.lead_score ?? 65)));
    const priority = calculateLeadPriority(score);

    return {
      lead_score: score,
      lead_priority: priority,
      score_rationale: data?.score_rationale || {
        tech_alignment_score: 20,
        tech_alignment_reasons: ["Compatible web technologies"],
        opportunity_score: 20,
        opportunity_reasons: ["Active online presence"],
        budget_scale_score: 15,
        outreach_feasibility_score: 10,
        summary: `Qualified lead based on tech compatibility in ${candidate.country}.`,
        recommended_service: "Custom Web Application Development",
        confidence_rating: "medium",
      },
      confidence_score: Math.max(0, Math.min(100, data?.confidence_score ?? 75)),
    };
  } catch (err) {
    console.error(`[qualificationAgent] Failed for ${candidate.name}:`, err);
    return {
      lead_score: 65,
      lead_priority: "Medium Priority",
      score_rationale: {
        tech_alignment_score: 20,
        tech_alignment_reasons: ["Tech stack overlaps with WebziFire"],
        opportunity_score: 18,
        opportunity_reasons: ["Standard digital product development profile"],
        budget_scale_score: 15,
        outreach_feasibility_score: 12,
        summary: "Default qualification score assigned.",
        recommended_service: "Custom Software Engineering",
        confidence_rating: "medium",
      },
      confidence_score: 70,
    };
  }
}
