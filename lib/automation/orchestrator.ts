import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runTopicAndSeoResearch } from "@/lib/automation/jobs/researchTopic";
import { runWriteOrReviseArticle } from "@/lib/automation/jobs/writeArticle";
import { runGenerateAndStoreFeaturedImage } from "@/lib/automation/jobs/generateImage";
import { runQualityCheck } from "@/lib/automation/jobs/qualityCheck";
import {
  sendArticleApprovalEmail,
  sendPublishConfirmationEmail,
} from "@/lib/email/mailer";
import {
  AutomationSettings,
  JobType,
  JournalArticleRecord,
} from "@/lib/automation/types";

const MAX_AUTO_QA_REVISIONS = 2;

function formatMonthYear(date = new Date()): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function generateApprovalToken(): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
}

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("automation_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (data) return data as AutomationSettings;

  const { data: created, error } = await admin
    .from("automation_settings")
    .upsert({ id: "default" })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(`Failed loading automation_settings: ${error?.message}`);
  }
  return created as AutomationSettings;
}

export function isScheduledRunDueToday(settings: AutomationSettings): {
  due: boolean;
  reason: string;
} {
  if (!settings.automation_enabled) {
    return {
      due: false,
      reason: "Automation is currently PAUSED (waiting for test verification or manual enable).",
    };
  }

  const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const todayDay = dayMap[new Date().getUTCDay()];
  const allowedDays = (settings.schedule_days || ["mon", "wed", "fri"]).map((d) =>
    d.toLowerCase().slice(0, 3)
  );

  if (!allowedDays.includes(todayDay)) {
    return {
      due: false,
      reason: `Today (${todayDay}) is not in scheduled days (${allowedDays.join(", ")}).`,
    };
  }

  // Prevent running more than once within 18 hours
  if (settings.last_pipeline_run_at) {
    const hoursSince =
      (Date.now() - new Date(settings.last_pipeline_run_at).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 18) {
      return {
        due: false,
        reason: `Pipeline already ran ${hoursSince.toFixed(1)}h ago; skipping duplicate daily run.`,
      };
    }
  }

  return { due: true, reason: "Scheduled day matches and cooldown elapsed." };
}

