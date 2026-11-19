import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/seo/articles
 * Paginated infinite-scroll retrieval for articles with optional keyword search and status filter.
 */
export async function GET(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase admin not configured." },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const search = (searchParams.get("search") || "").trim();
    const status = (searchParams.get("status") || "all").trim();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const admin = getSupabaseAdmin();
    let query: any = admin
      .from("journal_articles")
      .select(
        "id, slug, title, category, service_pillar, status, word_count, quality_score, revision_count, image_url, image_alt, image_prompt, summary, takeaway, content_blocks, faqs, internal_links, author, author_role, read_time, primary_keyword, approval_token, approval_email_sent_at, published_at, rejected_at, created_at, updated_at",
        { count: "exact" }
      );

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      // Search in title, slug, or primary_keyword
      query = query.or(
        `title.ilike.%${search}%,slug.ilike.%${search}%,primary_keyword.ilike.%${search}%,service_pillar.ilike.%${search}%`
      );
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const total = count ?? 0;
    const articles = data || [];
    const hasMore = to < total - 1;

    return NextResponse.json({
      articles,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (err) {
    console.error("[Admin SEO Articles GET Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load articles." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/seo/articles
 * Updates an article's metadata, title, content, image, or status.
 */
export async function PATCH(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Article ID is required." }, { status: 400 });
    }

    const allowedFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.title === "string") allowedFields.title = updates.title.trim();
    if (typeof updates.slug === "string") allowedFields.slug = updates.slug.trim().toLowerCase();
    if (typeof updates.category === "string") allowedFields.category = updates.category.trim();
    if (typeof updates.service_pillar === "string") allowedFields.service_pillar = updates.service_pillar.trim();
    if (typeof updates.summary === "string") allowedFields.summary = updates.summary.trim();
    if (typeof updates.takeaway === "string") allowedFields.takeaway = updates.takeaway.trim();
    if (typeof updates.image_url === "string") allowedFields.image_url = updates.image_url.trim();
    if (typeof updates.image_alt === "string") allowedFields.image_alt = updates.image_alt.trim();
    if (typeof updates.author === "string") allowedFields.author = updates.author.trim();
    if (typeof updates.author_role === "string") allowedFields.author_role = updates.author_role.trim();
    if (typeof updates.read_time === "string") allowedFields.read_time = updates.read_time.trim();
    if (typeof updates.primary_keyword === "string") allowedFields.primary_keyword = updates.primary_keyword.trim();

    if (Array.isArray(updates.content_blocks)) allowedFields.content_blocks = updates.content_blocks;
    if (Array.isArray(updates.faqs)) allowedFields.faqs = updates.faqs;

    if (typeof updates.status === "string") {
      const validStatuses = [
        "drafting",
        "qa_revising",
        "pending_approval",
        "revision_requested",
        "published",
        "rejected",
      ];
      if (validStatuses.includes(updates.status)) {
        allowedFields.status = updates.status;
        if (updates.status === "published" && !updates.published_at) {
          allowedFields.published_at = new Date().toISOString();
        } else if (updates.status === "rejected") {
          allowedFields.rejected_at = new Date().toISOString();
        }
      }
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("journal_articles")
      .update(allowedFields)
      .eq("id", id)
      .select(
        "id, slug, title, category, service_pillar, status, word_count, quality_score, revision_count, image_url, image_alt, summary, takeaway, content_blocks, faqs, primary_keyword, approval_token, published_at, created_at, updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, article: data });
  } catch (err) {
    console.error("[Admin SEO Articles PATCH Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update article." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/seo/articles
 * Deletes an article by id, cascading to its background jobs, metrics, and recommendations.
 */
export async function DELETE(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Article ID is required for deletion." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Check if article exists
    const { data: article, error: fetchErr } = await admin
      .from("journal_articles")
      .select("id, title, slug, image_url")
      .eq("id", id)
      .single();

    if (fetchErr || !article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    // Delete record from journal_articles (cascade will handle child tables)
    const { error: delErr } = await admin
      .from("journal_articles")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedTitle: article.title,
    });
  } catch (err) {
    console.error("[Admin SEO Articles DELETE Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete article." },
      { status: 500 }
    );
  }
}
