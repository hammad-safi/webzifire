import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "wbz_seo_admin_session";

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
    "utf8"
  );
}

function getSigningSecret(): string {
  const secret =
    process.env.ADMIN_DASHBOARD_PASSWORD ||
    process.env.CRON_SECRET ||
    "webzifire-dev-fallback-secret-change-me";
  return `wbz-admin-jwt::${secret}`;
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_DASHBOARD_PASSWORD);
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createAdminSessionToken(): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      role: "admin",
      app: "webzifire-seo",
      iat: nowSec,
      exp: nowSec + 60 * 60 * 24 * 7,
    })
  );
  const data = `${header}.${payload}`;
  const sig = base64UrlEncode(
    crypto.createHmac("sha256", getSigningSecret()).update(data).digest()
  );
  return `${data}.${sig}`;
}

export async function verifyAdminSessionToken(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, sigB64] = parts;
    const expectedSig = base64UrlEncode(
      crypto
        .createHmac("sha256", getSigningSecret())
        .update(`${headerB64}.${payloadB64}`)
        .digest()
    );
    const sigBuf = Buffer.from(sigB64);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const nowSec = Math.floor(Date.now() / 1000);
    return (
      payload?.role === "admin" &&
      payload?.app === "webzifire-seo" &&
      typeof payload?.exp === "number" &&
      payload.exp > nowSec
    );
  } catch {
    return false;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}

export async function verifyCronOrAdminRequest(request: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization") || "";
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  return isAuthenticatedAdmin();
}
