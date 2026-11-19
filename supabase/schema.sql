-- ==============================================================================
-- WEBZIFIRE — Autonomous AI SEO & Content Automation Database Schema
-- Run once in Supabase Dashboard -> SQL Editor (Project: toqdgsjkexzakhckntzz)
-- Follows Supabase Postgres Best Practices: RLS on every table, indexed queries,
-- partial unique/lookup indexes, timestamptz, and server-side service_role writes.
-- ==============================================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. Automation Settings (Single-row configuration; recurring PAUSED by default)
-- ------------------------------------------------------------------------------
create table if not exists public.automation_settings (
  id text primary key default 'default',
  automation_enabled boolean not null default false,
  test_article_verified boolean not null default false,
  articles_per_week integer not null default 3 check (articles_per_week between 1 and 7),
  schedule_days text[] not null default array['mon', 'wed', 'fri'],
  target_word_min integer not null default 1000 check (target_word_min >= 600),
  target_word_max integer not null default 1800 check (target_word_max <= 3500),
  min_quality_score integer not null default 85 check (min_quality_score between 60 and 100),
  default_author text not null default 'Hammad Khan',
  default_author_role text not null default 'Founder & Principal Software Architect',
  approval_email text,
  last_pipeline_run_at timestamptz,
  last_seo_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.automation_settings (id)
values ('default')
on conflict (id) do nothing;

alter table public.automation_settings enable row level security;

-- ------------------------------------------------------------------------------
-- 2. Topic Research Queue (Deduplicated B2B & International SEO topics)
-- ------------------------------------------------------------------------------
create table if not exists public.topic_research_queue (
  id uuid primary key default gen_random_uuid(),
  topic_title text not null,
  normalized_fingerprint text not null unique,
  service_pillar text not null,
  target_region text not null default 'Global (US, UK, UAE, EU)',
  primary_keyword text not null,
  secondary_keywords text[] not null default '{}',
  search_intent text not null default 'commercial_informational',
  competitor_gaps text[] not null default '{}',
  research_sources jsonb not null default '[]'::jsonb,
  suggested_slug text not null,
  seo_meta_title text,
  seo_meta_description text,
  status text not null default 'queued'
    check (status in ('queued', 'in_progress', 'completed', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_topic_research_queue_status_created
  on public.topic_research_queue (status, created_at desc);

alter table public.topic_research_queue enable row level security;

-- ------------------------------------------------------------------------------
-- 3. Journal Articles (Drafts, Pending Approvals, Published, Rejected)
-- ------------------------------------------------------------------------------
create table if not exists public.journal_articles (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topic_research_queue(id) on delete set null,
  slug text not null unique,
  title text not null,
  category text not null,
  service_pillar text not null default 'Web Engineering',
  read_time text not null default '7 min read',
  date_label text not null,
  summary text not null,
  meta_title text not null,
  meta_description text not null,
  primary_keyword text not null,
  secondary_keywords text[] not null default '{}',
  search_intent text not null default 'commercial_informational',
  author text not null default 'Hammad Khan',
  author_role text not null default 'Founder & Principal Software Architect',
  image_url text not null default '',
  image_alt text not null default '',
  image_prompt text not null default '',
  content_blocks jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  internal_links jsonb not null default '[]'::jsonb,
  takeaway text not null default '',
  cta_heading text not null default 'Ready to engineer your digital platform?',
  cta_description text not null default 'Schedule an architectural scoping session with our principal team.',
  word_count integer not null default 0,
  research_sources jsonb not null default '[]'::jsonb,
  competitor_gaps text[] not null default '{}',
  quality_score integer not null default 0,
  quality_report jsonb not null default '{}'::jsonb,
  revision_count integer not null default 0,
  founder_feedback text,
  status text not null default 'drafting'
    check (status in (
      'drafting',
      'qa_revising',
      'pending_approval',
      'revision_requested',
      'published',
      'rejected'
    )),
  approval_token text,
  token_expires_at timestamptz,
  approval_email_sent_at timestamptz,
  confirmation_email_sent_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_journal_articles_published
  on public.journal_articles (published_at desc)
  where status = 'published';

create index if not exists idx_journal_articles_status_created
  on public.journal_articles (status, created_at desc);

create unique index if not exists idx_journal_articles_approval_token
  on public.journal_articles (approval_token)
  where approval_token is not null;

alter table public.journal_articles enable row level security;

-- Public read access ONLY for explicitly published articles
grant select on public.journal_articles to anon, authenticated;

drop policy if exists "Public can read published journal articles" on public.journal_articles;
create policy "Public can read published journal articles"
  on public.journal_articles
  for select
  to anon, authenticated
  using (status = 'published');

-- ------------------------------------------------------------------------------
-- 4. Automation Jobs (Discrete, Retryable Pipeline Steps with Locking)
-- ------------------------------------------------------------------------------
create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  article_id uuid references public.journal_articles(id) on delete cascade,
  job_type text not null
    check (job_type in (
      'research_topic',
      'write_article',
      'generate_image',
      'quality_check',
      'send_approval_email',
      'revise_article',
      'publish_article',
      'sync_seo_metrics'
    )),
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  last_error text,
  locked_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_automation_jobs_run_created
  on public.automation_jobs (run_id, created_at asc);

create index if not exists idx_automation_jobs_status_locked
  on public.automation_jobs (status, locked_at)
  where status in ('pending', 'running', 'failed');

alter table public.automation_jobs enable row level security;

-- ------------------------------------------------------------------------------
-- 5. Gemini AI Usage & Cost Logs
-- ------------------------------------------------------------------------------
create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.journal_articles(id) on delete set null,
  job_type text not null,
  model text not null,
  prompt_tokens integer not null default 0,
  output_tokens integer not null default 0,
  image_count integer not null default 0,
  estimated_cost_usd numeric(10, 6) not null default 0,
  latency_ms integer not null default 0,
  success boolean not null default true,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_logs_created
  on public.ai_usage_logs (created_at desc);

alter table public.ai_usage_logs enable row level security;

-- ------------------------------------------------------------------------------
-- 6. SEO Performance Metrics (GSC + GA4) & Non-Destructive Recommendations
-- ------------------------------------------------------------------------------
create table if not exists public.seo_performance_metrics (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.journal_articles(id) on delete cascade,
  article_slug text not null,
  metric_date date not null default current_date,
  impressions integer not null default 0,
  clicks integer not null default 0,
  ctr numeric(6, 4) not null default 0,
  avg_position numeric(6, 2) not null default 0,
  top_queries jsonb not null default '[]'::jsonb,
  indexing_status text not null default 'unknown',
  ga4_pageviews integer not null default 0,
  ga4_avg_engagement_sec numeric(8, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (article_slug, metric_date)
);

create index if not exists idx_seo_metrics_slug_date
  on public.seo_performance_metrics (article_slug, metric_date desc);

alter table public.seo_performance_metrics enable row level security;

create table if not exists public.seo_recommendations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.journal_articles(id) on delete cascade,
  article_slug text,
  recommendation_type text not null
    check (recommendation_type in ('new_topic', 'ctr_optimization', 'content_expansion', 'indexing_alert')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  title text not null,
  rationale text not null,
  suggested_action text not null,
  status text not null default 'open' check (status in ('open', 'applied', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_seo_recommendations_status_created
  on public.seo_recommendations (status, created_at desc);

alter table public.seo_recommendations enable row level security;

-- ------------------------------------------------------------------------------
-- 7. Permanent Storage Bucket for Featured Journal Images
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'journal-images',
  'journal-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = true;

drop policy if exists "Public can view journal images" on storage.objects;
create policy "Public can view journal images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'journal-images');
