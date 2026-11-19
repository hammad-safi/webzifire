import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminPasswordConfigured,
  isAuthenticatedAdmin,
  verifyAdminPassword,
} from "@/lib/auth/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAuthenticatedAdmin();
  return NextResponse.json({
    authenticated,
    configured: isAdminPasswordConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    if (!isAdminPasswordConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ADMIN_DASHBOARD_PASSWORD is not configured in environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: "Login failed." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
