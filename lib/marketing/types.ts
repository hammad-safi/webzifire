/**
 * Core TypeScript definitions for the AI-Powered B2B Prospecting & Outreach Platform.
 * Module: /admin/marketing
 */

export type LeadPriority = "Hot Lead" | "High Priority" | "Medium Priority" | "Low Priority";

export type PipelineStage =
  | "new"
  | "researching"
  | "qualified"
  | "contact_identified"
  | "ready_outreach"
  | "contacted"
  | "replied"
  | "interested"
  | "meeting"
  | "proposal"
  | "won"
  | "lost";

export type EmailVerificationStatus = "verified" | "unverified" | "missing" | "bounced";

export type OpportunityType =
  | "Remote Job"
  | "Contract Job"
  | "Freelance Project"
  | "Outsourcing"
  | "SaaS Development"
  | "Custom Dev Project"
  | "ERP / POS"
  | "API Integration"
  | "Maintenance"
  | "MVP Development";

export type OutreachChannel = "linkedin" | "email" | "form";

export type OutreachMessageType =
  | "connection_request"
  | "linkedin_message"
  | "cold_email"
  | "follow_up"
  | "meeting_request";

export type OutreachStatus = "draft" | "approved" | "sent" | "replied" | "rejected" | "archived";

export interface B2BCampaign {
  id: string;
  name: string;
  description?: string | null;
  target_countries: string[];
  target_industries: string[];
  company_sizes: string[];
  company_types: string[];
  tech_keywords: string[];
  target_job_titles: string[];
  services_promoted: string[];
  opportunity_types: OpportunityType[];
  min_lead_score: number;
  max_leads_per_run: number;
  meeting_booking_url?: string;
  include_meeting_link?: boolean;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreRationale {
  tech_alignment_score: number;
  tech_alignment_reasons: string[];
  opportunity_score: number;
  opportunity_reasons: string[];
  budget_scale_score: number;
  outreach_feasibility_score: number;
  summary: string;
  recommended_service: string;
  confidence_rating: "high" | "medium" | "low";
}

export interface B2BCompany {
  id: string;
  campaign_id?: string | null;
  name: string;
  domain: string;
  website_url: string;
  country: string;
  city?: string | null;
  industry: string;
  company_size?: string | null;
  company_type?: string | null;
  linkedin_url?: string | null;
  official_email?: string | null;
  phone?: string | null;
  description: string;
  products: string[];
  services: string[];
  tech_stack: string[];
  research_summary: Record<string, unknown>;
  potential_needs: string[];
  growth_signals: string[];
  lead_score: number;
  lead_priority: LeadPriority;
  score_rationale: ScoreRationale;
  confidence_score: number;
  pipeline_stage: PipelineStage;
  stage_updated_at: string;
  source: string;
  last_researched_at: string;
  created_at: string;
  updated_at: string;
  
  // Relations when joined
  contacts?: B2BContact[];
  opportunities?: B2BOpportunity[];
  outreach?: B2BOutreach[];
}

export interface B2BContact {
  id: string;
  company_id: string;
  full_name: string;
  job_title: string;
  department?: string | null;
  linkedin_url?: string | null;
  email?: string | null;
  email_status: EmailVerificationStatus;
  phone?: string | null;
  is_decision_maker: boolean;
  relevance_score: number;
  selection_reason?: string | null;
  source_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  b2b_companies?: {
    name?: string;
    domain?: string;
    lead_score?: number;
  };
}

export interface B2BOpportunity {
  id: string;
  company_id: string;
  opportunity_type: OpportunityType;
  title: string;
  description: string;
  source_url?: string | null;
  required_skills: string[];
  match_score: number;
  match_rationale?: string | null;
  compensation?: string | null;
  status: "active" | "reviewing" | "applied" | "in_discussion" | "won" | "closed";
  discovered_at: string;
  created_at: string;
  updated_at: string;
  b2b_companies?: {
    name?: string;
    domain?: string;
    lead_score?: number;
    country?: string;
  };
}

export interface B2BOutreach {
  id: string;
  company_id: string;
  contact_id?: string | null;
  channel: OutreachChannel;
  message_type: OutreachMessageType;
  subject?: string | null;
  message_content: string;
  status: OutreachStatus;
  approved_at?: string | null;
  sent_at?: string | null;
  replied_at?: string | null;
  reply_sentiment?: "positive" | "neutral" | "negative" | "not_interested" | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  b2b_companies?: {
    name?: string;
    domain?: string;
    lead_score?: number;
  };
  b2b_contacts?: {
    full_name?: string;
    job_title?: string;
    email?: string;
    linkedin_url?: string;
  };
}

export interface B2BFollowUp {
  id: string;
  company_id: string;
  contact_id?: string | null;
  outreach_id?: string | null;
  due_date: string;
  follow_up_type: "linkedin_check" | "email_follow_up" | "meeting_check_in" | "proposal_review";
  status: "pending" | "completed" | "dismissed";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface B2BResearchSource {
  id: string;
  company_id: string;
  source_url: string;
  source_type: "company_website" | "linkedin" | "job_board" | "news" | "directory" | "search_engine";
  information_collected?: string | null;
  reliability: "high" | "medium" | "unverified";
  accessed_at: string;
}

export interface B2BDailyReport {
  id: string;
  report_date: string;
  companies_discovered: number;
  companies_qualified: number;
  hot_leads_found: number;
  decision_makers_found: number;
  verified_emails_found: number;
  jobs_found: number;
  drafts_generated: number;
  top_prospects: Array<{
    company_name: string;
    domain: string;
    country: string;
    lead_score: number;
    decision_maker: string;
    opportunity: string;
    action: string;
  }>;
  recommended_actions: string[];
  market_insights: string[];
  created_at: string;
}

export interface MarketingTelemetryResponse {
  summary: {
    total_companies: number;
    hot_leads: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    total_contacts: number;
    verified_contacts: number;
    decision_makers: number;
    total_opportunities: number;
    active_opportunities: number;
    total_outreach: number;
    pending_outreach_approval: number;
    approved_outreach: number;
    sent_outreach: number;
    replied_outreach: number;
  };
  pipeline_funnel: Array<{ stage: string; count: number }>;
  latest_daily_report: {
    report_date?: string;
    executive_summary?: string;
    actionable_insights?: string[];
    founder_action_items?: Array<{
      priority: string;
      target_company: string;
      action_type: string;
      action_description: string;
      reason: string;
    }>;
  } | null;
}

// Aliases for unified consumption across codebase
export type CompanyRecord = B2BCompany;
export type ContactRecord = B2BContact;
export type OpportunityRecord = B2BOpportunity;
export type OutreachRecord = B2BOutreach;
export type CampaignRecord = B2BCampaign;
export type DailyMarketingReport = B2BDailyReport;
