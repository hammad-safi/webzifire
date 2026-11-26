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
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const supabase = getSupabaseAdmin();
    let query = supabase.from("b2b_contacts").select("*, b2b_companies(name, domain, lead_score)").order("relevance_score", { ascending: false });

    if (companyId) {
      query = query.eq("company_id", companyId);
    }
    if (limit) {
      query = query.limit(limit);
    }

    const { data: contacts, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts: contacts || [] });
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
    const { id, email, email_status, linkedin_url, phone, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Contact ID required" }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (email !== undefined) updates.email = email;
    if (email_status !== undefined) updates.email_status = email_status;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
    if (phone !== undefined) updates.phone = phone;
    if (notes !== undefined) updates.notes = notes;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_contacts")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contact: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
