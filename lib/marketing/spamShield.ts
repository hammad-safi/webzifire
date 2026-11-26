/**
 * Email Spam & Bounce Shield (Idea 5)
 * Audits emails before delivery to protect domain reputation and maximize primary inbox placement.
 */

export interface SpamShieldResult {
  score: number; // 0 to 100
  rating: "clean" | "warning" | "danger";
  isSafeToSend: boolean;
  issues: string[];
  recommendations: string[];
}

const HIGH_RISK_SPAM_WORDS = [
  "100% free",
  "free money",
  "risk free",
  "risk-free",
  "guaranteed",
  "make money",
  "act now",
  "urgent",
  "no obligation",
  "special promotion",
  "winner",
  "click here",
  "buy direct",
  "exclusive deal",
  "no cost",
  "cash bonus",
  "miracle",
  "pure profit"
];

const MEDIUM_RISK_SPAM_WORDS = [
  "cheap",
  "order now",
  "unlimited",
  "congratulations",
  "incredible deal",
  "limited time",
  "lowest price",
  "save big",
  "apply now"
];

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "trashmail.com",
  "sharklasers.com",
  "yopmail.com"
]);

/**
 * Validates recipient email syntax and checks for disposable domains.
 */
export function validateRecipientEmail(email?: string | null): {
  isValid: boolean;
  reason?: string;
} {
  if (!email || typeof email !== "string") {
    return { isValid: false, reason: "Missing email address" };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, reason: "Malformed email address syntax (RFC 5322 violation)" };
  }

  const domain = cleanEmail.split("@")[1];
  if (!domain || domain.includes("..") || !domain.includes(".")) {
    return { isValid: false, reason: "Invalid domain structure" };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { isValid: false, reason: "Disposable/temporary email domains are blocked to protect domain bounce rate" };
  }

  return { isValid: true };
}

/**
 * Audits cold email copy and subject line against inbox spam filters.
 */
export function auditEmailSpamShield(
  recipientEmail?: string | null,
  subject?: string | null,
  bodyText?: string | null
): SpamShieldResult {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 1. Email validation
  const emailCheck = validateRecipientEmail(recipientEmail);
  if (!emailCheck.isValid) {
    score -= 40;
    issues.push(emailCheck.reason || "Invalid recipient address");
  }

  const fullText = `${subject || ""} ${bodyText || ""}`.toLowerCase();
  const cleanSubject = subject || "";

  // 2. ALL CAPS check in Subject Line
  const upperCaseSubjectWords = cleanSubject
    .split(/\s+/)
    .filter((w) => w.length > 2 && w === w.toUpperCase() && /^[A-Z]+$/.test(w));

  if (upperCaseSubjectWords.length > 0) {
    score -= 15;
    issues.push(`Subject line contains ALL CAPS words: "${upperCaseSubjectWords.join(", ")}"`);
    recommendations.push("Use standard sentence or title case in subject lines to avoid aggressive spam filters.");
  }

  // 3. Excessive punctuation check (!! or ???)
  if (/!{2,}/.test(fullText) || /\?{2,}/.test(fullText)) {
    score -= 10;
    issues.push("Multiple consecutive exclamation or question marks detected.");
    recommendations.push("Keep punctuation professional and minimal.");
  }

  // 4. Excessive currency symbols ($$$)
  if (/(\$|\€|\£){2,}/.test(fullText)) {
    score -= 15;
    issues.push("Excessive currency symbols detected ($$$).");
  }

  // 5. High-risk spam words check
  for (const word of HIGH_RISK_SPAM_WORDS) {
    if (fullText.includes(word)) {
      score -= 20;
      issues.push(`High-risk spam trigger phrase found: "${word}"`);
      recommendations.push(`Replace or remove promotional phrase "${word}".`);
    }
  }

  // 6. Medium-risk spam words check
  for (const word of MEDIUM_RISK_SPAM_WORDS) {
    if (fullText.includes(word)) {
      score -= 8;
      issues.push(`Promotional buzzword detected: "${word}"`);
    }
  }

  // 7. Length check (Cold emails should be concise)
  const wordCount = (bodyText || "").trim().split(/\s+/).length;
  if (wordCount > 180) {
    score -= 5;
    recommendations.push("Email is over 180 words. High-performing B2B cold emails perform best between 60–110 words.");
  }

  // Bound score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  let rating: "clean" | "warning" | "danger" = "clean";
  let isSafeToSend = true;

  if (score < 60 || !emailCheck.isValid) {
    rating = "danger";
    isSafeToSend = false;
  } else if (score < 85) {
    rating = "warning";
    isSafeToSend = true;
  }

  return {
    score,
    rating,
    isSafeToSend,
    issues,
    recommendations
  };
}
