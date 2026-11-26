import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { DiscoveredCompanyCandidate } from "./companyFinder";
import { CompanyResearchResult } from "./researchAgent";
import { EmailVerificationStatus } from "@/lib/marketing/types";

export interface DecisionMakerCandidate {
  full_name: string;
  job_title: string;
  department: string;
  linkedin_url?: string;
  email?: string;
  email_status: EmailVerificationStatus;
  is_decision_maker: boolean;
  relevance_score: number;
  selection_reason: string;
  source_url?: string;
}

export async function findDecisionMakers(
  candidate: DiscoveredCompanyCandidate,
  research: CompanyResearchResult
): Promise<DecisionMakerCandidate[]> {
  const prompt = `
You are the Decision-Maker Intelligence Agent for WebziFire.

COMPANY:
- Name: ${candidate.name}
- Domain: ${candidate.domain}
- Industry: ${candidate.industry}
- Overview: ${research.description}
- LinkedIn: ${research.linkedin_url || "Search domain: " + candidate.domain}

TASK:
Identify 1 to 2 key decision-makers at this company to initiate a business development conversation or explore remote contract/engineering collaboration.

Role Selection Guidelines:
- For Technical Collaborations & Custom Dev: Prioritize CTO, Founder/Co-Founder, VP of Engineering, Head of Technology, Product Lead.
- For Engineering Hiring & Augmentation: Prioritize Technical Hiring Manager, Head of Engineering, Founder.
- DO NOT just pick the CEO by default if a technical co-founder or CTO exists.
- DO NOT fabricate fake personal phone numbers or unverified private emails.
- If an exact verified email is unknown, set email_status to "unverified" or "missing" and provide the public corporate contact channel.

Output strict JSON:
{
  "contacts": [
    {
      "full_name": "Alex Mercer",
      "job_title": "Co-Founder & CTO",
      "department": "Engineering & Technology",
      "linkedin_url": "https://www.linkedin.com/in/alex-mercer",
      "email": "alex@${candidate.domain}",
      "email_status": "unverified",
      "is_decision_maker": true,
      "relevance_score": 95,
      "selection_reason": "Oversees engineering architecture and technical vendor/outsourcing decisions.",
      "source_url": "https://www.linkedin.com/company/${candidate.domain.replace(/\.[a-z]+$/, "")}"
    }
  ]
}
`;

  try {
    const { data } = await callGeminiStructuredJson<{ contacts: DecisionMakerCandidate[] }>({
      prompt,
      jobType: "b2b_decision_maker",
      temperature: 0.3,
    });

    if (!data || !Array.isArray(data.contacts)) {
      return [];
    }

    return data.contacts.map((c) => ({
      ...c,
      email_status: c.email ? (c.email_status || "unverified") : "missing",
      is_decision_maker: c.is_decision_maker ?? true,
      relevance_score: Math.max(50, Math.min(100, c.relevance_score ?? 85)),
    }));
  } catch (err) {
    console.error(`[decisionMakerAgent] Failed for ${candidate.name}:`, err);
    return [];
  }
}
