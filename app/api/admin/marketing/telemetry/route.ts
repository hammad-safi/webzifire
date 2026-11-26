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

    const [companiesRes, contactsRes, oppsRes, outreachRes, dailyReportsRes] = await Promise.all([
      supabase.from("b2b_companies").select("id, lead_score, lead_priority, pipeline_stage, country, industry"),
      supabase.from("b2b_contacts").select("id, email_status, is_decision_maker"),
      supabase.from("b2b_opportunities").select("id, opportunity_type, status, match_score"),
      supabase.from("b2b_outreach").select("id, channel, message_type, status"),
      supabase.from("b2b_daily_reports").select("*").order("report_date", { ascending: false }).limit(1)
    ]);

    const companies = companiesRes.data || [];
    const contacts = contactsRes.data || [];
    const opportunities = oppsRes.data || [];
    const outreach = outreachRes.data || [];
    const latestReport = dailyReportsRes.data?.[0] || null;

    const totalCompanies = companies.length;
    const hotLeads = companies.filter((c: any) => (c.lead_score ?? 0) >= 85).length;
    const highPriority = companies.filter((c: any) => (c.lead_score ?? 0) >= 70 && (c.lead_score ?? 0) < 85).length;
    const mediumPriority = companies.filter((c: any) => (c.lead_score ?? 0) >= 50 && (c.lead_score ?? 0) < 70).length;
    const lowPriority = companies.filter((c: any) => (c.lead_score ?? 0) < 50).length;

    const verifiedContacts = contacts.filter((ct: any) => ct.email_status === "verified").length;
    const totalDecisionMakers = contacts.filter((ct: any) => ct.is_decision_maker).length;

    const pendingDrafts = outreach.filter((o: any) => o.status === "draft").length;
    const approvedDrafts = outreach.filter((o: any) => o.status === "approved").length;
    const sentOutreach = outreach.filter((o: any) => o.status === "sent").length;
    const repliedOutreach = outreach.filter((o: any) => o.status === "replied").length;

    // Pipeline funnel calculation
    const pipelineFunnel = [
      { stage: "Discovered", count: totalCompanies },
      { stage: "Qualified (Score ≥ 50)", count: hotLeads + highPriority + mediumPriority },
      { stage: "Hot Prospects (Score ≥ 85)", count: hotLeads },
      { stage: "Decision-Makers Mapped", count: contacts.length },
      { stage: "Opportunities Identified", count: opportunities.length },
      { stage: "Outreach Prepared", count: outreach.length },
      { stage: "Approved & Sent", count: sentOutreach },
      { stage: "Replies Received", count: repliedOutreach }
    ];

    return NextResponse.json({
      summary: {
        total_companies: totalCompanies,
        hot_leads: hotLeads,
        high_priority: highPriority,
        medium_priority: mediumPriority,
        low_priority: lowPriority,
        total_contacts: contacts.length,
        verified_contacts: verifiedContacts,
        decision_makers: totalDecisionMakers,
        total_opportunities: opportunities.length,
        active_opportunities: opportunities.filter((o: any) => o.opportunity_status !== "closed").length,
        total_outreach: outreach.length,
        pending_outreach_approval: pendingDrafts,
        approved_outreach: approvedDrafts,
        sent_outreach: sentOutreach,
        replied_outreach: repliedOutreach
      },
      pipeline_funnel: pipelineFunnel,
      latest_daily_report: latestReport
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
