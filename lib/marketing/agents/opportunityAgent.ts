import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { DiscoveredCompanyCandidate } from "./companyFinder";
import { CompanyResearchResult } from "./researchAgent";
import { B2BOpportunity, OpportunityType } from "@/lib/marketing/types";

interface OpportunityAnalysisResult {
  opportunities: Array<{
    opportunity_type: OpportunityType;
    title: string;
    description: string;
    source_url?: string;
    required_skills: string[];
    match_score: number;
    match_rationale?: string;
    compensation?: string;
  }>;
}

export async function detectCompanyOpportunities(
  candidate: DiscoveredCompanyCandidate,
  research: CompanyResearchResult,
  companyId: string
): Promise<Array<Omit<B2BOpportunity, "id" | "created_at" | "updated_at">>> {
  const prompt = `You are a high-level B2B Software Sales & Tech Talent Scout analyzing a target company for WebziFire.

WebziFire Core Profile & Capabilities:
- Full-Stack Web Applications: Next.js, React.js, Node.js, Express, TypeScript
- Databases: PostgreSQL, MongoDB, Supabase, Redis
- Enterprise Systems: Custom ERP, POS, CRM, SaaS development, API integrations
- Team Augmentation: Dedicated remote senior engineers, staff augmentation, freelance/contract delivery
- Modernization & Fixes: Legacy code refactoring, bug fixing, performance optimization, MVP builds

Target Company Data:
Company Name: ${candidate.name}
Industry: ${candidate.industry}
Website: ${candidate.website_url}
Business Model: ${research.business_model}
Tech Stack: ${research.tech_stack.join(", ")}
Growth Signals: ${research.growth_signals.join("; ")}
Potential Needs: ${research.potential_needs.join("; ")}

Your Goal:
Detect genuine, high-value opportunities for WebziFire to engage this company. 
Allowed Opportunity Types:
- 'Remote Job'
- 'Contract Job'
- 'Freelance Project'
- 'Outsourcing'
- 'SaaS Development'
- 'Custom Dev Project'
- 'ERP / POS'
- 'API Integration'
- 'Maintenance'
- 'MVP Development'

Guidelines:
- Match Score (0 to 100): Evaluate how precisely WebziFire's tech stack (Next.js, React, Node, TS, Postgres, Mongo) and offerings fit.
- Provide real, actionable match rationale, compensation if known, and required skills.

Output STRICT JSON matching schema:
{
  "opportunities": [
    {
      "opportunity_type": "Custom Dev Project" | "Remote Job" | "SaaS Development" | "Contract Job",
      "title": "string",
      "description": "detailed description of what they need and what we offer",
      "source_url": "url if public job board or careers page, otherwise null",
      "required_skills": ["string"],
      "match_score": number (0-100),
      "match_rationale": "recommended angle to pitch this opportunity",
      "compensation": "salary or budget if indicated or null"
    }
  ]
}
`;

  try {
    const result = await callGeminiStructuredJson<OpportunityAnalysisResult>({
      prompt,
      jobType: "b2b_opportunity"
    });

    if (!result?.data || !Array.isArray(result.data.opportunities)) {
      return [];
    }

    return result.data.opportunities.map((opp) => ({
      company_id: companyId,
      opportunity_type: opp.opportunity_type || "Custom Dev Project",
      title: opp.title,
      description: opp.description,
      source_url: opp.source_url || candidate.website_url,
      required_skills: opp.required_skills || [],
      match_score: typeof opp.match_score === "number" ? Math.min(100, Math.max(0, opp.match_score)) : 75,
      match_rationale: opp.match_rationale || null,
      compensation: opp.compensation || null,
      status: "active" as const,
      discovered_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error(`[OpportunityAgent] Error detecting opportunities for ${candidate.name}:`, error);
    return [
      {
        company_id: companyId,
        opportunity_type: "Custom Dev Project",
        title: "Custom Full-Stack Web Development & Modernization",
        description: `Dedicated engineering support for ${candidate.name} leveraging Next.js, React, Node.js, and modern scalable databases.`,
        source_url: candidate.website_url,
        required_skills: ["Next.js", "React", "Node.js", "TypeScript", "PostgreSQL"],
        match_score: 80,
        match_rationale: "Direct founder/engineering leader outreach proposing team augmentation or MVP feature acceleration.",
        compensation: null,
        status: "active" as const,
        discovered_at: new Date().toISOString()
      }
    ];
  }
}
