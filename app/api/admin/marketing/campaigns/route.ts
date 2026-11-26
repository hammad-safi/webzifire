import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: campaigns, error } = await supabase
      .from("b2b_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      target_countries,
      target_industries,
      target_company_sizes,
      target_technologies,
      keywords,
      min_lead_score,
      is_active
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    const payload = {
      name,
      description: description || null,
      target_countries: target_countries || ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France'],
      target_industries: target_industries || ['SaaS', 'Software Agency', 'Technology Startup'],
      target_company_sizes: target_company_sizes || ['11-50 employees', '51-200 employees'],
      target_technologies: target_technologies || ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      keywords: keywords || ['SaaS', 'Web Application', 'ERP'],
      min_lead_score: min_lead_score !== undefined ? min_lead_score : 50,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_campaigns")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("b2b_campaigns")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
