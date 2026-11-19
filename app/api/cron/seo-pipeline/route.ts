import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import {
  getAutomationSettings,
  isScheduledRunDueToday,
  runFullArticleCreationPipeline,
} from "@/lib/automation/orchestrator";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Daily Vercel Cron endpoint (GET /api/cron/seo-pipeline).
 * Checks automation_settings (enabled + schedule_days + cooldown) before running.
 * NEVER auto-publishes; always stops at pending_approval + approval email.
 */
export async function GET(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    const settings = await getAutomationSettings();
    if (!force) {
      const check = isScheduledRunDueToday(settings);
      if (!check.due) {
        return NextResponse.json({
          skipped: true,
          reason: check.reason,
          automation_enabled: settings.automation_enabled,
        });
      }
    }

    const result = await runFullArticleCreationPipeline({
      isManualTest: force,
    });

    return NextResponse.json({
      success: true,
      runId: result.runId,
      articleId: result.article.id,
      slug: result.article.slug,
      title: result.article.title,
      wordCount: result.article.word_count,
      qualityScore: result.article.quality_score,
      status: result.article.status,
      emailSentTo: result.emailSentTo,
    });
  } catch (err) {
    console.error("[Cron SEO Pipeline Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Pipeline execution failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Manual Test / On-Demand Run (POST /api/cron/seo-pipeline) from Admin Dashboard or CLI.
 * Allows testing 1 real article while recurring automation_enabled stays PAUSED.
 */
export async function POST(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const preferredPillar =
      typeof body?.preferredPillar === "string" ? body.preferredPillar : undefined;

    const result = await runFullArticleCreationPipeline({
      preferredPillar,
      isManualTest: true,
    });

    return NextResponse.json({
      success: true,
      runId: result.runId,
      articleId: result.article.id,
      slug: result.article.slug,
      title: result.article.title,
      wordCount: result.article.word_count,
      qualityScore: result.article.quality_score,
      status: result.article.status,
      emailSentTo: result.emailSentTo,
    });
  } catch (err) {
    console.error("[Manual SEO Pipeline Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Manual test run failed",
      },
      { status: 500 }
    );
  }
}
