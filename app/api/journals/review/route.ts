import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  publishApprovedArticle,
  rejectDraftArticle,
  runFounderRevisionPipeline,
} from "@/lib/automation/orchestrator";
import { JournalArticleRecord } from "@/lib/automation/types";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function lookupArticleByToken(token: string): Promise<{
  article: JournalArticleRecord | null;
  error?: string;
}> {
  if (!token || token.length < 32) {
    return { article: null, error: "Invalid or missing review token." };
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("journal_articles")
    .select("*")
    .eq("approval_token", token)
    .maybeSingle();

  if (error) {
    return { article: null, error: error.message };
  }
  if (!data) {
    return {
      article: null,
      error:
        "This review link has already been used, expired, or superseded by a newer revision.",
    };
  }

  const article = data as JournalArticleRecord;
  if (
    article.token_expires_at &&
    new Date(article.token_expires_at).getTime() < Date.now()
  ) {
    return {
      article: null,
      error: "This approval token has expired. You can re-issue it from the Admin Dashboard.",
    };
  }

  if (article.status !== "pending_approval") {
    return {
      article: null,
      error: `This article is currently "${article.status}" and is no longer awaiting approval.`,
    };
  }

  return { article };
}

/**
 * GET /api/journals/review?token=...
 * Read-only metadata fetch for the confirmation UI. NEVER mutates state on GET
 * so Gmail / corporate email security link scanners cannot accidentally publish drafts.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const { article, error } = await lookupArticleByToken(token);

    if (!article) {
      return NextResponse.json({ valid: false, error }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        category: article.category,
        summary: article.summary,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        primary_keyword: article.primary_keyword,
        secondary_keywords: article.secondary_keywords,
        image_url: article.image_url,
        image_alt: article.image_alt,
        word_count: article.word_count,
        read_time: article.read_time,
        quality_score: article.quality_score,
        quality_report: article.quality_report,
        revision_count: article.revision_count,
        status: article.status,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        valid: false,
        error: err instanceof Error ? err.message : "Failed to load draft.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journals/review
 * Executes explicit founder decision: approve | revise | reject.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const action = typeof body?.action === "string" ? body.action.trim() : "";
    const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";
    const regenerateImage = Boolean(body?.regenerateImage);

    const { article, error } = await lookupArticleByToken(token);
    if (!article) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    if (action === "approve") {
      const result = await publishApprovedArticle(article);
      return NextResponse.json({
        success: true,
        action: "approve",
        slug: result.article.slug,
        title: result.article.title,
        liveUrl: `/blog/${result.article.slug}`,
        confirmationSent: result.confirmationSent,
        message: "Article published live to WebziFire Journals and sitemap revalidated.",
      });
    }

    if (action === "revise") {
      if (feedback.length < 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Please provide revision instructions (at least 5 characters).",
          },
          { status: 400 }
        );
      }

      const revised = await runFounderRevisionPipeline({
        article,
        feedback,
        regenerateImage,
      });

      return NextResponse.json({
        success: true,
        action: "revise",
        slug: revised.article.slug,
        title: revised.article.title,
        qualityScore: revised.article.quality_score,
        wordCount: revised.article.word_count,
        emailSentTo: revised.emailSentTo,
        message: `AI revised the article, passed Quality Check (${revised.article.quality_score}/100), and sent a new approval email to ${revised.emailSentTo}.`,
      });
    }

    if (action === "reject") {
      await rejectDraftArticle(article, feedback || undefined);
      return NextResponse.json({
        success: true,
        action: "reject",
        slug: article.slug,
        title: article.title,
        message: "Article permanently rejected. It will never be published.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use approve, revise, or reject." },
      { status: 400 }
    );
  } catch (err) {
    console.error("[Journal Review POST Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed processing review action.",
      },
      { status: 500 }
    );
  }
}
