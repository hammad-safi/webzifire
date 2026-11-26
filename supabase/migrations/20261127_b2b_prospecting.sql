-- ==============================================================================
-- WEBZIFIRE — AI B2B Prospecting, Lead Intelligence & Outreach Schema
-- Module: Admin AI Marketing (/admin/marketing)
-- Follows Supabase Postgres Best Practices: RLS on every table, indexed queries,
-- domain uniqueness, cascade deletes, timestamptz, and service_role writes.
-- ==============================================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. B2B Prospecting Campaigns
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_countries text[] not null default array['United States', 'United Kingdom', 'Canada', 'Germany'],
  target_industries text[] not null default array['SaaS & Software', 'Technology Startups', 'E-Commerce', 'FinTech'],
  company_sizes text[] not null default array['5-50 employees', '51-200 employees'],
  company_types text[] not null default array['SaaS', 'Startup', 'Software Agency', 'SMB'],
  tech_keywords text[] not null default array['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
  target_job_titles text[] not null default array['CEO', 'Founder', 'CTO', 'Head of Engineering', 'Engineering Manager'],
  services_promoted text[] not null default array['Custom Web App Development', 'SaaS Product Engineering', 'ERP/POS Systems', 'API Integration'],
  opportunity_types text[] not null default array['Remote Job', 'Contract', 'Custom Dev', 'Outsourcing'],
  min_lead_score integer not null default 70 check (min_lead_score between 0 and 100),
  max_leads_per_run integer not null default 25 check (max_leads_per_run between 1 and 100),
  is_active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.b2b_campaigns enable row level security;

-- Default starter campaign
insert into public.b2b_campaigns (name, description, target_countries, tech_keywords, min_lead_score)
values (
  'Global SaaS & Agency Expansion (US, UK, EU)',
  'Targeting fast-growing SaaS startups and digital agencies hiring or needing full-stack Next.js/React/Node.js talent.',
  array['United States', 'United Kingdom', 'Canada', 'Germany', 'Netherlands'],
  array['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  70
)
on conflict do nothing;

-- ------------------------------------------------------------------------------
-- 2. B2B Companies Directory
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_companies (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.b2b_campaigns(id) on delete set null,
  name text not null,
  domain text not null unique,
  website_url text not null,
  country text not null default 'United States',
  city text,
  industry text not null default 'Technology',
  company_size text default '11-50 employees',
  company_type text default 'SaaS',
  linkedin_url text,
  official_email text,
  phone text,
  description text not null default '',
  products text[] not null default '{}',
  services text[] not null default '{}',
  tech_stack text[] not null default '{}',
  research_summary jsonb not null default '{}'::jsonb,
  potential_needs text[] not null default '{}',
  growth_signals text[] not null default '{}',
  
  -- ICP Scoring (0-100) & Priority
  lead_score integer not null default 50 check (lead_score between 0 and 100),
  lead_priority text not null default 'Medium Priority'
    check (lead_priority in ('Hot Lead', 'High Priority', 'Medium Priority', 'Low Priority')),
  score_rationale jsonb not null default '{}'::jsonb,
  confidence_score integer not null default 80 check (confidence_score between 0 and 100),

  -- Pipeline Stage
  pipeline_stage text not null default 'new'
    check (pipeline_stage in (
      'new', 'researching', 'qualified', 'contact_identified', 
      'ready_outreach', 'contacted', 'replied', 'interested', 
      'meeting', 'proposal', 'won', 'lost'
    )),
  stage_updated_at timestamptz not null default now(),

  source text not null default 'AI Discovery Engine',
  last_researched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_b2b_companies_score_priority 
  on public.b2b_companies (lead_score desc, lead_priority);

create index if not exists idx_b2b_companies_pipeline_stage 
  on public.b2b_companies (pipeline_stage, stage_updated_at desc);

create index if not exists idx_b2b_companies_country_industry 
  on public.b2b_companies (country, industry);

alter table public.b2b_companies enable row level security;

-- ------------------------------------------------------------------------------
-- 3. B2B Decision-Makers & Contacts
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.b2b_companies(id) on delete cascade,
  full_name text not null,
  job_title text not null,
  department text default 'Engineering / Executive',
  linkedin_url text,
  email text,
  email_status text not null default 'unverified'
    check (email_status in ('verified', 'unverified', 'missing', 'bounced')),
  phone text,
  is_decision_maker boolean not null default true,
  relevance_score integer not null default 85 check (relevance_score between 0 and 100),
  selection_reason text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_b2b_contacts_company_id 
  on public.b2b_contacts (company_id);

alter table public.b2b_contacts enable row level security;

-- ------------------------------------------------------------------------------
-- 4. B2B Opportunities & Jobs
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.b2b_companies(id) on delete cascade,
  opportunity_type text not null default 'Custom Dev Project'
    check (opportunity_type in (
      'Remote Job', 'Contract Job', 'Freelance Project', 'Outsourcing',
      'SaaS Development', 'Custom Dev Project', 'ERP / POS', 'API Integration',
      'Maintenance', 'MVP Development'
    )),
  title text not null,
  description text not null,
  source_url text,
  required_skills text[] not null default '{}',
  match_score integer not null default 85 check (match_score between 0 and 100),
  match_rationale text,
  compensation text,
  status text not null default 'active'
    check (status in ('active', 'reviewing', 'applied', 'in_discussion', 'won', 'closed')),
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_b2b_opportunities_company_id 
  on public.b2b_opportunities (company_id, match_score desc);

alter table public.b2b_opportunities enable row level security;

-- ------------------------------------------------------------------------------
-- 5. B2B Personalized Outreach Desk (Strict Human Approval)
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_outreach (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.b2b_companies(id) on delete cascade,
  contact_id uuid references public.b2b_contacts(id) on delete set null,
  channel text not null default 'linkedin' check (channel in ('linkedin', 'email', 'form')),
  message_type text not null default 'connection_request'
    check (message_type in ('connection_request', 'linkedin_message', 'cold_email', 'follow_up', 'meeting_request')),
  subject text,
  message_content text not null,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'sent', 'replied', 'rejected', 'archived')),
  approved_at timestamptz,
  sent_at timestamptz,
  replied_at timestamptz,
  reply_sentiment text check (reply_sentiment in ('positive', 'neutral', 'negative', 'not_interested')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_b2b_outreach_status 
  on public.b2b_outreach (status, created_at desc);

create index if not exists idx_b2b_outreach_company_id 
  on public.b2b_outreach (company_id);

alter table public.b2b_outreach enable row level security;

-- ------------------------------------------------------------------------------
-- 6. B2B Follow-Ups & Reminders
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_follow_ups (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.b2b_companies(id) on delete cascade,
  contact_id uuid references public.b2b_contacts(id) on delete set null,
  outreach_id uuid references public.b2b_outreach(id) on delete set null,
  due_date timestamptz not null,
  follow_up_type text not null default 'linkedin_check'
    check (follow_up_type in ('linkedin_check', 'email_follow_up', 'meeting_check_in', 'proposal_review')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'dismissed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_b2b_follow_ups_due_date 
  on public.b2b_follow_ups (due_date, status);

alter table public.b2b_follow_ups enable row level security;

-- ------------------------------------------------------------------------------
-- 7. B2B Research Sources & Audit Trail
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_research_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.b2b_companies(id) on delete cascade,
  source_url text not null,
  source_type text not null default 'company_website'
    check (source_type in ('company_website', 'linkedin', 'job_board', 'news', 'directory', 'search_engine')),
  information_collected text,
  reliability text not null default 'high' check (reliability in ('high', 'medium', 'unverified')),
  accessed_at timestamptz not null default now()
);

create index if not exists idx_b2b_research_sources_company_id 
  on public.b2b_research_sources (company_id);

alter table public.b2b_research_sources enable row level security;

-- ------------------------------------------------------------------------------
-- 8. B2B Daily AI Intelligence Reports
-- ------------------------------------------------------------------------------
create table if not exists public.b2b_daily_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null default current_date unique,
  companies_discovered integer not null default 0,
  companies_qualified integer not null default 0,
  hot_leads_found integer not null default 0,
  decision_makers_found integer not null default 0,
  verified_emails_found integer not null default 0,
  jobs_found integer not null default 0,
  drafts_generated integer not null default 0,
  top_prospects jsonb not null default '[]'::jsonb,
  recommended_actions text[] not null default '{}',
  market_insights text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.b2b_daily_reports enable row level security;
