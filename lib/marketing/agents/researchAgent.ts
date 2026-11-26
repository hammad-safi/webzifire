import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { DiscoveredCompanyCandidate } from "./companyFinder";

export interface CompanyResearchResult {
  description: string;
  products: string[];
  services: string[];
  tech_stack: string[];
  linkedin_url?: string;
  official_email?: string;
  phone?: string;
  growth_signals: string[];
  potential_needs: string[];
  business_model: string;
  team_size_estimate?: string;
}

export async function researchCompany(
  company: DiscoveredCompanyCandidate
): Promise<CompanyResearchResult> {
  const prompt = `
You are the Company Deep Research Agent for WebziFire.
Conduct an in-depth business & technical investigation of the company below:

Company Name: ${company.name}
Website: ${company.website_url}
Domain: ${company.domain}
Country: ${company.country}
Industry: ${company.industry}

TASK:
1. Understand what this company actually does, its core products, and business model (B2B SaaS, Agency, Marketplace, Enterprise Tools).
2. Identify the technologies and software architecture they use or are likely to utilize (e.g. Next.js, React, Node.js, TypeScript, PostgreSQL, Tailwind, REST/GraphQL APIs, AWS/Cloud).
3. Detect active growth and hiring signals (e.g. expanding engineering teams, launching new features, scaling their customer portal).
4. Identify 3-4 realistic software engineering needs or bottlenecks where an elite development partner like WebziFire (specializing in React, Next.js, Node, Postgres, ERP/POS, SaaS) could provide high-ROI value.
5. Identify their official public LinkedIn page and contact channels if available.

CRITICAL RULES:
- Never fabricate fake facts. If an exact email is unknown, leave it empty or provide the public domain contact pattern.
- Distinguish verified observations from technical hypotheses.

Output strict JSON:
{
  "description": "Comprehensive 2-3 sentence overview of the company.",
  "products": ["Product A", "Tool B"],
  "services": ["Service A"],
  "tech_stack": ["React", "Next.js", "Node.js", "PostgreSQL", "TypeScript"],
  "linkedin_url": "https://www.linkedin.com/company/...",
  "official_email": "contact@...",
  "phone": "+1 ...",
  "growth_signals": ["Hiring full-stack engineers", "Recently launched enterprise tier"],
  "potential_needs": [
    "Next.js web portal performance optimization",
    "Custom B2B SaaS dashboard integration",
    "PostgreSQL ledger and reporting pipeline"
  ],
  "business_model": "B2B Subscription SaaS",
  "team_size_estimate": "25-50 employees"
}
`;

  try {
    const { data } = await callGeminiStructuredJson<CompanyResearchResult>({
      prompt,
      jobType: "b2b_company_research",
      temperature: 0.3,
    });

    return {
      description: data?.description || `${company.name} operates in ${company.industry}.`,
      products: Array.isArray(data?.products) ? data.products : [],
      services: Array.isArray(data?.services) ? data.services : [],
      tech_stack: Array.isArray(data?.tech_stack) ? data.tech_stack : ["JavaScript", "React", "Node.js"],
      linkedin_url: data?.linkedin_url || null as unknown as undefined,
      official_email: data?.official_email || null as unknown as undefined,
      phone: data?.phone || null as unknown as undefined,
      growth_signals: Array.isArray(data?.growth_signals) ? data.growth_signals : [],
      potential_needs: Array.isArray(data?.potential_needs) ? data.potential_needs : [],
      business_model: data?.business_model || "Digital Products & Services",
      team_size_estimate: data?.team_size_estimate || company.company_size,
    };
  } catch (err) {
    console.error(`[researchAgent] Failed for ${company.name}:`, err);
    return {
      description: `${company.name} is a ${company.industry} firm based in ${company.country}.`,
      products: [],
      services: [],
      tech_stack: ["React", "Node.js", "TypeScript"],
      growth_signals: ["Active online digital operations"],
      potential_needs: ["Full-stack web application development and maintenance"],
      business_model: "Software & Technology",
    };
  }
}
