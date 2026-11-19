import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, number, services, stage, timeline, budget, message, notes } = body;

    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    // Generate unique reference ticket ID
    const refId = `WBZ-${Math.floor(100000 + Math.random() * 900000)}`;

    // In a real production deployment, this would dispatch via Resend, SendGrid, or CRM webhook (e.g., HubSpot / Slack)
    console.log(`[WebziFire Lead Received] Ref: ${refId} | Client: ${name} <${email}>`);

    return NextResponse.json({
      success: true,
      referenceId: refId,
      message: `Project scope registered successfully. A WebziFire principal director will review your brief and follow up within 24 hours.`,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Malformed payload or internal processing error." },
      { status: 500 }
    );
  }
}
