import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeDomain } from "./verifier";
import { findTargetCompanies, DiscoveredCompanyCandidate } from "./agents/companyFinder";
import { researchCompany, CompanyResearchResult } from "./agents/researchAgent";
import { qualifyCompany, QualificationResult } from "./agents/qualificationAgent";
import { findDecisionMakers, DecisionMakerCandidate } from "./agents/decisionMakerAgent";
import { detectCompanyOpportunities } from "./agents/opportunityAgent";
import { generateProspectOutreach } from "./agents/outreachAgent";
import { generateDailyMarketingReport } from "./agents/reportAgent";
import { B2BCampaign, B2BCompany, B2BContact, B2BOpportunity } from "./types";

export interface SprintResult {
  success: boolean;
  campaign_id?: string;
  companies_evaluated: number;
  companies_qualified: number;
  contacts_created: number;
  opportunities_created: number;
  outreach_drafts_created: number;
  errors: string[];
  processed_companies: Array<{
    name: string;
    domain: string;
    score: number;
    priority: string;
  }>;
}

export async function runProspectingSprint(
  campaignId?: string,
  batchLimit: number = 2
): Promise<SprintResult> {
  const supabase = getSupabaseAdmin();
  const errors: string[] = [];
  const processedCompanies: Array<{ name: string; domain: string; score: number; priority: string }> = [];

  let campaign: B2BCampaign = {
    id: "default-campaign",
    name: "Global High-Growth SaaS & Agencies",
    description: "International companies in US, UK, Canada, Australia, Germany, Netherlands, France",
    target_countries: ["United States", "United Kingdom", "Canada", "Australia", "Germany", "Netherlands"],
    target_industries: ["SaaS & Software", "Technology Startups", "Software Agency", "Cloud Services"],
    company_sizes: ["11-50 employees", "51-200 employees", "1-10 employees"],
    company_types: ["SaaS", "Software Agency", "Startup"],
    tech_keywords: ["Next.js", "React", "Node.js", "TypeScript", "PostgreSQL", "MongoDB"],
    target_job_titles: ["CTO", "Founder", "Co-Founder", "Head of Engineering", "Engineering Manager"],
    services_promoted: ["Custom Web App Development", "SaaS Engineering", "ERP/POS Systems", "API Integration"],
    opportunity_types: ["Remote Job", "Contract Job", "Custom Dev Project", "SaaS Development"],
    min_lead_score: 50,
    max_leads_per_run: 25,
    is_active: true,
    last_run_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (campaignId) {
    const { data: campaignData, error: campaignError } = await supabase
      .from("b2b_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaignData) {
      errors.push(`Campaign ${campaignId} not found: ${campaignError?.message || "unknown"}`);
    } else {
      campaign = { ...campaign, ...campaignData };
    }
  }

  // Load existing domains to avoid re-discovering duplicates
  const existingDomains = new Set<string>();
  const { data: existingRows } = await supabase
    .from("b2b_companies")
    .select("domain");

  if (existingRows) {
    existingRows.forEach((r: { domain: string }) => {
      if (r.domain) existingDomains.add(r.domain.toLowerCase());
    });
  }

  // 1. Discover target companies
  const candidates: DiscoveredCompanyCandidate[] = await findTargetCompanies(
    campaign,
    existingDomains,
    batchLimit
  );

  let qualifiedCount = 0;
  let totalContactsCreated = 0;
  let totalOpportunitiesCreated = 0;
  let totalOutreachCreated = 0;

  for (const candidate of candidates) {
    try {
      const domain = normalizeDomain(candidate.website_url || candidate.domain);
      if (!domain || existingDomains.has(domain)) {
        continue;
      }

      // 2. Conduct Deep Research
      const research: CompanyResearchResult = await researchCompany(candidate);

      // 3. Qualify with ICP Score
      const qualification: QualificationResult = await qualifyCompany(candidate, research, campaign);

      // 4. Persist Company
      const companyPayload = {
        campaign_id: campaignId || null,
        name: candidate.name,
        domain: domain,
        website_url: candidate.website_url,
        country: candidate.country || "United States",
        city: candidate.city || null,
        industry: candidate.industry || "Technology",
        company_size: candidate.company_size || "11-50 employees",
        company_type: candidate.company_type || "SaaS",
        linkedin_url: research.linkedin_url || null,
        official_email: research.official_email || null,
        phone: research.phone || null,
        description: research.description || candidate.discovery_reason,
        products: research.products || [],
        services: research.services || [],
        tech_stack: research.tech_stack || [],
        research_summary: {
          business_model: research.business_model,
          team_size_estimate: research.team_size_estimate
        },
        potential_needs: research.potential_needs || [],
        growth_signals: research.growth_signals || [],
        lead_score: qualification.lead_score,
        lead_priority: qualification.lead_priority,
        score_rationale: qualification.score_rationale,
        confidence_score: qualification.confidence_score,
        pipeline_stage: "qualified",
        source: "AI Discovery Engine",
        last_researched_at: new Date().toISOString()
      };

      const { data: insertedCompany, error: compInsertError } = await supabase
        .from("b2b_companies")
        .insert(companyPayload)
        .select("*")
        .single();

      if (compInsertError || !insertedCompany) {
        errors.push(`Failed to insert company ${candidate.name}: ${compInsertError?.message}`);
        continue;
      }

      existingDomains.add(domain);

      processedCompanies.push({
        name: insertedCompany.name,
        domain: domain,
        score: insertedCompany.lead_score,
        priority: insertedCompany.lead_priority
      });

      // 5. Decision-Maker Intelligence
      const decisionMakers: DecisionMakerCandidate[] = await findDecisionMakers(candidate, research);
      const createdContacts: B2BContact[] = [];

      for (const dm of decisionMakers) {
        const contactPayload = {
          company_id: insertedCompany.id,
          full_name: dm.full_name,
          job_title: dm.job_title,
          department: dm.department,
          linkedin_url: dm.linkedin_url || null,
          email: dm.email || null,
          email_status: dm.email_status || "unverified",
          is_decision_maker: dm.is_decision_maker ?? true,
          relevance_score: dm.relevance_score || 85,
          selection_reason: dm.selection_reason,
          source_url: dm.source_url || candidate.website_url
        };

        const { data: contactRow } = await supabase
          .from("b2b_contacts")
          .insert(contactPayload)
          .select("*")
          .single();

        if (contactRow) {
          createdContacts.push(contactRow);
          totalContactsCreated++;
        }
      }

      // 6. Opportunity Detection
      const opps = await detectCompanyOpportunities(candidate, research, insertedCompany.id);
      const createdOpps: B2BOpportunity[] = [];

      for (const opp of opps) {
        const { data: oppRow } = await supabase
          .from("b2b_opportunities")
          .insert(opp)
          .select("*")
          .single();

        if (oppRow) {
          createdOpps.push(oppRow);
          totalOpportunitiesCreated++;
        }
      }

      // 7. Personalized Outreach Generation (STRICTLY DRAFTS)
      if (createdContacts.length > 0) {
        const primaryContact = createdContacts[0];
        const primaryOpp = createdOpps[0];

        const outreachDrafts = await generateProspectOutreach(
          candidate,
          research,
          primaryContact,
          primaryOpp,
          insertedCompany.id
        );

        for (const draft of outreachDrafts) {
          const { error: draftError } = await supabase
            .from("b2b_outreach")
            .insert(draft);

          if (!draftError) {
            totalOutreachCreated++;
          }
        }
      }

      if (qualification.lead_score >= (campaign.min_lead_score || 50)) {
        qualifiedCount++;
      }
    } catch (err: any) {
      console.error(`[Orchestrator] Error processing candidate ${candidate.name}:`, err);
      errors.push(`Candidate ${candidate.name}: ${err?.message || "processing failed"}`);
    }
  }

  // 8. Update Campaign last_run_at if campaignId exists
  if (campaignId) {
    try {
      await supabase
        .from("b2b_campaigns")
        .update({
          last_run_at: new Date().toISOString()
        })
        .eq("id", campaignId);
    } catch (err) {
      console.error("[Orchestrator] Failed updating campaign:", err);
    }
  }

  // 9. Generate Daily Rollup Report
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const reportData = await generateDailyMarketingReport({
      date: todayStr,
      total_evaluated: processedCompanies.length,
      qualified_count: qualifiedCount,
      hot_leads_count: processedCompanies.filter((c) => c.score >= 85).length,
      opportunities_count: totalOpportunitiesCreated,
      contacts_count: totalContactsCreated,
      outreach_drafts_count: totalOutreachCreated,
      top_prospects: processedCompanies.map((c) => ({
        name: c.name,
        domain: c.domain,
        lead_score: c.score,
        priority: c.priority
      }))
    });

    await supabase.from("b2b_daily_reports").insert(reportData);
  } catch (repErr) {
    console.error("[Orchestrator] Failed saving daily report:", repErr);
  }

  return {
    success: true,
    campaign_id: campaignId,
    companies_evaluated: processedCompanies.length,
    companies_qualified: qualifiedCount,
    contacts_created: totalContactsCreated,
    opportunities_created: totalOpportunitiesCreated,
    outreach_drafts_created: totalOutreachCreated,
    errors,
    processed_companies: processedCompanies
  };
}
