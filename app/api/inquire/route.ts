import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { sendLeadAlertEmail, isSmtpConfigured } from "@/lib/email/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      number,
      services,
      stage,
      timeline,
      budget,
      message,
      notes,
      source,
    } = body;

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    // Generate unique reference ticket ID
    const refId = `WBZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullMessage = (message || notes || "").trim();
    const leadSource = source || (body.isBot ? "WebziFire AI Bot" : "Website Direct");

    // 1. Persist to Supabase if available
    let persistedId: string | null = null;
    if (isSupabaseAdminConfigured()) {
      try {
        const admin = getSupabaseAdmin();
        const { data } = await admin
          .from("project_leads")
          .insert({
            reference_id: refId,
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone_whatsapp: number ? String(number).trim() : null,
            services: Array.isArray(services) ? services : services ? [String(services)] : [],
            stage: stage || null,
            timeline: timeline || null,
            budget: budget || null,
            message: fullMessage,
            source: leadSource,
            status: "new",
          })
          .select("id")
          .single();

        if (data?.id) persistedId = data.id;
      } catch (dbErr) {
        // Table might not exist yet; log gracefully and proceed to email
        console.warn("[Project Leads DB Warning]", dbErr);
      }
    }

    // 2. Dispatch Instant SMTP Alert Email to Founder
    let emailDispatched = false;
    if (isSmtpConfigured()) {
      try {
        await sendLeadAlertEmail({
          lead: {
            referenceId: refId,
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            number: number ? String(number).trim() : undefined,
            services: Array.isArray(services) ? services : services ? [String(services)] : [],
            stage: stage || undefined,
            timeline: timeline || undefined,
            budget: budget || undefined,
            message: fullMessage,
            source: leadSource,
          },
        });
        emailDispatched = true;
      } catch (mailErr) {
        console.error("[Lead Alert Email Error]", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      referenceId: refId,
      persistedId,
      emailDispatched,
      message: `Project scope registered successfully. A WebziFire principal director will review your brief and follow up within 24 hours.`,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Inquire API Error]", error);
    return NextResponse.json(
      { success: false, error: "Malformed payload or internal processing error." },
      { status: 500 }
    );
  }
}
