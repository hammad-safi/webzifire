export type ArticleStatus =
  | "drafting"
  | "qa_revising"
  | "pending_approval"
  | "revision_requested"
  | "published"
  | "rejected";

export type JobType =
  | "research_topic"
  | "write_article"
  | "generate_image"
  | "quality_check"
  | "send_approval_email"
  | "revise_article"
  | "publish_article"
  | "sync_seo_metrics"
  | "verify_facts"
  | "content_refresh";

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface ContentBlock {
  type: "heading2" | "heading3" | "paragraph" | "list" | "callout" | "example";
  text?: string;
  title?: string;
  items?: string[];
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface InternalLinkItem {
  anchor: string;
  href: string;
  context: string;
}

export interface ResearchSource {
  title: string;
  url: string;
}

export interface QualityCheckItem {
  name: string;
  passed: boolean;
  details: string;
}

export interface QualityReport {
  overallScore: number;
  passed: boolean;
  wordCount: number;
  headingCount: number;
  faqCount: number;
  validInternalLinks: number;
  invalidInternalLinks: string[];
  hasAltText: boolean;
  hasFeaturedImage: boolean;
  hasInventedStats: boolean;
  factVerificationPassed?: boolean;
  factualScore?: number;
  factViolations?: Array<{ category: string; claimText: string; reason: string }>;
  checks: QualityCheckItem[];
  editorSummary: string;
  revisionInstructions?: string[];
  checkedAt: string;
}

export interface JournalArticleRecord {
  id: string;
  topic_id?: string | null;
  slug: string;
  title: string;
  category: string;
  service_pillar: string;
  read_time: string;
  date_label: string;
  summary: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  author: string;
  author_role: string;
  image_url: string;
  image_alt: string;
  image_prompt: string;
  content_blocks: ContentBlock[];
  faqs: ArticleFaq[];
  internal_links: InternalLinkItem[];
  takeaway: string;
  cta_heading: string;
  cta_description: string;
  word_count: number;
  research_sources: ResearchSource[];
  competitor_gaps: string[];
  quality_score: number;
  quality_report: QualityReport | Record<string, never>;
  revision_count: number;
  founder_feedback?: string | null;
  status: ArticleStatus;
  approval_token?: string | null;
  token_expires_at?: string | null;
  approval_email_sent_at?: string | null;
  confirmation_email_sent_at?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnifiedJournalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  author: string;
  authorRole: string;
  image: string;
  imageAlt: string;
  content: string[];
  contentBlocks?: ContentBlock[];
  faqs?: ArticleFaq[];
  internalLinks?: InternalLinkItem[];
  takeaway?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  publishedAt?: string | null;
  status?: ArticleStatus;
  isPreview?: boolean;
  previewToken?: string;
  source: "supabase" | "static";
}

export interface AutomationSettings {
  id: string;
  automation_enabled: boolean;
  test_article_verified: boolean;
  articles_per_week: number;
  schedule_days: string[];
  target_word_min: number;
  target_word_max: number;
  min_quality_score: number;
  default_author: string;
  default_author_role: string;
  approval_email: string | null;
  last_pipeline_run_at: string | null;
  last_seo_sync_at: string | null;
  updated_at: string;
}

export interface AutomationJobRecord {
  id: string;
  run_id: string;
  article_id: string | null;
  job_type: JobType;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  locked_at: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SeoMetricRecord {
  id: string;
  article_id: string | null;
  article_slug: string;
  metric_date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avg_position: number;
  top_queries: { query: string; impressions: number; clicks: number; position: number }[];
  indexing_status: string;
  ga4_pageviews: number;
  ga4_avg_engagement_sec: number;
  created_at: string;
}

export interface SeoRecommendationRecord {
  id: string;
  article_id: string | null;
  article_slug: string | null;
  recommendation_type: "new_topic" | "ctr_optimization" | "content_expansion" | "indexing_alert";
  priority: "low" | "medium" | "high";
  title: string;
  rationale: string;
  suggested_action: string;
  status: "open" | "applied" | "dismissed";
  created_at: string;
}

export interface TopicResearchResult {
  topicId?: string;
  topicTitle: string;
  normalizedFingerprint: string;
  servicePillar: string;
  category: string;
  targetRegion: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  competitorGaps: string[];
  researchSources: ResearchSource[];
  suggestedSlug: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  outlinePoints: string[];
  cannibalizationCheck?: {
    isCannibalized: boolean;
    severity: "none" | "low" | "medium" | "high";
    similarity: number;
    conflictingArticleTitle?: string;
    conflictingSlug?: string;
    reason?: string;
    suggestions: string[];
  };
}
