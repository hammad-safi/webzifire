"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface DraftSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  image_url: string;
  image_alt: string;
  word_count: number;
  read_time: string;
  quality_score: number;
  revision_count: number;
}

function ReviewPortalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const initialAction = (searchParams.get("action") || "approve") as
    | "approve"
    | "revise"
    | "reject";

  const [mode, setMode] = useState<"approve" | "revise" | "reject">(
    ["approve", "revise", "reject"].includes(initialAction)
      ? initialAction
      : "approve"
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<DraftSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [regenerateImage, setRegenerateImage] = useState(false);
  const [result, setResult] = useState<{
    action: string;
    message: string;
    liveUrl?: string;
    confirmationSent?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Missing review token. Please open this page from your approval email.");
      setLoading(false);
      return;
    }

    fetch(`/api/journals/review?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.valid) {
          setError(data.error || "Invalid or expired review link.");
        } else {
          setDraft(data.article);
        }
      })
      .catch(() => setError("Unable to load article draft. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (mode === "revise" && feedback.trim().length < 5) {
      setError("Please describe what you want Gemini AI to revise.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/journals/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: mode,
          feedback: feedback.trim(),
          regenerateImage,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Action failed. Please try again.");
      } else {
        setResult({
          action: data.action,
          message: data.message,
          liveUrl: data.liveUrl,
          confirmationSent: data.confirmationSent,
        });
      }
    } catch {
      setError("Network error while submitting your decision.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0607] text-[#F5EFE6] pt-28 pb-20 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Header Badge */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#140A0C] border border-[#2C181B] font-mono text-xs uppercase tracking-wider text-[#D6334A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>WebziFire Secure Editorial Review</span>
          </div>
          <a
            href="/admin/seo"
            className="font-mono text-xs text-[#8A8175] hover:text-[#F5EFE6] transition-colors"
          >
            SEO Dashboard ↗
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-8 h-8 text-[#D6334A] animate-spin" />
            <p className="font-mono text-xs text-[#C4B5A5]">
              Verifying one-time approval token...
            </p>
          </div>
        )}

        {/* Error State (no draft loaded) */}
        {!loading && !draft && !result && (
          <div className="bg-[#140A0C] border border-[#D6334A]/50 rounded-2xl p-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#D6334A]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="font-display text-2xl text-[#F5EFE6]">
                Review Link Unavailable
              </h1>
            </div>
            <p className="text-sm text-[#C4B5A5] leading-relaxed">{error}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="/blog"
                className="px-5 py-2.5 rounded-full bg-[#F5EFE6] text-[#0B0607] font-mono text-xs font-semibold uppercase tracking-wider"
              >
                View Live Journals
              </a>
              <a
                href="/admin/seo"
                className="px-5 py-2.5 rounded-full bg-[#1B0E10] border border-[#2C181B] text-[#F5EFE6] font-mono text-xs uppercase tracking-wider"
              >
                Open Admin Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="bg-[#140A0C] border border-emerald-500/40 rounded-2xl p-8 sm:p-10 flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center gap-3">
              {result.action === "approve" && (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              )}
              {result.action === "revise" && (
                <Sparkles className="w-8 h-8 text-[#D6334A] shrink-0" />
              )}
              {result.action === "reject" && (
                <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <h1 className="font-display text-2xl sm:text-3xl text-[#F5EFE6]">
                {result.action === "approve" && "Published Live on WebziFire"}
                {result.action === "revise" && "AI Revision Complete & Emailed"}
                {result.action === "reject" && "Article Rejected & Archived"}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#C4B5A5] leading-relaxed">
              {result.message}
            </p>
            {result.confirmationSent && (
              <p className="font-mono text-xs text-emerald-400">
                ✓ A live publish confirmation email has been sent to your inbox.
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {result.liveUrl && (
                <a
                  href={result.liveUrl}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F5EFE6] hover:bg-white text-[#0B0607] font-mono text-xs font-semibold uppercase tracking-wider"
                >
                  <span>View Live Article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <a
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B0E10] border border-[#2C181B] text-[#F5EFE6] font-mono text-xs uppercase tracking-wider hover:border-[#D6334A]/50"
              >
                All Project Journals
              </a>
              <a
                href="/admin/seo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B0E10] border border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6] font-mono text-xs uppercase tracking-wider"
              >
                SEO Dashboard
              </a>
            </div>
          </div>
        )}

        {/* Active Draft Confirmation Card */}
        {!loading && draft && !result && (
          <div className="bg-[#140A0C] border border-[#2C181B] rounded-3xl overflow-hidden shadow-2xl">
            {draft.image_url && (
              <div className="aspect-[16/9] w-full bg-[#0B0607] relative overflow-hidden border-b border-[#2C181B]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.image_url}
                  alt={draft.image_alt || draft.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140A0C] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D6334A] px-3 py-1 rounded-full bg-black/80 border border-white/10 font-semibold">
                    {draft.category}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 px-3 py-1 rounded-full bg-black/80 border border-emerald-500/30 font-semibold">
                    QA Score: {draft.quality_score}/100 · {draft.word_count} words
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <div>
                <h1 className="font-display font-light text-2xl sm:text-3xl text-[#F5EFE6] leading-snug">
                  {draft.title}
                </h1>
                <p className="text-sm text-[#C4B5A5] leading-relaxed mt-3">
                  {draft.summary}
                </p>
              </div>

              {/* SEO Metadata Summary */}
              <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] font-mono text-xs text-[#C4B5A5] space-y-1.5">
                <div>
                  <span className="text-[#8A8175]">Slug:</span> /blog/{draft.slug}
                </div>
                <div>
                  <span className="text-[#8A8175]">Primary Keyword:</span>{" "}
                  <span className="text-[#F5EFE6]">{draft.primary_keyword}</span>
                </div>
                <div>
                  <span className="text-[#8A8175]">Meta Description:</span>{" "}
                  {draft.meta_description}
                </div>
                <div className="pt-2">
                  <a
                    href={`/blog/${encodeURIComponent(draft.slug)}?preview=${encodeURIComponent(token)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#D6334A] hover:underline font-semibold"
                  >
                    <span>Open Full Live Website Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Action Mode Selector */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0B0607] border border-[#2C181B]">
                <button
                  type="button"
                  onClick={() => setMode("approve")}
                  className={`py-2.5 px-3 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    mode === "approve"
                      ? "bg-emerald-500 text-[#0B0607]"
                      : "text-[#8A8175] hover:text-[#F5EFE6]"
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setMode("revise")}
                  className={`py-2.5 px-3 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    mode === "revise"
                      ? "bg-[#F5EFE6] text-[#0B0607]"
                      : "text-[#8A8175] hover:text-[#F5EFE6]"
                  }`}
                >
                  Request Revision
                </button>
                <button
                  type="button"
                  onClick={() => setMode("reject")}
                  className={`py-2.5 px-3 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                    mode === "reject"
                      ? "bg-[#D6334A] text-white"
                      : "text-[#8A8175] hover:text-[#F5EFE6]"
                  }`}
                >
                  Reject
                </button>
              </div>

              {/* Action Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "approve" && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm text-[#D8CFC2]">
                    Confirming will immediately publish this article to{" "}
                    <strong>/blog/{draft.slug}</strong>, update your XML sitemap,
                    enable SEO JSON-LD metadata, and send you a confirmation email.
                  </div>
                )}

                {mode === "revise" && (
                  <div className="flex flex-col gap-3">
                    <label className="font-mono text-xs uppercase tracking-wider text-[#C4B5A5]">
                      What should Gemini AI improve or change?
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Example: Add a concrete PostgreSQL vs MySQL comparison table for ERP workloads, strengthen the UAE enterprise angle, and make the intro punchier."
                      className="w-full rounded-xl bg-[#0B0607] border border-[#2C181B] p-3.5 text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A]"
                    />
                    <label className="inline-flex items-center gap-2 text-xs text-[#C4B5A5] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regenerateImage}
                        onChange={(e) => setRegenerateImage(e.target.checked)}
                        className="accent-[#D6334A]"
                      />
                      <span>Also regenerate a fresh featured image</span>
                    </label>
                  </div>
                )}

                {mode === "reject" && (
                  <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-[#D6334A]/40 text-xs sm:text-sm text-[#D8CFC2]">
                      Rejecting permanently archives this draft. It will{" "}
                      <strong>never be published</strong> and its topic will be
                      skipped in future runs.
                    </div>
                    <input
                      type="text"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Optional rejection note (for your records)"
                      className="w-full rounded-xl bg-[#0B0607] border border-[#2C181B] px-3.5 py-2.5 text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A]"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-[#D6334A]/15 border border-[#D6334A]/50 text-xs text-[#ffb3ae]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3.5 px-6 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                    mode === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-[#0B0607]"
                      : mode === "revise"
                        ? "bg-[#F5EFE6] hover:bg-white text-[#0B0607]"
                        : "bg-[#D6334A] hover:bg-[#ff3b3b] text-white"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {mode === "revise"
                          ? "AI is revising & re-checking quality (30–60s)..."
                          : "Processing securely..."}
                      </span>
                    </>
                  ) : mode === "approve" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Publish Live Now</span>
                    </>
                  ) : mode === "revise" ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Submit Revision to Gemini AI</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Permanent Rejection</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JournalReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0607] text-[#F5EFE6] flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[#D6334A] animate-spin" />
        </div>
      }
    >
      <ReviewPortalContent />
    </Suspense>
  );
}
