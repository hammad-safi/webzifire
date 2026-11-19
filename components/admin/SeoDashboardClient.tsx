"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Play,
  RefreshCw,
  Settings,
  BarChart3,
  Cpu,
  Lock,
  LogOut,
  ExternalLink,
  AlertTriangle,
  Loader2,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface DashboardData {
  configured: boolean;
  message?: string;
  error?: string;
  integrations: {
    gemini: boolean;
    supabase: boolean;
    smtp: boolean;
    approvalEmail: string;
    gsc: boolean;
    ga4Api: boolean;
    ga4Tracking: boolean;
    cronSecret: boolean;
  };
  settings?: {
    automation_enabled: boolean;
    test_article_verified: boolean;
    articles_per_week: number;
    schedule_days: string[];
    target_word_min: number;
    target_word_max: number;
    min_quality_score: number;
    default_author: string;
    default_author_role: string;
    approval_email: string | null;
    last_pipeline_run_at: string | null;
    last_seo_sync_at: string | null;
  };
  stats?: {
    totalGenerated: number;
    pendingApprovals: number;
    published: number;
    rejected: number;
    inProgress: number;
  };
  articles?: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    service_pillar: string;
    status: string;
    word_count: number;
    quality_score: number;
    revision_count: number;
    primary_keyword: string;
    approval_token: string | null;
    published_at: string | null;
    created_at: string;
  }>;
  jobs?: Array<{
    id: string;
    job_type: string;
    status: string;
    last_error: string | null;
    created_at: string;
  }>;
  usage30d?: {
    totalCalls: number;
    totalPromptTokens: number;
    totalOutputTokens: number;
    totalImages: number;
    totalCostUsd: number;
    byModel: Array<{
      model: string;
      calls: number;
      promptTokens: number;
      outputTokens: number;
      images: number;
      costUsd: number;
    }>;
  };
  seo?: {
    totals: {
      impressions: number;
      clicks: number;
      avgPosition: number;
      ga4Pageviews: number;
    };
    metrics: Array<{
      article_slug: string;
      impressions: number;
      clicks: number;
      ctr: number;
      avg_position: number;
      indexing_status: string;
      ga4_pageviews: number;
    }>;
    recommendations: Array<{
      id: string;
      article_slug: string | null;
      recommendation_type: string;
      priority: string;
      title: string;
      rationale: string;
      suggested_action: string;
      status: string;
    }>;
  };
}

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function SeoDashboardClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "seo" | "usage" | "settings">("overview");
  const [runningTest, setRunningTest] = useState(false);
  const [syncingSeo, setSyncingSeo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [formSettings, setFormSettings] = useState({
    automation_enabled: false,
    articles_per_week: 3,
    schedule_days: ["mon", "wed", "fri"],
    target_word_min: 1000,
    target_word_max: 1800,
    min_quality_score: 85,
    default_author: "Hammad Khan",
    default_author_role: "Founder & Principal Software Architect",
    approval_email: "",
  });

  const loadDashboard = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/seo", { cache: "no-store" });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const json = (await res.json()) as DashboardData;
      setData(json);
      if (json.settings) {
        setFormSettings({
          automation_enabled: json.settings.automation_enabled,
          articles_per_week: json.settings.articles_per_week,
          schedule_days: json.settings.schedule_days || ["mon", "wed", "fri"],
          target_word_min: json.settings.target_word_min,
          target_word_max: json.settings.target_word_max,
          min_quality_score: json.settings.min_quality_score,
          default_author: json.settings.default_author,
          default_author_role: json.settings.default_author_role,
          approval_email: json.settings.approval_email || "",
        });
      }
    } catch {
      setBanner({ type: "err", text: "Failed to load dashboard telemetry." });
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((res) => {
        setAuthenticated(Boolean(res.authenticated));
        setAuthChecked(true);
        if (res.authenticated) loadDashboard();
      })
      .catch(() => setAuthChecked(true));
  }, [loadDashboard]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setAuthError(json.error || "Invalid credentials.");
      } else {
        setAuthenticated(true);
        setPassword("");
        loadDashboard();
      }
    } catch {
      setAuthError("Network error while signing in.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
    setData(null);
  }

  async function handleRunTestArticle() {
    setBanner(null);
    setRunningTest(true);
    try {
      const res = await fetch("/api/cron/seo-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Test pipeline failed." });
      } else {
        setBanner({
          type: "ok",
          text: `Test article "${json.title}" (${json.wordCount} words, QA ${json.qualityScore}/100) drafted & approval email sent to ${json.emailSentTo}!`,
        });
        await loadDashboard();
      }
    } catch {
      setBanner({ type: "err", text: "Request failed or timed out." });
    } finally {
      setRunningTest(false);
    }
  }

  async function handleSyncSeo() {
    setBanner(null);
    setSyncingSeo(true);
    try {
      const res = await fetch("/api/cron/seo-sync", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "SEO sync failed." });
      } else {
        setBanner({
          type: "ok",
          text: `SEO Sync complete: GSC=${json.gscSynced}, GA4=${json.ga4Synced}, Recommendations=${json.recommendationsCreated}. ${(json.notes || []).join(" ")}`,
        });
        await loadDashboard();
      }
    } catch {
      setBanner({ type: "err", text: "SEO sync request failed." });
    } finally {
      setSyncingSeo(false);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formSettings),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Failed saving settings." });
      } else {
        setBanner({ type: "ok", text: "Automation settings saved successfully." });
        await loadDashboard();
      }
    } catch {
      setBanner({ type: "err", text: "Network error while saving settings." });
    } finally {
      setSavingSettings(false);
    }
  }

  function toggleDay(day: string) {
    setFormSettings((prev) => {
      const exists = prev.schedule_days.includes(day);
      const nextDays = exists
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day];
      return {
        ...prev,
        schedule_days: nextDays,
        articles_per_week: Math.max(1, nextDays.length),
      };
    });
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0B0607] text-[#F5EFE6] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-[#D6334A] animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0B0607] text-[#F5EFE6] flex items-center justify-center px-4 pt-20">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-[#140A0C] border border-[#2C181B] rounded-3xl p-8 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center text-[#D6334A]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-[#F5EFE6]">
                SEO Automation Admin
              </h1>
              <p className="font-mono text-[11px] text-[#8A8175]">
                WEBZIFIRE AUTONOMOUS CONTENT ENGINE
              </p>
            </div>
          </div>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter ADMIN_DASHBOARD_PASSWORD"
            className="w-full px-4 py-3 rounded-xl bg-[#0B0607] border border-[#2C181B] text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A]"
          />

          {authError && (
            <div className="p-3 rounded-xl bg-[#D6334A]/15 border border-[#D6334A]/50 text-xs text-[#ffb3ae]">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full py-3 rounded-full bg-[#F5EFE6] hover:bg-white text-[#0B0607] font-mono text-xs uppercase tracking-wider font-bold cursor-pointer disabled:opacity-50"
          >
            {loggingIn ? "Verifying..." : "Unlock Command Center"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0607] text-[#F5EFE6] pt-28 pb-20 px-4 sm:px-8 lg:px-14">
      <div className="max-w-[1380px] mx-auto flex flex-col gap-8">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#2C181B]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] font-mono text-[11px] uppercase tracking-wider text-[#D6334A] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WebziFire Autonomous AI SEO</span>
            </div>
            <h1 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6]">
              Content &amp; SEO Command Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRunTestArticle}
              disabled={runningTest || !data?.configured}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5EFE6] hover:bg-white text-[#0B0607] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {runningTest ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{runningTest ? "Generating (45–90s)..." : "Run 1 Test Article"}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncSeo}
              disabled={syncingSeo || !data?.configured}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#140A0C] border border-[#2C181B] hover:border-[#D6334A]/50 text-[#F5EFE6] font-mono text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSeo ? "animate-spin" : ""}`} />
              <span>Sync SEO</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#140A0C] border border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6] font-mono text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {banner && (
          <div
            className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-4 ${
              banner.type === "ok"
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : "bg-[#D6334A]/15 border-[#D6334A]/50 text-[#ffb3ae]"
            }`}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="font-mono text-xs underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Missing Setup Banner */}
        {data && !data.configured && (
          <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#D6334A]/50 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#D6334A] font-mono text-xs uppercase font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>One-Time Setup Required</span>
            </div>
            <p className="text-sm text-[#C4B5A5]">
              {data.error || data.message}
            </p>
          </div>
        )}

        {/* KPI Grid */}
        {data?.stats && data?.settings && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
              <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                Automation Status
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    data.settings.automation_enabled
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-amber-400"
                  }`}
                />
                <span className="font-display text-2xl text-[#F5EFE6]">
                  {data.settings.automation_enabled ? "ACTIVE" : "PAUSED"}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#8A8175] mt-1">
                {data.settings.articles_per_week}/week ·{" "}
                {data.settings.test_article_verified ? "Test Verified" : "Awaiting Test"}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
              <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                Articles Generated
              </div>
              <div className="font-display text-3xl text-[#F5EFE6] mt-2">
                {data.stats.totalGenerated}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
              <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                Pending Approval
              </div>
              <div className="font-display text-3xl text-amber-300 mt-2">
                {data.stats.pendingApprovals}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
              <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                Published Live
              </div>
              <div className="font-display text-3xl text-emerald-400 mt-2">
                {data.stats.published}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
              <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                30d Gemini Cost
              </div>
              <div className="font-display text-3xl text-[#D6334A] mt-2">
                ${(data.usage30d?.totalCostUsd || 0).toFixed(3)}
              </div>
              <div className="font-mono text-[11px] text-[#8A8175] mt-1">
                {data.stats.rejected} rejected · {data.usage30d?.totalImages || 0} images
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#2C181B] pb-3">
          {[
            { id: "overview", label: "Articles & Queue", icon: FileText },
            { id: "seo", label: "SEO Performance", icon: BarChart3 },
            { id: "usage", label: "Gemini Usage & Costs", icon: Cpu },
            { id: "settings", label: "Schedule & Integrations", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "seo" | "usage" | "settings")
                }
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  active
                    ? "bg-[#D6334A] text-white font-semibold"
                    : "bg-[#140A0C] border border-[#2C181B] text-[#C4B5A5] hover:text-[#F5EFE6]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loadingData && !data && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-[#D6334A] animate-spin" />
          </div>
        )}

        {/* TAB 1: ARTICLES & PIPELINE */}
        {activeTab === "overview" && data?.configured && (
          <div className="flex flex-col gap-6">
            <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-[#2C181B] flex items-center justify-between">
                <h2 className="font-display text-xl text-[#F5EFE6]">
                  Generated Journal Articles
                </h2>
                <span className="font-mono text-xs text-[#8A8175]">
                  Zero auto-publishing — all drafts require explicit approval
                </span>
              </div>

              {!data.articles || data.articles.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#8A8175]">
                  No articles generated yet. Click <strong>Run 1 Test Article</strong> above
                  to execute the complete Research → Write → Image → QA → Email Approval flow.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2C181B] font-mono text-[11px] uppercase text-[#8A8175] bg-[#0B0607]/60">
                        <th className="py-3 px-5">Article</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">QA Score</th>
                        <th className="py-3 px-4">Words</th>
                        <th className="py-3 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C181B] text-sm">
                      {data.articles.map((art) => (
                        <tr key={art.id} className="hover:bg-[#1B0E10]/50">
                          <td className="py-4 px-5">
                            <div className="font-medium text-[#F5EFE6]">{art.title}</div>
                            <div className="font-mono text-[11px] text-[#8A8175] mt-0.5">
                              /blog/{art.slug} · KW: {art.primary_keyword}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] uppercase font-semibold ${
                                art.status === "published"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : art.status === "pending_approval"
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : art.status === "rejected"
                                      ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                      : "bg-white/10 text-[#D8CFC2]"
                              }`}
                            >
                              {art.status === "published" && <CheckCircle2 className="w-3 h-3" />}
                              {art.status === "pending_approval" && <Clock className="w-3 h-3" />}
                              {art.status === "rejected" && <XCircle className="w-3 h-3" />}
                              {art.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-[#F5EFE6]">
                            {art.quality_score}/100
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-[#C4B5A5]">
                            {art.word_count}
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-xs space-x-3">
                            {art.status === "published" && (
                              <a
                                href={`/blog/${art.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Live</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {art.status === "pending_approval" && art.approval_token && (
                              <>
                                <a
                                  href={`/blog/${art.slug}?preview=${encodeURIComponent(art.approval_token)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#C4B5A5] hover:text-white underline"
                                >
                                  Preview
                                </a>
                                <a
                                  href={`/journals/review?token=${encodeURIComponent(art.approval_token)}&action=approve`}
                                  className="text-[#D6334A] hover:underline font-semibold"
                                >
                                  Review
                                </a>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Job Execution Log */}
            {data.jobs && data.jobs.length > 0 && (
              <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl p-5 space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#8A8175]">
                  Recent Background Pipeline Jobs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {data.jobs.slice(0, 12).map((j) => (
                    <div
                      key={j.id}
                      className="p-3 rounded-xl bg-[#0B0607] border border-[#2C181B] font-mono text-[11px] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#F5EFE6] font-semibold">{j.job_type}</span>
                        <span
                          className={
                            j.status === "completed"
                              ? "text-emerald-400"
                              : j.status === "failed"
                                ? "text-[#D6334A]"
                                : "text-amber-300"
                          }
                        >
                          {j.status}
                        </span>
                      </div>
                      {j.last_error && (
                        <span className="text-[#ffb3ae] truncate">{j.last_error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEO PERFORMANCE */}
        {activeTab === "seo" && data?.configured && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
                <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                  28d GSC Impressions
                </div>
                <div className="font-display text-3xl text-[#F5EFE6] mt-2">
                  {data.seo?.totals.impressions || 0}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
                <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                  28d GSC Clicks
                </div>
                <div className="font-display text-3xl text-emerald-400 mt-2">
                  {data.seo?.totals.clicks || 0}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
                <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                  Avg Position
                </div>
                <div className="font-display text-3xl text-[#F5EFE6] mt-2">
                  {data.seo?.totals.avgPosition || "—"}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
                <div className="font-mono text-[11px] uppercase text-[#8A8175]">
                  28d GA4 Pageviews
                </div>
                <div className="font-display text-3xl text-[#D6334A] mt-2">
                  {data.seo?.totals.ga4Pageviews || 0}
                </div>
              </div>
            </div>

            <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl text-[#F5EFE6]">
                AI Performance Recommendations (Read-Only — Never Auto-Edits)
              </h2>
              {!data.seo?.recommendations || data.seo.recommendations.length === 0 ? (
                <p className="text-sm text-[#8A8175]">
                  Connect Google Search Console / GA4 in your environment variables and
                  click <strong>Sync SEO</strong> after articles begin receiving impressions
                  to unlock real data-driven topic &amp; CTR recommendations.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.seo.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[#F5EFE6]">{rec.title}</span>
                        <span className="font-mono text-[11px] uppercase text-[#D6334A]">
                          {rec.priority} · {rec.recommendation_type}
                        </span>
                      </div>
                      <p className="text-xs text-[#C4B5A5]">{rec.rationale}</p>
                      <p className="font-mono text-xs text-emerald-300">
                        Suggested: {rec.suggested_action}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GEMINI USAGE & COSTS */}
        {activeTab === "usage" && data?.configured && (
          <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl text-[#F5EFE6]">
                  Gemini API Token Usage &amp; Estimated Costs (Last 30 Days)
                </h2>
                <p className="font-mono text-xs text-[#8A8175] mt-1">
                  Calls: {data.usage30d?.totalCalls || 0} · Input:{" "}
                  {(data.usage30d?.totalPromptTokens || 0).toLocaleString()} tokens · Output:{" "}
                  {(data.usage30d?.totalOutputTokens || 0).toLocaleString()} tokens · Images:{" "}
                  {data.usage30d?.totalImages || 0}
                </p>
              </div>
              <div className="font-display text-3xl text-[#D6334A]">
                ${(data.usage30d?.totalCostUsd || 0).toFixed(4)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2C181B] font-mono text-[11px] uppercase text-[#8A8175]">
                    <th className="py-2.5">Model</th>
                    <th className="py-2.5">Calls</th>
                    <th className="py-2.5">Input Tokens</th>
                    <th className="py-2.5">Output Tokens</th>
                    <th className="py-2.5">Images</th>
                    <th className="py-2.5 text-right">Est. Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C181B] font-mono text-xs">
                  {(data.usage30d?.byModel || []).map((m) => (
                    <tr key={m.model}>
                      <td className="py-3 text-[#F5EFE6]">{m.model}</td>
                      <td className="py-3 text-[#C4B5A5]">{m.calls}</td>
                      <td className="py-3 text-[#C4B5A5]">
                        {m.promptTokens.toLocaleString()}
                      </td>
                      <td className="py-3 text-[#C4B5A5]">
                        {m.outputTokens.toLocaleString()}
                      </td>
                      <td className="py-3 text-[#C4B5A5]">{m.images}</td>
                      <td className="py-3 text-right text-emerald-400">
                        ${m.costUsd.toFixed(5)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & INTEGRATIONS */}
        {activeTab === "settings" && data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Integrations Health */}
            <div className="lg:col-span-5 bg-[#140A0C] border border-[#2C181B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D6334A]">
                <ShieldCheck className="w-4 h-4" />
                <span>Integration Connection Status</span>
              </div>
              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { label: "Gemini AI API", ok: data.integrations.gemini },
                  { label: "Supabase PostgreSQL & Storage", ok: data.integrations.supabase },
                  {
                    label: `Email SMTP (${data.integrations.approvalEmail || "Not Set"})`,
                    ok: data.integrations.smtp,
                  },
                  { label: "Vercel CRON_SECRET", ok: data.integrations.cronSecret },
                  { label: "Google Search Console API", ok: data.integrations.gsc },
                  { label: "GA4 Tracking Tag (gtag.js)", ok: data.integrations.ga4Tracking },
                  { label: "GA4 Data Reporting API", ok: data.integrations.ga4Api },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-[#0B0607] border border-[#2C181B] flex items-center justify-between gap-2"
                  >
                    <span className="text-[#D8CFC2] truncate">{item.label}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        item.ok
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {item.ok ? "Connected" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automation Schedule Form */}
            {data.configured && (
              <form
                onSubmit={handleSaveSettings}
                className="lg:col-span-7 bg-[#140A0C] border border-[#2C181B] rounded-2xl p-6 space-y-5"
              >
                <h2 className="font-display text-xl text-[#F5EFE6]">
                  Publishing Schedule &amp; Editorial Guardrails
                </h2>

                <label className="flex items-center justify-between p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-[#F5EFE6]">
                      Enable Recurring Automated Drafting
                    </div>
                    <div className="text-xs text-[#8A8175]">
                      Generates drafts &amp; emails you for approval on scheduled days (never auto-publishes).
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formSettings.automation_enabled}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        automation_enabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#D6334A]"
                  />
                </label>

                <div>
                  <label className="block font-mono text-xs uppercase text-[#8A8175] mb-2">
                    Scheduled Drafting Days (09:00 AM PKT)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                      const active = formSettings.schedule_days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3.5 py-1.5 rounded-full font-mono text-xs uppercase cursor-pointer ${
                            active
                              ? "bg-[#D6334A] text-white font-semibold"
                              : "bg-[#0B0607] border border-[#2C181B] text-[#8A8175]"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#8A8175] mb-1">
                      Min Words
                    </label>
                    <input
                      type="number"
                      value={formSettings.target_word_min}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          target_word_min: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-sm text-[#F5EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#8A8175] mb-1">
                      Max Words
                    </label>
                    <input
                      type="number"
                      value={formSettings.target_word_max}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          target_word_max: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-sm text-[#F5EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#8A8175] mb-1">
                      Min QA Score
                    </label>
                    <input
                      type="number"
                      value={formSettings.min_quality_score}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          min_quality_score: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-sm text-[#F5EFE6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#8A8175] mb-1">
                      Default Author
                    </label>
                    <input
                      type="text"
                      value={formSettings.default_author}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          default_author: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-sm text-[#F5EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase text-[#8A8175] mb-1">
                      Approval Email Override
                    </label>
                    <input
                      type="email"
                      value={formSettings.approval_email}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          approval_email: e.target.value,
                        })
                      }
                      placeholder={data.integrations.approvalEmail || "your@gmail.com"}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B0607] border border-[#2C181B] text-sm text-[#F5EFE6]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-full bg-[#F5EFE6] hover:bg-white text-[#0B0607] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? "Saving..." : "Save Automation Settings"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
