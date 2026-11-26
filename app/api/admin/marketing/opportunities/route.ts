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
    const companyId = searchParams.get("company_id");
    const oppType = searchParams.get("type");
    const oppStatus = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const supabase = getSupabaseAdmin();
    let query = supabase.from("b2b_opportunities").select("*, b2b_companies(name, domain, lead_score, country)").order("match_score", { ascending: false });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }
    if (oppType) {
      query = query.eq("opportunity_type", oppType);
    }
    if (oppStatus) {
      query = query.eq("opportunity_status", oppStatus);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data: opportunities, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunities: opportunities || [] });
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
    const { id, opportunity_status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Opportunity ID required" }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (opportunity_status !== undefined) updates.opportunity_status = opportunity_status;
    if (notes !== undefined) updates.notes = notes;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_opportunities")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunity: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
