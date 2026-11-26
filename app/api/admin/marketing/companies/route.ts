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
    const id = searchParams.get("id");
    const search = searchParams.get("search")?.toLowerCase();
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const country = searchParams.get("country");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const supabase = getSupabaseAdmin();

    // If single company requested by id, fetch company + contacts + opportunities + outreach
    if (id) {
      const { data: company, error: compErr } = await supabase
        .from("b2b_companies")
        .select("*")
        .eq("id", id)
        .single();

      if (compErr || !company) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }

      const [contactsRes, oppsRes, outreachRes] = await Promise.all([
        supabase.from("b2b_contacts").select("*").eq("company_id", id).order("relevance_score", { ascending: false }),
        supabase.from("b2b_opportunities").select("*").eq("company_id", id).order("match_score", { ascending: false }),
        supabase.from("b2b_outreach").select("*").eq("company_id", id).order("created_at", { ascending: false })
      ]);

      return NextResponse.json({
        company,
        contacts: contactsRes.data || [],
        opportunities: oppsRes.data || [],
        outreach: outreachRes.data || []
      });
    }

    let query = supabase.from("b2b_companies").select("*").order("lead_score", { ascending: false });

    if (priority) {
      query = query.eq("lead_priority", priority);
    }
    if (status) {
      query = query.eq("lead_status", status);
    }
    if (country) {
      query = query.eq("country", country);
    }
    if (limit) {
      query = query.limit(limit);
    }
    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: companies, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let filtered = companies || [];
    if (search) {
      filtered = filtered.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(search) ||
          c.domain?.toLowerCase().includes(search) ||
          c.industry?.toLowerCase().includes(search) ||
          (c.technologies || []).some((t: string) => t.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ companies: filtered });
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
    const { id, pipeline_stage, lead_status, lead_priority, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (pipeline_stage !== undefined) updates.pipeline_stage = pipeline_stage;
    else if (lead_status !== undefined) updates.pipeline_stage = lead_status;
    if (lead_priority !== undefined) updates.lead_priority = lead_priority;
    if (notes !== undefined) updates.notes = notes;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_companies")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ company: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("b2b_companies").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
