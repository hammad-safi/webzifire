import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { B2BCampaign } from "@/lib/marketing/types";
import { normalizeDomain } from "@/lib/marketing/verifier";

export interface DiscoveredCompanyCandidate {
  name: string;
  website_url: string;
  domain: string;
  country: string;
  city?: string;
  industry: string;
  company_size: string;
  company_type: string;
  discovery_reason: string;
}

export async function findTargetCompanies(
  campaign: B2BCampaign,
  existingDomains: Set<string>,
  limit = 5
): Promise<DiscoveredCompanyCandidate[]> {
  const prompt = `
You are the Target Company Discovery Agent for WebziFire, an elite international software development agency.

WebziFire Core Competencies:
- React.js, Next.js, Node.js, TypeScript, PostgreSQL, MongoDB, Tailwind CSS
- Services: Custom full-stack web applications, SaaS platform development, Custom ERP & POS systems, API integrations, software maintenance, and senior developer staff augmentation.

Campaign Targeting Criteria:
- Target Countries: ${campaign.target_countries.join(", ")}
- Target Industries: ${campaign.target_industries.join(", ")}
- Target Company Sizes: ${campaign.company_sizes.join(", ")}
- Company Types: ${campaign.company_types.join(", ")}
- Relevant Tech Keywords: ${campaign.tech_keywords.join(", ")}

TASK:
Identify ${limit * 2} real, verifiable international companies in ${campaign.target_countries.join(", ")} that fit these criteria.
Prioritize:
1. Growing SaaS businesses and tech startups building digital products.
2. Digital product agencies that frequently partner or outsource engineering.
3. Companies actively developing or hiring for web technologies (React, Next.js, Node.js, TypeScript).

DO NOT invent fake domain names or fake companies. Output real, active businesses.

Output strict JSON with an array of objects matching:
{
  "companies": [
    {
      "name": "Acme Systems",
      "website_url": "https://acme.com",
      "country": "United States",
      "city": "Austin",
      "industry": "SaaS & Software",
      "company_size": "11-50 employees",
      "company_type": "SaaS",
      "discovery_reason": "High-growth B2B SaaS platform utilizing modern web architecture"
    }
  ]
}
`;

  try {
    const { data } = await callGeminiStructuredJson<{ companies: DiscoveredCompanyCandidate[] }>({
      prompt,
      jobType: "b2b_company_discovery",
      temperature: 0.35,
    });

    if (!data || !Array.isArray(data.companies)) {
      return [];
    }

    const uniqueCandidates: DiscoveredCompanyCandidate[] = [];
    const seenInBatch = new Set<string>();

    for (const c of data.companies) {
      if (!c.name || !c.website_url) continue;
      const domain = normalizeDomain(c.website_url);
      if (!domain) continue;

      if (!existingDomains.has(domain) && !seenInBatch.has(domain)) {
        seenInBatch.add(domain);
        uniqueCandidates.push({
          ...c,
          domain,
        });
        if (uniqueCandidates.length >= limit) break;
      }
    }

    return uniqueCandidates;
  } catch (err) {
    console.error("[companyFinder] Failed to discover companies:", err);
    return [];
  }
}
