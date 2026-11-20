import { NextResponse } from "next/server";
import { verifyCronOrAdminRequest } from "@/lib/auth/adminAuth";
import {
  getAllExistingTargetKeywords,
  checkKeywordCannibalization,
} from "@/lib/seo/keywordCannibalization";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/seo/keywords/check
 * Checks a candidate keyword against all existing WebziFire articles and topic queue
 * to prevent keyword cannibalization before writing or creating a topic.
 */
export async function POST(request: Request) {
  try {
    const authorized = await verifyCronOrAdminRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const keyword = typeof body?.keyword === "string" ? body.keyword.trim() : "";
    const currentSlug = typeof body?.currentSlug === "string" ? body.currentSlug.trim() : undefined;

    if (!keyword) {
      return NextResponse.json(
        { error: "A candidate keyword is required." },
        { status: 400 }
      );
    }

    const existingKeywords = await getAllExistingTargetKeywords();
    const result = checkKeywordCannibalization(keyword, existingKeywords, currentSlug);

    return NextResponse.json({
      success: true,
      result,
      totalExistingKeywords: existingKeywords.length,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Keyword Check API Error]", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Keyword cannibalization check failed.",
      },
      { status: 500 }
    );
  }
}
