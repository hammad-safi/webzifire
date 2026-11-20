import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import { runContentRefreshAudit } from "@/lib/automation/jobs/contentRefresh";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Scheduled Cron Endpoint (GET /api/cron/content-refresh).
 * Analyzes published articles >= 30 days old and emails recommendations to the founder.
 */
export async function GET(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const forceAll = url.searchParams.get("force") === "true";
    const minAgeDays = url.searchParams.get("minAge")
      ? Number(url.searchParams.get("minAge"))
      : 30;

    const result = await runContentRefreshAudit({
      minAgeDays,
      forceAll,
    });

    return NextResponse.json({
      success: true,
      totalAudited: result.totalAudited,
      underperformingCount: result.underperformingCount,
      outdatedCount: result.outdatedCount,
      recommendationsCreated: result.recommendationsCreated,
      emailSentTo: result.emailSentTo,
      auditedAt: result.auditedAt,
    });
  } catch (err) {
    console.error("[Cron Content Refresh Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Content refresh audit failed.",
      },
      { status: 500 }
    );
  }
}

/**
 * On-Demand Execution (POST /api/cron/content-refresh).
 */
export async function POST(request: Request) {
  return GET(request);
}
