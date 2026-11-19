import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import { syncSeoPerformanceMetrics } from "@/lib/seo/googleMonitoring";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

async function handleSync(request: Request) {
  const authorized = await verifyCronOrAdminRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncSeoPerformanceMetrics();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[SEO Sync Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "SEO performance sync failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
