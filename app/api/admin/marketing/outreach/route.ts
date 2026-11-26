import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");
    const companyId = searchParams.get("company_id");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const supabase = getSupabaseAdmin();
    let query = supabase.from("b2b_outreach").select("*, b2b_companies(name, domain, lead_score), b2b_contacts(full_name, job_title, email, linkedin_url)").order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (channel) {
      query = query.eq("channel", channel);
    }
    if (companyId) {
      query = query.eq("company_id", companyId);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data: outreach, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ outreach: outreach || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      subject,
      content,
      status,
      action // 'approve' | 'mark_sent' | 'mark_replied'
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Outreach ID required" }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (subject !== undefined) updates.subject = subject;
    if (content !== undefined) updates.message_content = content;
    if (body.message_content !== undefined) updates.message_content = body.message_content;

    const now = new Date().toISOString();
    if (action === "approve") {
      updates.status = "approved";
      updates.approved_at = now;
    } else if (action === "mark_sent") {
      updates.status = "sent";
      updates.sent_at = now;
    } else if (action === "mark_replied") {
      updates.status = "replied";
      updates.replied_at = now;
      if (body.response_sentiment || body.reply_sentiment) {
        updates.reply_sentiment = body.response_sentiment || body.reply_sentiment;
      }
    } else if (status !== undefined) {
      updates.status = status;
      if (status === "approved") {
        updates.approved_at = now;
      }
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_outreach")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ outreach: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
