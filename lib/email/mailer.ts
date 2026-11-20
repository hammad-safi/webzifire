import tls from "tls";
import net from "net";
import crypto from "crypto";
import { JournalArticleRecord, QualityReport } from "@/lib/automation/types";

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}

export function getApprovalRecipientEmail(overrideEmail?: string | null): string {
  return (
    overrideEmail ||
    process.env.ADMIN_APPROVAL_EMAIL ||
    process.env.SMTP_USER ||
    ""
  );
}

export function getSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function encodeHeaderUtf8(str: string): string {
  return `=?UTF-8?B?${Buffer.from(str, "utf8").toString("base64")}?=`;
}

function wrapBase64(b64: string): string {
  return b64.match(/.{1,76}/g)?.join("\r\n") || b64;
}

/**
 * Zero-dependency RFC 5321/4954 SMTP-over-TLS client supporting Gmail App Password
 * (smtp.gmail.com:465) and Hostinger SMTP (smtp.hostinger.com:465) + STARTTLS (587).
 */
async function sendMailViaSmtp(params: {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const useImplicitTls =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const messageId = `<wbz-${crypto.randomBytes(12).toString("hex")}@webzifire.com>`;

  const mimeMessage = [
    `From: ${encodeHeaderUtf8(params.fromName)} <${params.fromEmail}>`,
    `To: <${params.to}>`,
    `Subject: ${encodeHeaderUtf8(params.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    wrapBase64(Buffer.from(params.html, "utf8").toString("base64")),
    `.`,
  ].join("\r\n");

  return new Promise((resolve, reject) => {
    let socket: tls.TLSSocket | net.Socket = useImplicitTls
      ? tls.connect({ host, port, servername: host, rejectUnauthorized: true })
      : net.connect({ host, port });

    socket.setTimeout(25000);

    let buffer = "";
    let step = 0;
    let settled = false;

    const fail = (err: Error) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {}
      reject(err);
    };

    const done = () => {
      if (settled) return;
      settled = true;
      try {
        socket.end();
      } catch {}
      resolve({ messageId });
    };

    const sendLine = (line: string) => {
      socket.write(`${line}\r\n`);
    };

    const handleResponse = (code: number, fullLine: string) => {
      if (code >= 400) {
        return fail(new Error(`SMTP error (${code}) at step ${step}: ${fullLine.trim()}`));
      }

      if (step === 0) {
        // Greeting 220
        step = 1;
        sendLine("EHLO webzifire.com");
      } else if (step === 1 && !useImplicitTls) {
        // Upgrade plain socket via STARTTLS
        step = 2;
        sendLine("STARTTLS");
      } else if (step === 2 && !useImplicitTls) {
        step = 3;
        const plain = socket;
        plain.removeAllListeners("data");
        socket = tls.connect({
          socket: plain,
          servername: host,
          rejectUnauthorized: true,
        });
        attachListeners(socket);
        sendLine("EHLO webzifire.com");
      } else if ((step === 1 && useImplicitTls) || step === 3) {
        step = 4;
        sendLine("AUTH LOGIN");
      } else if (step === 4) {
        step = 5;
        sendLine(Buffer.from(user, "utf8").toString("base64"));
      } else if (step === 5) {
        step = 6;
        sendLine(Buffer.from(pass, "utf8").toString("base64"));
      } else if (step === 6) {
        step = 7;
        sendLine(`MAIL FROM:<${params.fromEmail}>`);
      } else if (step === 7) {
        step = 8;
        sendLine(`RCPT TO:<${params.to}>`);
      } else if (step === 8) {
        step = 9;
        sendLine("DATA");
      } else if (step === 9) {
        step = 10;
        socket.write(`${mimeMessage}\r\n`);
      } else if (step === 10) {
        step = 11;
        sendLine("QUIT");
        done();
      }
    };

    const attachListeners = (sock: tls.TLSSocket | net.Socket) => {
      sock.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        const lines = buffer.split("\r\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.length < 3) continue;
          // Multi-line SMTP responses have '-' at index 3 (e.g. "250-PIPELINING");
          // wait for the final line with space at index 3 ("250 OK").
          if (line.length >= 4 && line[3] === "-") continue;
          const code = Number(line.slice(0, 3));
          if (!Number.isNaN(code)) {
            handleResponse(code, line);
          }
        }
      });
      sock.on("error", (err) => fail(err));
      sock.on("timeout", () => fail(new Error("SMTP connection timed out")));
    };

    attachListeners(socket);
  });
}

async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string; to: string }> {
  const fromName = process.env.SMTP_FROM_NAME || "WebziFire Autonomous SEO";

  // Optional Resend HTTPS transport if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY && !process.env.SMTP_PASS) {
    const fromEmail = process.env.SMTP_USER || "onboarding@resend.dev";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    return { messageId: data.id || "resend-ok", to: params.to };
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP credentials not configured. Set SMTP_USER and SMTP_PASS (Gmail App Password or Hostinger SMTP) in .env.local."
    );
  }

  const res = await sendMailViaSmtp({
    fromName,
    fromEmail: process.env.SMTP_USER,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  return { messageId: res.messageId, to: params.to };
}

/**
 * Step 6: Sends a comprehensive, dark-branded Approval Email directly to the founder's inbox.
 * Contains title, preview, featured image, SEO breakdown, QA report, and Approve/Revise/Reject actions.
 */
export async function sendArticleApprovalEmail(params: {
  article: JournalArticleRecord;
  recipientEmail?: string | null;
}): Promise<{ messageId: string; to: string }> {
  const { article } = params;
  const to = getApprovalRecipientEmail(params.recipientEmail);
  if (!to) {
    throw new Error("ADMIN_APPROVAL_EMAIL is not configured.");
  }

  const baseUrl = getSiteBaseUrl();
  const token = article.approval_token;
  if (!token) {
    throw new Error("Cannot send approval email without an active approval_token.");
  }

  const approveUrl = `${baseUrl}/journals/review?token=${encodeURIComponent(token)}&action=approve`;
  const reviseUrl = `${baseUrl}/journals/review?token=${encodeURIComponent(token)}&action=revise`;
  const rejectUrl = `${baseUrl}/journals/review?token=${encodeURIComponent(token)}&action=reject`;
  const previewUrl = `${baseUrl}/blog/${encodeURIComponent(article.slug)}?preview=${encodeURIComponent(token)}`;

  const qa = (article.quality_report || {}) as QualityReport;
  const checks = Array.isArray(qa.checks) ? qa.checks : [];
  const blocks = Array.isArray(article.content_blocks) ? article.content_blocks : [];

  const previewHtml = blocks
    .slice(0, 7)
    .map((b) => {
      if (b.type === "heading2") {
        return `<h3 style="color:#F5EFE6;font-size:18px;margin:20px 0 8px 0;font-weight:600;">${escapeHtml(b.text || "")}</h3>`;
      }
      if (b.type === "heading3") {
        return `<h4 style="color:#D8CFC2;font-size:15px;margin:14px 0 6px 0;font-weight:600;">${escapeHtml(b.text || "")}</h4>`;
      }
      if (b.type === "list" && Array.isArray(b.items)) {
        return `<ul style="color:#C4B5A5;font-size:14px;line-height:1.6;padding-left:20px;margin:10px 0;">${b.items
          .map((it) => `<li style="margin-bottom:4px;">${escapeHtml(it)}</li>`)
          .join("")}</ul>`;
      }
      if (b.type === "example" || b.type === "callout") {
        return `<div style="background:#1B0E10;border-left:3px solid #D6334A;padding:12px 14px;border-radius:8px;margin:12px 0;"><div style="color:#D6334A;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px;">${escapeHtml(b.title || "Example")}</div><div style="color:#D8CFC2;font-size:13px;line-height:1.6;">${escapeHtml(b.text || "")}</div></div>`;
      }
      return `<p style="color:#C4B5A5;font-size:14px;line-height:1.7;margin:10px 0;">${escapeHtml(b.text || "")}</p>`;
    })
    .join("");

  const qaChecksHtml = checks
    .map(
      (c) => `
      <tr>
        <td style="padding:7px 10px;border-bottom:1px solid #2C181B;font-size:12px;color:#F5EFE6;">
          ${c.passed ? "✅" : "⚠️"} ${escapeHtml(c.name)}
        </td>
        <td style="padding:7px 10px;border-bottom:1px solid #2C181B;font-size:12px;color:#C4B5A5;text-align:right;">
          ${escapeHtml(c.details)}
        </td>
      </tr>`
    )
    .join("");

  const revisionTag =
    article.revision_count > 0 ? ` [Revised v${article.revision_count + 1}]` : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#0B0607;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#F5EFE6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0B0607;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;width:100%;background-color:#140A0C;border:1px solid #2C181B;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:linear-gradient(135deg,#260B11 0%,#140A0C 70%);border-bottom:1px solid #2C181B;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D6334A;font-weight:700;">
                ✦ WEBZIFIRE AUTONOMOUS SEO DESK${escapeHtml(revisionTag)}
              </div>
              <h1 style="margin:10px 0 6px 0;font-size:24px;line-height:1.25;color:#F5EFE6;font-weight:600;">
                ${escapeHtml(article.title)}
              </h1>
              <div style="font-size:12px;color:#8A8175;">
                Category: <strong style="color:#D8CFC2;">${escapeHtml(article.category)}</strong> ·
                ${escapeHtml(article.read_time)} · ${article.word_count} words ·
                Quality Score: <strong style="color:#34d399;">${article.quality_score}/100</strong>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px;background-color:#1B0E10;border-bottom:1px solid #2C181B;text-align:center;">
              <div style="font-size:12px;color:#C4B5A5;margin-bottom:14px;">
                Nothing publishes without your explicit confirmation. Manage directly from email:
              </div>
              <a href="${approveUrl}" style="display:inline-block;padding:12px 22px;margin:4px 6px;background-color:#25D366;color:#0B0607;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                ✓ Approve &amp; Publish
              </a>
              <a href="${reviseUrl}" style="display:inline-block;padding:12px 20px;margin:4px 6px;background-color:#F5EFE6;color:#0B0607;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                ✎ Request Revision
              </a>
              <a href="${rejectUrl}" style="display:inline-block;padding:12px 20px;margin:4px 6px;background-color:#2C181B;color:#ffb3ae;border:1px solid #D6334A;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                ✕ Reject
              </a>
              <div style="margin-top:12px;">
                <a href="${previewUrl}" style="color:#D6334A;font-size:12px;text-decoration:underline;">
                  Open Full Live Website Draft Preview ↗
                </a>
              </div>
            </td>
          </tr>

          ${
            article.image_url
              ? `<tr>
            <td style="padding:22px 28px 8px 28px;">
              <img src="${escapeHtml(article.image_url)}" alt="${escapeHtml(article.image_alt)}" style="width:100%;height:auto;border-radius:12px;border:1px solid #2C181B;display:block;" />
              <div style="font-size:11px;color:#8A8175;margin-top:6px;">
                <strong>Image Alt Text:</strong> ${escapeHtml(article.image_alt)}
              </div>
            </td>
          </tr>`
              : ""
          }

          <tr>
            <td style="padding:18px 28px;">
              <div style="background-color:#0B0607;border:1px solid #2C181B;border-radius:12px;padding:16px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#D6334A;font-weight:700;margin-bottom:10px;">
                  SEO &amp; Search Intent Brief
                </div>
                <div style="font-size:12px;color:#C4B5A5;line-height:1.7;">
                  <div><strong style="color:#F5EFE6;">URL Slug:</strong> /blog/${escapeHtml(article.slug)}</div>
                  <div><strong style="color:#F5EFE6;">SEO Title:</strong> ${escapeHtml(article.meta_title)}</div>
                  <div><strong style="color:#F5EFE6;">Meta Description:</strong> ${escapeHtml(article.meta_description)}</div>
                  <div><strong style="color:#F5EFE6;">Primary Keyword:</strong> ${escapeHtml(article.primary_keyword)}</div>
                  <div><strong style="color:#F5EFE6;">Secondary Keywords:</strong> ${escapeHtml((article.secondary_keywords || []).join(", "))}</div>
                  <div><strong style="color:#F5EFE6;">Search Intent:</strong> ${escapeHtml(article.search_intent)}</div>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:4px 28px 18px 28px;">
              <div style="background-color:#0B0607;border:1px solid #2C181B;border-radius:12px;padding:16px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#34d399;font-weight:700;margin-bottom:8px;">
                  Automated Quality Report — Score ${article.quality_score}/100
                </div>
                <p style="font-size:12px;color:#D8CFC2;line-height:1.6;margin:0 0 12px 0;">
                  ${escapeHtml(qa.editorSummary || "All mandatory SEO, link, metadata, and originality checks passed.")}
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${qaChecksHtml}
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:6px 28px 24px 28px;">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#D6334A;font-weight:700;margin-bottom:8px;">
                Article Preview
              </div>
              <p style="color:#F5EFE6;font-size:15px;font-style:italic;border-left:2px solid #D6334A;padding-left:12px;line-height:1.6;">
                ${escapeHtml(article.summary)}
              </p>
              ${previewHtml}
              <div style="margin-top:16px;padding-top:14px;border-top:1px solid #2C181B;text-align:center;">
                <a href="${previewUrl}" style="color:#F5EFE6;font-size:13px;text-decoration:underline;">
                  Read the complete ${article.word_count}-word draft + FAQs on WebziFire ↗
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 28px;background-color:#0B0607;border-top:1px solid #2C181B;text-align:center;">
              <a href="${approveUrl}" style="display:inline-block;padding:12px 22px;margin:4px 6px;background-color:#25D366;color:#0B0607;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                ✓ Approve &amp; Publish
              </a>
              <a href="${reviseUrl}" style="display:inline-block;padding:12px 20px;margin:4px 6px;background-color:#F5EFE6;color:#0B0607;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                ✎ Request Revision
              </a>
              <a href="${rejectUrl}" style="display:inline-block;padding:12px 20px;margin:4px 6px;background-color:#2C181B;color:#ffb3ae;border:1px solid #D6334A;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                ✕ Reject
              </a>
              <div style="font-size:11px;color:#8A8175;margin-top:14px;">
                WebziFire Autonomous SEO System · Token expires in 14 days · Zero auto-publishing enabled.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return dispatchEmail({
    to,
    subject: `[Approve WebziFire Journal]${revisionTag} ${article.title}`,
    html,
  });
}

/**
 * Step 8: Sends a publish confirmation email immediately after approved publication succeeds.
 */
export async function sendPublishConfirmationEmail(params: {
  article: JournalArticleRecord;
  recipientEmail?: string | null;
}): Promise<{ messageId: string; to: string }> {
  const { article } = params;
  const to = getApprovalRecipientEmail(params.recipientEmail);
  if (!to) {
    throw new Error("ADMIN_APPROVAL_EMAIL is not configured.");
  }

  const baseUrl = getSiteBaseUrl();
  const liveUrl = `${baseUrl}/blog/${encodeURIComponent(article.slug)}`;
  const blogIndexUrl = `${baseUrl}/blog`;
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const dashboardUrl = `${baseUrl}/admin/seo`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#0B0607;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#F5EFE6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0B0607;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;width:100%;background-color:#140A0C;border:1px solid #2C181B;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:26px 28px;background:linear-gradient(135deg,#0d2a1c 0%,#140A0C 75%);border-bottom:1px solid #2C181B;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#34d399;font-weight:700;">
                ✓ PUBLISHED LIVE ON WEBZIFIRE
              </div>
              <h1 style="margin:10px 0 6px 0;font-size:22px;line-height:1.3;color:#F5EFE6;">
                ${escapeHtml(article.title)}
              </h1>
              <div style="font-size:12px;color:#C4B5A5;">
                Your approved article is now live in Project Journals and indexed in your XML sitemap.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px;">
              ${
                article.image_url
                  ? `<img src="${escapeHtml(article.image_url)}" alt="${escapeHtml(article.image_alt)}" style="width:100%;height:auto;border-radius:10px;border:1px solid #2C181B;margin-bottom:18px;display:block;" />`
                  : ""
              }
              <div style="background:#0B0607;border:1px solid #2C181B;border-radius:10px;padding:14px;font-size:13px;color:#C4B5A5;line-height:1.8;">
                <div>✓ Added to <a href="${blogIndexUrl}" style="color:#F5EFE6;">WebziFire Journals (/blog)</a></div>
                <div>✓ Dynamic SEO Metadata, OpenGraph &amp; BlogPosting/FAQPage JSON-LD active</div>
                <div>✓ XML Sitemap revalidated (<a href="${sitemapUrl}" style="color:#F5EFE6;">sitemap.xml</a>)</div>
                <div>✓ Primary Keyword: <strong style="color:#F5EFE6;">${escapeHtml(article.primary_keyword)}</strong> (${article.word_count} words)</div>
              </div>
              <div style="text-align:center;margin-top:22px;">
                <a href="${liveUrl}" style="display:inline-block;padding:13px 26px;background-color:#F5EFE6;color:#0B0607;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                  View Live Published Article ↗
                </a>
              </div>
              <div style="text-align:center;margin-top:12px;">
                <a href="${dashboardUrl}" style="color:#8A8175;font-size:12px;text-decoration:underline;">
                  Open SEO Automation Dashboard
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return dispatchEmail({
    to,
    subject: `[Published Live] ${article.title} — WebziFire Journal`,
    html,
  });
}

export interface ContentRefreshDigestParams {
  analyses: Array<{
    articleId: string;
    slug: string;
    title: string;
    publishedAt: string;
    ageDays: number;
    impressions: number;
    clicks: number;
    ctr: number;
    avgPosition: number;
    healthVerdict: string;
    keySignals: string[];
    recommendations: Array<{
      type: string;
      priority: string;
      title: string;
      rationale: string;
      suggestedAction: string;
    }>;
  }>;
  recipientEmail?: string | null;
}

/**
 * Capability 4: Sends the 30–60 Day Content Refresh Digest email to the founder.
 * Reviews performance of older articles and provides non-destructive content refresh recommendations.
 */
export async function sendContentRefreshDigestEmail(
  params: ContentRefreshDigestParams
): Promise<{ messageId: string; to: string }> {
  const to = getApprovalRecipientEmail(params.recipientEmail);
  if (!to) {
    throw new Error("ADMIN_APPROVAL_EMAIL is not configured.");
  }

  const baseUrl = getSiteBaseUrl();
  const dashboardUrl = `${baseUrl}/admin/seo`;

  const articlesHtml = params.analyses
    .map((art) => {
      const liveUrl = `${baseUrl}/blog/${encodeURIComponent(art.slug)}`;
      const verdictColor =
        art.healthVerdict === "healthy"
          ? "#34d399"
          : art.healthVerdict === "high_opportunity"
          ? "#60a5fa"
          : "#f59e0b";

      const verdictLabel =
        art.healthVerdict === "underperforming"
          ? "⚠️ Underperforming (Low CTR)"
          : art.healthVerdict === "outdated"
          ? "⏳ Outdated Architecture Concepts"
          : art.healthVerdict === "high_opportunity"
          ? "🚀 High Search Opportunity"
          : "✅ Healthy Baseline";

      const recsHtml = art.recommendations
        .map(
          (r) => `
        <div style="background-color:#1B0E10;border-left:3px solid #D6334A;border-radius:8px;padding:10px 14px;margin-top:10px;">
          <div style="font-size:11px;font-weight:700;color:#D6334A;text-transform:uppercase;letter-spacing:1px;">
            ${escapeHtml(r.priority)} Priority · ${escapeHtml(r.type.replace(/_/g, " "))}
          </div>
          <div style="font-size:13px;font-weight:600;color:#F5EFE6;margin:4px 0 2px 0;">
            ${escapeHtml(r.title)}
          </div>
          <div style="font-size:12px;color:#C4B5A5;line-height:1.5;">
            ${escapeHtml(r.rationale)}
          </div>
          <div style="font-size:12px;color:#34d399;margin-top:4px;">
            <strong>Action:</strong> ${escapeHtml(r.suggestedAction)}
          </div>
        </div>`
        )
        .join("");

      return `
      <div style="background-color:#0B0607;border:1px solid #2C181B;border-radius:14px;padding:18px 20px;margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:11px;font-weight:700;color:${verdictColor};text-transform:uppercase;letter-spacing:1px;">
            ${escapeHtml(verdictLabel)}
          </span>
          <span style="font-size:11px;color:#8A8175;">
            ${art.ageDays} days live
          </span>
        </div>
        <h3 style="margin:4px 0 6px 0;font-size:17px;color:#F5EFE6;font-weight:600;">
          <a href="${liveUrl}" style="color:#F5EFE6;text-decoration:none;">${escapeHtml(art.title)} ↗</a>
        </h3>
        <div style="font-size:12px;color:#8A8175;margin-bottom:12px;">
          /blog/${escapeHtml(art.slug)} · 28d Google Impressions: <strong style="color:#D8CFC2;">${art.impressions}</strong> ·
          Clicks: <strong style="color:#D8CFC2;">${art.clicks}</strong> ·
          CTR: <strong style="color:#D8CFC2;">${(art.ctr * 100).toFixed(2)}%</strong>
        </div>
        <div style="font-size:12px;color:#C4B5A5;line-height:1.6;margin-bottom:10px;">
          ${art.keySignals.map((s) => `• ${escapeHtml(s)}`).join("<br />")}
        </div>
        ${recsHtml}
      </div>`;
    })
    .join("");

  const underperformingCount = params.analyses.filter(
    (a) => a.healthVerdict === "underperforming"
  ).length;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#0B0607;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#F5EFE6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0B0607;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;width:100%;background-color:#140A0C;border:1px solid #2C181B;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:26px 28px;background:linear-gradient(135deg,#260B11 0%,#140A0C 70%);border-bottom:1px solid #2C181B;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#D6334A;font-weight:700;">
                ✦ WEBZIFIRE AUTONOMOUS SEO · CONTENT REFRESH ENGINE
              </div>
              <h1 style="margin:10px 0 6px 0;font-size:23px;line-height:1.3;color:#F5EFE6;font-weight:600;">
                30–60 Day Content Refresh &amp; Audit Digest
              </h1>
              <div style="font-size:12px;color:#C4B5A5;">
                Audited <strong style="color:#F5EFE6;">${params.analyses.length}</strong> published articles ·
                <strong style="color:#f59e0b;">${underperformingCount}</strong> flagged for optimization
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 28px;">
              <p style="font-size:13px;color:#D8CFC2;line-height:1.6;margin:0 0 18px 0;">
                Here is your scheduled 30–60 day content performance review. Every recommendation is grounded in real Google Search Console data and modern 2026 software engineering benchmarks:
              </p>

              ${articlesHtml || `<p style="color:#8A8175;font-size:13px;">No articles currently eligible for refresh audit.</p>`}

              <div style="text-align:center;margin-top:24px;padding-top:18px;border-top:1px solid #2C181B;">
                <a href="${dashboardUrl}" style="display:inline-block;padding:13px 28px;background-color:#D6334A;color:#FFFFFF;text-decoration:none;border-radius:999px;font-weight:700;font-size:13px;">
                  Open SEO Dashboard &amp; Review Recommendations ↗
                </a>
              </div>
              <div style="text-align:center;margin-top:12px;font-size:11px;color:#8A8175;">
                WebziFire Autonomous SEO System · Non-destructive recommendations · Founder approval required for all updates.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return dispatchEmail({
    to,
    subject: `[Content Refresh Audit] ${params.analyses.length} Articles Audited — WebziFire SEO`,
    html,
  });
}
