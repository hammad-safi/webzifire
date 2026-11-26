import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { runProspectingSprint } from "@/lib/marketing/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s for full multi-agent workflow

export async function POST(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const campaignId = body.campaign_id;
    const batchLimit = Math.min(Math.max(body.batch_limit || 2, 1), 5); // 1-5 companies per sprint to respect execution bounds

    const sprintResult = await runProspectingSprint(campaignId, batchLimit);

    return NextResponse.json({
      success: true,
      result: sprintResult
    });
  } catch (err: any) {
    console.error("[MarketingRunAPI] Error running sprint:", err);
    return NextResponse.json({
      success: false,
      error: err?.message || "Internal error running prospecting sprint"
    }, { status: 500 });
  }
}