async function runTrackedJob<T>(params: {
  runId: string;
  articleId?: string | null;
  jobType: JobType;
  payload?: Record<string, unknown>;
  executor: () => Promise<T>;
}): Promise<T> {
  const admin = getSupabaseAdmin();
  const { data: jobRow } = await admin
    .from("automation_jobs")
    .insert({
      run_id: params.runId,
      article_id: params.articleId || null,
      job_type: params.jobType,
      status: "running",
      attempts: 1,
      locked_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
      payload: params.payload || {},
    })
    .select("id")
    .single();

  try {
    const result = await params.executor();
    if (jobRow?.id) {
      await admin
        .from("automation_jobs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          locked_at: null,
          result:
            typeof result === "object" && result !== null
              ? (result as Record<string, unknown>)
              : { ok: true },
        })
        .eq("id", jobRow.id);
    }
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (jobRow?.id) {
      await admin
        .from("automation_jobs")
        .update({
          status: "failed",
          last_error: message.slice(0, 1000),
          locked_at: null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", jobRow.id);
    }
    throw err;
  }
}

/**
 * Prevents overlapping pipeline executions if two triggers fire near the same second.
 */
async function hasActiveRunningJob(): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("automation_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "running")
    .gte("locked_at", tenMinutesAgo);

  return (count || 0) > 0;
}

/**
 * Executes the complete 5-job autonomous creation workflow for 1 article:
 * Job 1 (Research + SEO) -> Job 2 (Write) -> Job 3 (Image + Storage) ->
 * Job 4 (Quality Check + up to 2 auto-revisions) -> Job 5 (Email Approval).
 */
export async function runFullArticleCreationPipeline(options?: {
  preferredPillar?: string;
  isManualTest?: boolean;
}): Promise<{
  runId: string;
  article: JournalArticleRecord;
  emailSentTo: string;
}> {
  const admin = getSupabaseAdmin();
  if (await hasActiveRunningJob()) {
    throw new Error(
      "Another automation job is currently running. Please wait a minute to avoid duplicate generation."
    );
  }

  const settings = await getAutomationSettings();
  const runId = crypto.randomUUID();

  // JOB 1: Topic & Grounded SEO Research
  const topic = await runTrackedJob({
    runId,
    jobType: "research_topic",
    payload: { preferredPillar: options?.preferredPillar || null },
    executor: () => runTopicAndSeoResearch({ preferredPillar: options?.preferredPillar }),
  });

  // JOB 2: Long-Form SEO Article Writing
  const written = await runTrackedJob({
    runId,
    jobType: "write_article",
    payload: { topicTitle: topic.topicTitle, slug: topic.suggestedSlug },
    executor: () =>
      runWriteOrReviseArticle({
        topic,
        settings,
      }),
  });

  // Persist initial article draft
  const { data: insertedArticle, error: insertErr } = await admin
    .from("journal_articles")
    .insert({
      topic_id: topic.topicId || null,
      slug: topic.suggestedSlug,
      title: written.payload.title || topic.topicTitle,
      category: topic.category,
      service_pillar: topic.servicePillar,
      read_time: written.payload.readTime,
      date_label: formatMonthYear(),
      summary: written.payload.summary,
      meta_title: written.payload.metaTitle || topic.seoMetaTitle,
      meta_description: written.payload.metaDescription || topic.seoMetaDescription,
      primary_keyword: topic.primaryKeyword,
      secondary_keywords: topic.secondaryKeywords,
      search_intent: topic.searchIntent,
      author: settings.default_author || "Hammad Khan",
      author_role:
        settings.default_author_role || "Founder & Principal Software Architect",
      image_prompt: written.payload.imagePrompt,
      image_alt: written.payload.imageAlt,
      content_blocks: written.payload.contentBlocks,
      faqs: written.payload.faqs,
      internal_links: written.payload.internalLinks,
      takeaway: written.payload.takeaway,
      cta_heading: written.payload.ctaHeading,
      cta_description: written.payload.ctaDescription,
      word_count: written.wordCount,
      research_sources: topic.researchSources,
      competitor_gaps: topic.competitorGaps,
      status: "drafting",
    })
    .select("*")
    .single();

  if (insertErr || !insertedArticle) {
    throw new Error(`Failed saving drafted article: ${insertErr?.message}`);
  }

  let article = insertedArticle as JournalArticleRecord;

  // JOB 3: Featured Image Generation & Permanent Supabase Storage Upload
  const imgResult = await runTrackedJob({
    runId,
    articleId: article.id,
    jobType: "generate_image",
    payload: { slug: article.slug },
    executor: () =>
      runGenerateAndStoreFeaturedImage({
        articleId: article.id,
        slug: article.slug,
        title: article.title,
        imagePrompt: article.image_prompt,
        servicePillar: article.service_pillar,
      }),
  });

  const { data: withImg } = await admin
    .from("journal_articles")
    .update({
      image_url: imgResult.imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id)
    .select("*")
    .single();

  if (withImg) article = withImg as JournalArticleRecord;

  // JOB 4: Quality Check + Automatic Revision Loop (up to 2 auto-revisions)
  let qaReport = await runTrackedJob({
    runId,
    articleId: article.id,
    jobType: "quality_check",
    executor: () => runQualityCheck({ article, settings }),
  });

  let autoRevisions = 0;
  while (!qaReport.passed && autoRevisions < MAX_AUTO_QA_REVISIONS) {
    autoRevisions += 1;
    await admin
      .from("journal_articles")
      .update({ status: "qa_revising", updated_at: new Date().toISOString() })
      .eq("id", article.id);

    const revised = await runTrackedJob({
      runId,
      articleId: article.id,
      jobType: "revise_article",
      payload: { reason: "qa_auto_revision", attempt: autoRevisions },
      executor: () =>
        runWriteOrReviseArticle({
          existingArticle: article,
          settings,
          revisionInstructions: qaReport.revisionInstructions,
          articleId: article.id,
        }),
    });

    const { data: updatedDraft } = await admin
      .from("journal_articles")
      .update({
        title: revised.payload.title,
        summary: revised.payload.summary,
        meta_title: revised.payload.metaTitle,
        meta_description: revised.payload.metaDescription,
        read_time: revised.payload.readTime,
        content_blocks: revised.payload.contentBlocks,
        faqs: revised.payload.faqs,
        internal_links: revised.payload.internalLinks,
        takeaway: revised.payload.takeaway,
        cta_heading: revised.payload.ctaHeading,
        cta_description: revised.payload.ctaDescription,
        image_alt: revised.payload.imageAlt || article.image_alt,
        word_count: revised.wordCount,
        revision_count: article.revision_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", article.id)
      .select("*")
      .single();

    if (updatedDraft) article = updatedDraft as JournalArticleRecord;

    qaReport = await runTrackedJob({
      runId,
      articleId: article.id,
      jobType: "quality_check",
      payload: { attempt: autoRevisions + 1 },
      executor: () => runQualityCheck({ article, settings }),
    });
  }

  // Hard gate: do NOT send an incomplete article without an image or body
  if (!article.image_url || article.word_count < 600) {
    throw new Error(
      `Article "${article.title}" failed completeness guard (wordCount=${article.word_count}, hasImage=${Boolean(
        article.image_url
      )}). Aborting approval email.`
    );
  }

  // Generate fresh one-time approval token and mark pending_approval
  const { token, expiresAt } = generateApprovalToken();
  const { data: readyArticle, error: readyErr } = await admin
    .from("journal_articles")
    .update({
      quality_score: qaReport.overallScore,
      quality_report: qaReport,
      status: "pending_approval",
      approval_token: token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id)
    .select("*")
    .single();

  if (readyErr || !readyArticle) {
    throw new Error(`Failed finalizing pending article: ${readyErr?.message}`);
  }
  article = readyArticle as JournalArticleRecord;

  // Mark topic completed
  if (topic.topicId) {
    await admin
      .from("topic_research_queue")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", topic.topicId);
  }

  // JOB 5: Send Rich Approval Email to Founder
  const mailResult = await runTrackedJob({
    runId,
    articleId: article.id,
    jobType: "send_approval_email",
    executor: () =>
      sendArticleApprovalEmail({
        article,
        recipientEmail: settings.approval_email,
      }),
  });

  await admin
    .from("journal_articles")
    .update({
      approval_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id);

  if (!options?.isManualTest) {
    await admin
      .from("automation_settings")
      .update({
        last_pipeline_run_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", "default");
  }

  return {
    runId,
    article,
    emailSentTo: mailResult.to,
  };
}

/**
 * Triggered when founder selects "Request Revision" from email with feedback.
 * Revises article -> Re-runs Quality Check -> Issues fresh approval token -> Emails updated draft.
 */
export async function runFounderRevisionPipeline(params: {
  article: JournalArticleRecord;
  feedback: string;
  regenerateImage?: boolean;
}): Promise<{ article: JournalArticleRecord; emailSentTo: string }> {
  const admin = getSupabaseAdmin();
  const settings = await getAutomationSettings();
  const runId = crypto.randomUUID();
  let article = params.article;

  await admin
    .from("journal_articles")
    .update({
      status: "revision_requested",
      founder_feedback: params.feedback,
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id);

  const revised = await runTrackedJob({
    runId,
    articleId: article.id,
    jobType: "revise_article",
    payload: { reason: "founder_feedback" },
    executor: () =>
      runWriteOrReviseArticle({
        existingArticle: article,
        settings,
        founderFeedback: params.feedback,
        articleId: article.id,
      }),
  });

  let newImageUrl = article.image_url;
  if (params.regenerateImage) {
    const imgRes = await runTrackedJob({
      runId,
      articleId: article.id,
      jobType: "generate_image",
      payload: { slug: article.slug, reason: "founder_revision" },
      executor: () =>
        runGenerateAndStoreFeaturedImage({
          articleId: article.id,
          slug: article.slug,
          title: revised.payload.title,
          imagePrompt: revised.payload.imagePrompt,
          servicePillar: article.service_pillar,
        }),
    });
    newImageUrl = imgRes.imageUrl;
  }

  const { data: updatedDraft } = await admin
    .from("journal_articles")
    .update({
      title: revised.payload.title,
      summary: revised.payload.summary,
      meta_title: revised.payload.metaTitle,
      meta_description: revised.payload.metaDescription,
      read_time: revised.payload.readTime,
      content_blocks: revised.payload.contentBlocks,
      faqs: revised.payload.faqs,
      internal_links: revised.payload.internalLinks,
      takeaway: revised.payload.takeaway,
      cta_heading: revised.payload.ctaHeading,
      cta_description: revised.payload.ctaDescription,
      image_url: newImageUrl,
      image_alt: revised.payload.imageAlt || article.image_alt,
      image_prompt: revised.payload.imagePrompt || article.image_prompt,
      word_count: revised.wordCount,
      revision_count: article.revision_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id)
    .select("*")
    .single();

  if (updatedDraft) article = updatedDraft as JournalArticleRecord;

  const qaReport = await runTrackedJob({
    runId,
    articleId: article.id,
    jobType: "quality_check",
    payload: { reason: "post_founder_revision" },
    executor: () => runQualityCheck({ article, settings }),
  });

  const { token, expiresAt } = generateApprovalToken();
  const { data: readyArticle, error } = await admin
    .from("journal_articles")
    .update({
      quality_score: qaReport.overallScore,
      quality_report: qaReport,
      status: "pending_approval",
      approval_token: token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id)
    .select("*")
    .single();

  if (error || !readyArticle) {
    throw new Error(`Failed saving revised article: ${error?.message}`);
  }
  article = readyArticle as JournalArticleRecord;

  const mailResult = await runTrackedJob({
    runId,
    articleId: article.id,
    jobType: "send_approval_email",
    payload: { revisionCount: article.revision_count },
    executor: () =>
      sendArticleApprovalEmail({
        article,
        recipientEmail: settings.approval_email,
      }),
  });

  await admin
    .from("journal_articles")
    .update({
      approval_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", article.id);

  return { article, emailSentTo: mailResult.to };
}

/**
 * Step 7 & 8: Publishes an explicitly approved article atomically,
 * invalidates token to prevent duplicate publishing, revalidates /blog + /sitemap.xml,
 * and sends the live Publish Confirmation Email.
 */
export async function publishApprovedArticle(
  article: JournalArticleRecord
): Promise<{ article: JournalArticleRecord; confirmationSent: boolean }> {
  const admin = getSupabaseAdmin();
  const settings = await getAutomationSettings();
  const runId = crypto.randomUUID();

  // Atomic publish guard: only transition if currently pending_approval
  const now = new Date().toISOString();
  const { data: published, error } = await admin
    .from("journal_articles")
    .update({
      status: "published",
      approved_at: now,
      published_at: now,
      date_label: formatMonthYear(),
      approval_token: null,
      token_expires_at: null,
      updated_at: now,
    })
    .eq("id", article.id)
    .eq("status", "pending_approval")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed publishing article: ${error.message}`);
  }
  if (!published) {
    throw new Error("Article was already published, rejected, or token already consumed.");
  }

  const publishedArticle = published as JournalArticleRecord;

  // Record publish job + revalidate Next.js caches
  await runTrackedJob({
    runId,
    articleId: publishedArticle.id,
    jobType: "publish_article",
    payload: { slug: publishedArticle.slug },
    executor: async () => {
      revalidatePath("/blog");
      revalidatePath(`/blog/${publishedArticle.slug}`);
      revalidatePath("/sitemap.xml");
      return { revalidated: true, slug: publishedArticle.slug };
    },
  });

  // Mark test_article_verified = true after first successful publish
  await admin
    .from("automation_settings")
    .update({ test_article_verified: true, updated_at: now })
    .eq("id", "default");

  // Send publish confirmation email
  let confirmationSent = false;
  try {
    await sendPublishConfirmationEmail({
      article: publishedArticle,
      recipientEmail: settings.approval_email,
    });
    confirmationSent = true;
    await admin
      .from("journal_articles")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", publishedArticle.id);
  } catch (mailErr) {
    console.error("[Orchestrator] Publish succeeded but confirmation email failed:", mailErr);
  }

  return { article: publishedArticle, confirmationSent };
}

/**
 * Step 7: Permanently marks a draft rejected so it can never be published.
 */
export async function rejectDraftArticle(
  article: JournalArticleRecord,
  reason?: string
): Promise<JournalArticleRecord> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: rejected, error } = await admin
    .from("journal_articles")
    .update({
      status: "rejected",
      rejected_at: now,
      founder_feedback: reason || article.founder_feedback || null,
      approval_token: null,
      token_expires_at: null,
      updated_at: now,
    })
    .eq("id", article.id)
    .eq("status", "pending_approval")
    .select("*")
    .maybeSingle();

  if (error || !rejected) {
    throw new Error(error?.message || "Draft is no longer pending approval.");
  }

  return rejected as JournalArticleRecord;
}
