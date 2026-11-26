import { callGeminiStructuredJson } from "@/lib/automation/geminiClient";
import { B2BDailyReport } from "@/lib/marketing/types";

interface DailyRollupInput {
  date: string;
  total_evaluated: number;
  qualified_count: number;
  hot_leads_count: number;
  opportunities_count: number;
  contacts_count: number;
  outreach_drafts_count: number;
  top_prospects: Array<{
    name: string;
    domain: string;
    lead_score: number;
    priority: string;
    industry?: string;
    country?: string;
    primary_need?: string;
  }>;
}

export async function generateDailyMarketingReport(
  stats: DailyRollupInput
): Promise<Omit<B2BDailyReport, "id" | "created_at">> {
  const prompt = `You are the Chief Growth Officer & Business Development Strategist for WebziFire.

Analyze today's B2B prospecting metrics and produce a sharp, actionable executive briefing for the founder.

Today's Prospecting Pipeline Stats:
Date: ${stats.date}
Total Companies Evaluated: ${stats.total_evaluated}
Qualified Leads: ${stats.qualified_count}
Hot Leads (Score 85-100): ${stats.hot_leads_count}
New Decision-Makers Identified: ${stats.contacts_count}
New Opportunities Detected: ${stats.opportunities_count}
Outreach Drafts Ready For Review: ${stats.outreach_drafts_count}

Top Prospects Discovered:
${JSON.stringify(stats.top_prospects, null, 2)}

Your Goal:
Generate an executive intelligence briefing with:
1. "executive_summary": High-level synthesis of market signals, top industries reacting, and overall quality of leads discovered today.
2. "market_insights": 3-5 concrete strategic observations about tech stacks, hiring patterns, or service gaps in these targets.
3. "recommended_actions": 3-5 concrete next actions for the founder today (e.g. "Review LinkedIn outreach to Alex @ Acme Corp", "Send cold email pitch for Next.js migration").

Output STRICT JSON matching schema:
{
  "executive_summary": "string",
  "market_insights": ["string"],
  "recommended_actions": ["string"]
}
`;

  try {
    const result = await callGeminiStructuredJson<{
      executive_summary: string;
      market_insights: string[];
      recommended_actions: string[];
    }>({
      prompt,
      jobType: "b2b_qualification"
    });

    const parsed = result?.data;

    return {
      report_date: stats.date,
      companies_discovered: stats.total_evaluated,
      companies_qualified: stats.qualified_count,
      hot_leads_found: stats.hot_leads_count,
      decision_makers_found: stats.contacts_count,
      verified_emails_found: stats.contacts_count,
      jobs_found: stats.opportunities_count,
      drafts_generated: stats.outreach_drafts_count,
      top_prospects: stats.top_prospects.map((p) => ({
        company_name: p.name,
        domain: p.domain,
        country: p.country || "United States",
        lead_score: p.lead_score,
        decision_maker: "Founder / CTO",
        opportunity: p.primary_need || "Full-Stack Development",
        action: "Review Draft Outreach"
      })),
      recommended_actions: parsed?.recommended_actions || [
        "Review and approve staged outreach drafts in the Marketing Dashboard.",
        "Check LinkedIn connection opportunities for top qualified leads."
      ],
      market_insights: parsed?.market_insights || [
        "Growing demand for Next.js and TypeScript modernization among US and European SaaS platforms.",
        "Multiple teams showing engineering expansion or need for senior contractor support."
      ]
    };
  } catch (error) {
    console.error("[ReportAgent] Error generating daily report:", error);
    return {
      report_date: stats.date,
      companies_discovered: stats.total_evaluated,
      companies_qualified: stats.qualified_count,
      hot_leads_found: stats.hot_leads_count,
      decision_makers_found: stats.contacts_count,
      verified_emails_found: stats.contacts_count,
      jobs_found: stats.opportunities_count,
      drafts_generated: stats.outreach_drafts_count,
      top_prospects: stats.top_prospects.map((p) => ({
        company_name: p.name,
        domain: p.domain,
        country: p.country || "United States",
        lead_score: p.lead_score,
        decision_maker: "Founder / CTO",
        opportunity: p.primary_need || "Full-Stack Development",
        action: "Review Draft Outreach"
      })),
      recommended_actions: [
        "Review staged outreach drafts in the Marketing Dashboard."
      ],
      market_insights: [
        "Active hiring signals across modern React and Node.js ecosystems."
      ]
    };
  }
}
