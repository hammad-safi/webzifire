import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { sendDirectMarketingEmail, isSmtpConfigured } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

export interface FounderDigestData {
  generatedAt: string;
  hotLeadsCount: number;
  hotLeads: Array<{ name: string; domain: string; score: number; country: string }>;
  followUpsDueCount: number;
  followUpsDue: Array<{ name: string; contactName: string; daysElapsed: number }>;
  pendingDraftsCount: number;
  pipelineStats: {
    totalDiscovered: number;
    qualified: number;
    contacted: number;
    replied: number;
  };
}

/**
 * Calculates the current daily digest figures.
 */
async function computeDigest(): Promise<FounderDigestData> {
  const supabase = getSupabaseAdmin();

  // 1. Fetch companies
  const { data: companies } = await supabase
    .from("b2b_companies")
    .select("id, name, domain, country, lead_score, lead_priority, pipeline_stage")
    .order("lead_score", { ascending: false });

  const allComps: any[] = companies || [];
  const hotLeads = allComps
    .filter((c: any) => (c.lead_score || 0) >= 80)
    .slice(0, 5)
    .map((c: any) => ({
      name: c.name,
      domain: c.domain,
      score: c.lead_score || 0,
      country: c.country
    }));

  // 2. Fetch outreach to calculate follow-ups due & pending drafts
  const { data: outreach } = await supabase
    .from("b2b_outreach")
    .select("id, company_id, contact_id, channel, message_type, status, sent_at, b2b_contacts(full_name), b2b_companies(name)");

  const allOutreach: any[] = outreach || [];
  const pendingDraftsCount = allOutreach.filter((o: any) => o.status === "draft").length;

  // Compute follow-ups due (4-day alarm)
  const initialEmailsSent = allOutreach.filter(
    (o: any) => o.channel === "email" && o.message_type === "cold_email" && o.status === "sent" && o.sent_at
  );

  const followUpsDue: Array<{ name: string; contactName: string; daysElapsed: number }> = [];

  for (const init of initialEmailsSent) {
    const days = (Date.now() - new Date(init.sent_at!).getTime()) / (1000 * 60 * 60 * 24);
    if (days >= 4) {
      // Check if follow up sent or replied
      const followUp = allOutreach.find(
        (o: any) => o.contact_id === init.contact_id && o.message_type === "follow_up"
      );
      if (followUp && followUp.status !== "sent" && followUp.status !== "replied") {
        followUpsDue.push({
          name: init.b2b_companies?.name || "Company",
          contactName: init.b2b_contacts?.full_name || "Decision-Maker",
          daysElapsed: Math.floor(days)
        });
      }
    }
  }

  return {
    generatedAt: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
    hotLeadsCount: hotLeads.length,
    hotLeads,
    followUpsDueCount: followUpsDue.length,
    followUpsDue,
    pendingDraftsCount,
    pipelineStats: {
      totalDiscovered: allComps.length,
      qualified: allComps.filter((c: any) => c.pipeline_stage === "qualified").length,
      contacted: allComps.filter((c: any) => c.pipeline_stage === "contacted").length,
      replied: allComps.filter((c: any) => c.pipeline_stage === "replied").length
    }
  };
}

export async function GET() {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const digest = await computeDigest();
    return NextResponse.json({ digest });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to compile digest" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const recipientEmail = body.to_email || process.env.ADMIN_APPROVAL_EMAIL || process.env.SMTP_USER || "inquire@webzifire.com";

    const digest = await computeDigest();

    let emailSent = false;
    let messageId: string | null = null;

    if (isSmtpConfigured() && recipientEmail) {
      const hotLeadsText =
        digest.hotLeads.length > 0
          ? digest.hotLeads
              .map((l) => `  • ${l.name} (${l.country}) — Lead Score: ${l.score}/100 [${l.domain}]`)
              .join("\n")
          : "  • No new hot leads discovered in the last 24h.";

      const followUpsText =
        digest.followUpsDue.length > 0
          ? digest.followUpsDue
              .map((f) => `  • 🔔 ${f.contactName} @ ${f.name} — ${f.daysElapsed} days since Step 1 (Due Now)`)
              .join("\n")
          : "  • No 4-day follow-ups due right now. You're completely up to date!";

      const digestContent = `Good morning!

Here is your WebziFire B2B Prospecting & Outreach Morning Digest (${digest.generatedAt}):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PIPELINE PULSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total Prospects Discovered: ${digest.pipelineStats.totalDiscovered}
• Qualified Opportunities: ${digest.pipelineStats.qualified}
• Actively Contacted: ${digest.pipelineStats.contacted}
• Client Responses Received: ${digest.pipelineStats.replied}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 HOT LEADS READY FOR ACTION (${digest.hotLeadsCount})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${hotLeadsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 4-DAY FOLLOW-UP ALARMS (${digest.followUpsDueCount} DUE TODAY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${followUpsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✉️ OUTREACH DESK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ${digest.pendingDraftsCount} personalized outreach message drafts are waiting for your 1-click review.

Open your Admin Portal to approve and send with 1 click:
https://webzifire.com/admin/marketing

Have a high-growth day!
— WebziFire Autonomous BD Engine`;

      const res = await sendDirectMarketingEmail({
        to: recipientEmail,
        subject: `🔥 B2B Daily Digest: ${digest.hotLeadsCount} Hot Leads & ${digest.followUpsDueCount} Follow-Ups Due`,
        content: digestContent
      });

      emailSent = res.success;
      messageId = res.messageId || null;
    }

    return NextResponse.json({
      success: true,
      emailSent,
      sentTo: recipientEmail,
      messageId,
      digest
    });
  } catch (err: any) {
    console.error("[FounderDigestAPI] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal error compiling digest" }, { status: 500 });
  }
}
