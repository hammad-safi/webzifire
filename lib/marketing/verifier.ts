/**
 * Verification & Normalization helpers for B2B Prospecting
 */

export function normalizeDomain(rawUrl: string): string {
  if (!rawUrl) return "";
  let clean = rawUrl.trim().toLowerCase();
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  clean = clean.split("/")[0].split("?")[0].split("#")[0];
  return clean.replace(/[^a-z0-9.-]/g, "");
}

export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

export function isGenericEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  const genericPrefixes = [
    "info@",
    "contact@",
    "hello@",
    "support@",
    "admin@",
    "inquiries@",
    "sales@",
    "jobs@",
    "careers@",
  ];
  return genericPrefixes.some((prefix) => lower.startsWith(prefix));
}

export function calculateLeadPriority(score: number): "Hot Lead" | "High Priority" | "Medium Priority" | "Low Priority" {
  if (score >= 85) return "Hot Lead";
  if (score >= 70) return "High Priority";
  if (score >= 50) return "Medium Priority";
  return "Low Priority";
}
