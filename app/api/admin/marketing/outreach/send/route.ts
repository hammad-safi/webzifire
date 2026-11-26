import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth/adminAuth";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { sendDirectMarketingEmail, isSmtpConfigured } from "@/lib/email/mailer";
import { auditEmailSpamShield } from "@/lib/marketing/spamShield";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { error: "SMTP is not configured. Please set SMTP_USER and SMTP_PASS in .env.local" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { id, to_email } = body;

    if (!id) {
      return NextResponse.json({ error: "Outreach message ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: outreach, error: fetchErr } = await supabase
      .from("b2b_outreach")
      .select("*, b2b_contacts(full_name, email), b2b_companies(name, official_email)")
      .eq("id", id)
      .single();

    if (fetchErr || !outreach) {
      return NextResponse.json({ error: "Outreach record not found" }, { status: 404 });
    }

    const targetEmail =
      to_email ||
      outreach.b2b_contacts?.email ||
      outreach.b2b_companies?.official_email;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "No recipient email found for this contact. Please provide a destination email." },
        { status: 400 }
      );
    }

    const subject = outreach.subject || `Inquiry for ${outreach.b2b_companies?.name || "your team"}`;

    // Idea 5: Email Spam & Bounce Shield (Pre-flight deliverability check)
    const shieldResult = auditEmailSpamShield(targetEmail, subject, outreach.message_content);
    if (!shieldResult.isSafeToSend) {
      return NextResponse.json(
        {
          error: `Spam & Bounce Shield: ${shieldResult.issues.join("; ")}`,
          shield: shieldResult
        },
        { status: 422 }
      );
    }

    const sendResult = await sendDirectMarketingEmail({
      to: targetEmail,
      subject,
      content: outreach.message_content,
    });

    if (!sendResult.success) {
      return NextResponse.json({ error: sendResult.error || "Failed to deliver email" }, { status: 500 });
    }

    const now = new Date().toISOString();
    await supabase
      .from("b2b_outreach")
      .update({
        status: "sent",
        sent_at: now,
        updated_at: now,
      })
      .eq("id", id);

    // If company is in 'ready_outreach' or 'qualified', advance to 'contacted'
    if (outreach.company_id) {
      await supabase
        .from("b2b_companies")
        .update({
          pipeline_stage: "contacted",
          stage_updated_at: now,
        })
        .eq("id", outreach.company_id);
    }

    return NextResponse.json({
      success: true,
      messageId: sendResult.messageId,
      sent_to: targetEmail,
    });
  } catch (err: any) {
    console.error("[MarketingSendAPI] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal error sending outreach email" }, { status: 500 });
  }
}
