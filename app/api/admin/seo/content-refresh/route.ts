import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import { runContentRefreshAudit } from "@/lib/automation/jobs/contentRefresh";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/seo/content-refresh
 * Manual trigger for 30–60 day content refresh audit directly from the Admin Dashboard.
 */
export async function POST(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const forceAll = body?.forceAll !== false; // Default true when manually triggered from admin
    const minAgeDays = typeof body?.minAgeDays === "number" ? body.minAgeDays : 30;

    const result = await runContentRefreshAudit({
      minAgeDays,
      forceAll,
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Audit completed! ${result.totalAudited} articles analyzed, ${result.recommendationsCreated} recommendations generated. Executive digest sent to founder email.`,
    });
  } catch (err) {
    console.error("[Admin Content Refresh Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Content refresh audit failed.",
      },
      { status: 500 }
    );
  }
}
