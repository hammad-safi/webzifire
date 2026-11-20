/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Trash2,
  Edit3,
  Search,
  Filter,
  Image as ImageIcon,
  Wand2,
  X,
  Eye,
  Check,
  Globe,
  Activity,
  FileSearch,
  Layers,
  Send,
} from "lucide-react";

export interface DashboardArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  service_pillar: string;
  status: string;
  word_count: number;
  quality_score: number;
  revision_count: number;
  image_url: string;
  image_alt?: string;
  image_prompt?: string;
  summary?: string;
  takeaway?: string;
  author?: string;
  author_role?: string;
  read_time?: string;
  primary_keyword: string;
  approval_token: string | null;
  published_at: string | null;
  created_at: string;
}

const SERVICE_PILLARS = [
  "Website & Web Application Development",
  "SaaS Product Engineering",
  "ERP & Custom Operations Software",
  "POS & Retail Automation Systems",
  "Custom CRM & Sales Automation",
  "Mobile Application Development",
  "E-Commerce Engineering",
  "Applied AI & Business Automation",
  "Cloud Infrastructure & DevOps",
  "Enterprise Cybersecurity",
  "API & Microservices Architecture",
  "Legacy System Modernization",
];

const PRESET_PHOTOS = [
  { label: "📱 Mobile Architecture", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=90&w=1920&auto=format&fit=crop" },
  { label: "💳 Retail POS & Terminal", url: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=90&w=1920&auto=format&fit=crop" },
  { label: "📊 Custom CRM & Sales", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=90&w=1920&auto=format&fit=crop" },
  { label: "🏭 ERP & Operations", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=90&w=1920&auto=format&fit=crop" },
  { label: "☁️ Multi-Tenant SaaS", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=90&w=1920&auto=format&fit=crop" },
  { label: "🌐 Web & Composable", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=90&w=1920&auto=format&fit=crop" },
  { label: "🤖 AI & Automation", url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=90&w=1920&auto=format&fit=crop" },
  { label: "🔒 Cybersecurity SOC", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=90&w=1920&auto=format&fit=crop" },
  { label: "⚡ Cloud & DevOps", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=90&w=1920&auto=format&fit=crop" },
  { label: "🔌 Microservices & API", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=90&w=1920&auto=format&fit=crop" },
  { label: "🛍️ E-Commerce Commerce", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=90&w=1920&auto=format&fit=crop" },
  { label: "🏥 Healthcare & EHR", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=90&w=1920&auto=format&fit=crop" },
];

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
  articles?: DashboardArticle[];
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

  // Articles Table: Search, Filter, Infinite Scroll
  const [articlesSearch, setArticlesSearch] = useState("");
  const [articlesStatusFilter, setArticlesStatusFilter] = useState("all");
  const [visibleArticlesCount, setVisibleArticlesCount] = useState(8);
  const tableSentinelRef = useRef<HTMLDivElement | null>(null);

  // Edit Article Modal State
  const [editingArticle, setEditingArticle] = useState<DashboardArticle | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [imagePromptCustom, setImagePromptCustom] = useState("");

  // Delete Article Confirmation Modal State
  const [deletingArticle, setDeletingArticle] = useState<DashboardArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Capability 1: Keyword Cannibalization Check State
  const [kwCheckInput, setKwCheckInput] = useState("");
  const [kwChecking, setKwChecking] = useState(false);
  const [kwCheckResult, setKwCheckResult] = useState<any | null>(null);

  // Capability 2: Technical Fact Verification State & Modal
  const [factModalArticle, setFactModalArticle] = useState<DashboardArticle | null>(null);
  const [factLoading, setFactLoading] = useState(false);
  const [factReport, setFactReport] = useState<any | null>(null);

  // Capability 3: Google Search Console Modal & Live Inspection State
  const [gscModalArticle, setGscModalArticle] = useState<DashboardArticle | null>(null);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscDetails, setGscDetails] = useState<any | null>(null);
  const [inspectingGsc, setInspectingGsc] = useState(false);

  // Capability 4: 30-60 Day Content Refresh State
  const [runningRefreshAudit, setRunningRefreshAudit] = useState(false);
  const [refreshResult, setRefreshResult] = useState<any | null>(null);

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

  // --- Article Actions (Edit, Delete, Infinite Scroll) ---

  const handleOpenEdit = useCallback((art: DashboardArticle) => {
    setEditingArticle({ ...art });
    setImagePromptCustom(art.image_prompt || "");
  }, []);

  const handleSaveEdit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/admin/seo/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArticle),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Failed to update article." });
      } else {
        setBanner({ type: "ok", text: `Article "${editingArticle.title}" updated successfully.` });
        setData((prev) => {
          if (!prev?.articles) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) => (a.id === editingArticle.id ? { ...a, ...json.article } : a)),
          };
        });
        setEditingArticle(null);
      }
    } catch {
      setBanner({ type: "err", text: "Network error while saving article edit." });
    } finally {
      setIsSavingEdit(false);
    }
  }, [editingArticle]);

  const handleRegenerateImage = useCallback(async (articleId: string) => {
    setIsRegeneratingImage(true);
    try {
      const res = await fetch("/api/admin/seo/articles/regenerate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, customPrompt: imagePromptCustom }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Image regeneration failed." });
      } else {
        setBanner({
          type: "ok",
          text: `High-resolution image generated (${json.modelUsed}) & saved to Supabase Storage!`,
        });
        setEditingArticle((prev) => (prev ? { ...prev, image_url: json.imageUrl } : null));
        setData((prev) => {
          if (!prev?.articles) return prev;
          return {
            ...prev,
            articles: prev.articles.map((a) => (a.id === articleId ? { ...a, image_url: json.imageUrl } : a)),
          };
        });
      }
    } catch {
      setBanner({ type: "err", text: "Network error during image regeneration." });
    } finally {
      setIsRegeneratingImage(false);
    }
  }, [imagePromptCustom]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingArticle) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/seo/articles?id=${deletingArticle.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Failed to delete article." });
      } else {
        const title = deletingArticle.title;
        setBanner({ type: "ok", text: `Article "${title}" permanently deleted.` });
        setData((prev) => {
          if (!prev?.articles) return prev;
          const remaining = prev.articles.filter((a) => a.id !== deletingArticle.id);
          return {
            ...prev,
            articles: remaining,
            stats: prev.stats
              ? {
                  ...prev.stats,
                  totalGenerated: Math.max(0, prev.stats.totalGenerated - 1),
                  published:
                    deletingArticle.status === "published"
                      ? Math.max(0, prev.stats.published - 1)
                      : prev.stats.published,
                  pendingApprovals:
                    deletingArticle.status === "pending_approval"
                      ? Math.max(0, prev.stats.pendingApprovals - 1)
                      : prev.stats.pendingApprovals,
                  rejected:
                    deletingArticle.status === "rejected"
                      ? Math.max(0, prev.stats.rejected - 1)
                      : prev.stats.rejected,
                }
              : prev.stats,
          };
        });
        setDeletingArticle(null);
      }
    } catch {
      setBanner({ type: "err", text: "Network error while deleting article." });
    } finally {
      setIsDeleting(false);
    }
  }, [deletingArticle]);

  // Capability 1 Handler: Keyword Cannibalization Check
  const handleCheckCannibalization = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!kwCheckInput.trim()) return;
    setKwChecking(true);
    try {
      const res = await fetch("/api/admin/seo/keywords/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kwCheckInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Keyword check failed." });
      } else {
        setKwCheckResult(json.result);
      }
    } catch {
      setBanner({ type: "err", text: "Network error during keyword check." });
    } finally {
      setKwChecking(false);
    }
  }, [kwCheckInput]);

  // Capability 2 Handler: Technical Fact Verification Modal
  const handleOpenFactModal = useCallback(async (art: DashboardArticle) => {
    setFactModalArticle(art);
    setFactLoading(true);
    setFactReport(null);
    try {
      const res = await fetch("/api/admin/seo/articles/verify-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: art.id }),
      });
      const json = await res.json();
      if (json.success) {
        setFactReport(json.report);
      } else {
        setBanner({ type: "err", text: json.error || "Fact verification failed." });
      }
    } catch {
      setBanner({ type: "err", text: "Network error during fact verification." });
    } finally {
      setFactLoading(false);
    }
  }, []);

  // Capability 3 Handlers: Google Search Console Modal & Re-inspection
  const handleOpenGscModal = useCallback(async (art: DashboardArticle) => {
    setGscModalArticle(art);
    setGscLoading(true);
    setGscDetails(null);
    try {
      const res = await fetch(`/api/admin/seo/gsc?slug=${encodeURIComponent(art.slug)}`);
      const json = await res.json();
      if (json.success) {
        setGscDetails(json.data);
      }
    } catch {
      setBanner({ type: "err", text: "Failed loading Google Search Console data." });
    } finally {
      setGscLoading(false);
    }
  }, []);

  const handleReinspectGsc = useCallback(async (slug: string) => {
    setInspectingGsc(true);
    try {
      const res = await fetch("/api/admin/seo/gsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inspect", slug }),
      });
      const json = await res.json();
      if (json.success && json.result) {
        setGscDetails(json.result);
        setBanner({
          type: "ok",
          text: `Google Search Console URL inspection updated for /blog/${slug}.`,
        });
      }
    } catch {
      setBanner({ type: "err", text: "Failed re-inspecting URL with Google Search Console." });
    } finally {
      setInspectingGsc(false);
    }
  }, []);

  // Capability 4 Handler: 30-60 Day Content Refresh Audit
  const handleRunContentRefreshAudit = useCallback(async () => {
    setRunningRefreshAudit(true);
    try {
      const res = await fetch("/api/admin/seo/content-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceAll: true }),
      });
      const json = await res.json();
      if (json.success) {
        setRefreshResult(json.result);
        setBanner({
          type: "ok",
          text: json.message || "Content refresh audit completed and executive digest sent to founder email!",
        });
        loadDashboard();
      } else {
        setBanner({ type: "err", text: json.error || "Content refresh audit failed." });
      }
    } catch {
      setBanner({ type: "err", text: "Network error during content refresh audit." });
    } finally {
      setRunningRefreshAudit(false);
    }
  }, [loadDashboard]);

  // Filtered & progressively rendered articles for infinite scroll
  const filteredArticles = useMemo(() => {
    let list = (data?.articles || []) as DashboardArticle[];
    if (articlesStatusFilter !== "all") {
      list = list.filter((a) => a.status === articlesStatusFilter);
    }
    if (articlesSearch.trim()) {
      const q = articlesSearch.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.primary_keyword && a.primary_keyword.toLowerCase().includes(q)) ||
          (a.service_pillar && a.service_pillar.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data?.articles, articlesStatusFilter, articlesSearch]);

  const visibleArticles = useMemo(() => {
    return filteredArticles.slice(0, visibleArticlesCount);
  }, [filteredArticles, visibleArticlesCount]);

  useEffect(() => {
    setVisibleArticlesCount(8);
  }, [articlesSearch, articlesStatusFilter]);

  useEffect(() => {
    if (!tableSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleArticlesCount((prev) => {
            if (prev < filteredArticles.length) {
              return prev + 6;
            }
            return prev;
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(tableSentinelRef.current);
    return () => observer.disconnect();
  }, [filteredArticles.length]);

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
            <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-[#2C181B] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0B0607]/40">
                <div>
                  <h2 className="font-display text-xl text-[#F5EFE6]">
                    Generated Journal Articles
                  </h2>
                  <p className="font-mono text-xs text-[#8A8175] mt-0.5">
                    Search, edit copy & 1080p images, delete drafts, or review pending approvals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] text-[#C4B5A5]">
                    Showing {visibleArticles.length} of {filteredArticles.length} ({data.articles?.length || 0} total)
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="p-4 border-b border-[#2C181B] bg-[#0E0709] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#8A8175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={articlesSearch}
                    onChange={(e) => setArticlesSearch(e.target.value)}
                    placeholder="Search by title, slug, keyword, or pillar..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-xs placeholder:text-[#8A8175] focus:border-[#D6334A] outline-none"
                  />
                  {articlesSearch && (
                    <button
                      type="button"
                      onClick={() => setArticlesSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8175] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  {[
                    { id: "all", label: "All", count: data.articles?.length || 0 },
                    {
                      id: "pending_approval",
                      label: "Pending",
                      count: (data.articles || []).filter((a) => a.status === "pending_approval").length,
                    },
                    {
                      id: "published",
                      label: "Published",
                      count: (data.articles || []).filter((a) => a.status === "published").length,
                    },
                    {
                      id: "drafting",
                      label: "Drafts",
                      count: (data.articles || []).filter((a) => ["drafting", "qa_revising", "revision_requested"].includes(a.status)).length,
                    },
                    {
                      id: "rejected",
                      label: "Rejected",
                      count: (data.articles || []).filter((a) => a.status === "rejected").length,
                    },
                  ].map((tab) => {
                    const active = articlesStatusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setArticlesStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          active
                            ? "bg-[#D6334A] border-[#D6334A] text-white font-semibold"
                            : "bg-[#140A0C] border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6] hover:border-[#D6334A]/40"
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {!data.articles || data.articles.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#8A8175]">
                  No articles generated yet. Click <strong>Run 1 Test Article</strong> above
                  to execute the complete Research → Write → Image → QA → Email Approval flow.
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#8A8175]">
                  No articles matched your search or status filter.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setArticlesSearch("");
                      setArticlesStatusFilter("all");
                    }}
                    className="underline text-[#D6334A] cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                /* Infinite Scroll Table View */
                <div className="max-h-[580px] overflow-y-auto overflow-x-auto relative">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0B0607]/95 backdrop-blur z-10 border-b border-[#2C181B]">
                      <tr className="font-mono text-[11px] uppercase text-[#8A8175]">
                        <th className="py-3 px-4">Article</th>
                        <th className="py-3 px-3">Pillar</th>
                        <th className="py-3 px-3">Image</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Google Indexing</th>
                        <th className="py-3 px-3">QA &amp; Facts</th>
                        <th className="py-3 px-3">Words</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C181B] text-sm">
                      {visibleArticles.map((art) => (
                        <tr key={art.id} className="hover:bg-[#1B0E10]/50 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-medium text-[#F5EFE6] line-clamp-1">{art.title}</div>
                            <div className="font-mono text-[11px] text-[#8A8175] mt-0.5 truncate">
                              /blog/{art.slug} · KW: <span className="text-[#C4B5A5]">{art.primary_keyword}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-mono text-[11px] text-[#C4B5A5] line-clamp-1">
                              {art.service_pillar || art.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            {art.image_url ? (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(art)}
                                title="Click to view/edit image"
                                className="block rounded-lg overflow-hidden border border-[#2C181B] hover:border-[#D6334A] transition-all cursor-pointer"
                              >
                                <img
                                  src={art.image_url}
                                  alt={art.title}
                                  className="w-14 h-9 object-cover"
                                />
                              </button>
                            ) : (
                              <div className="w-14 h-9 rounded-lg bg-[#0B0607] border border-[#2C181B] flex items-center justify-center text-[#8A8175]">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
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

                          {/* Capability 3: Google Search Console Indexing & Impressions Pill */}
                          <td className="py-3.5 px-3">
                            {art.status === "published" ? (
                              <button
                                type="button"
                                onClick={() => handleOpenGscModal(art)}
                                title="Click to inspect Google Indexing & Search Queries"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B0607] border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 font-mono text-[10px] uppercase transition-colors cursor-pointer"
                              >
                                <Globe className="w-3 h-3 text-emerald-400" />
                                <span>GSC Tracked</span>
                              </button>
                            ) : (
                              <span className="font-mono text-[11px] text-[#8A8175]">Unpublished</span>
                            )}
                          </td>

                          {/* Capability 2: QA Score + Technical Fact Verification Trigger */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-xs text-[#F5EFE6] font-semibold">
                                {art.quality_score}/100
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenFactModal(art)}
                                className="font-mono text-[10px] text-[#D6334A] hover:text-white underline cursor-pointer text-left"
                                title="Audit technical claims, facts, and source integrity"
                              >
                                Verify Facts
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-xs text-[#C4B5A5]">
                            {art.word_count}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Edit Action Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(art)}
                                title="Edit Article & Image"
                                className="p-1.5 rounded-lg bg-[#0B0607] border border-[#2C181B] text-[#C4B5A5] hover:text-white hover:border-[#F5EFE6]/50 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Action Button */}
                              <button
                                type="button"
                                onClick={() => setDeletingArticle(art)}
                                title="Delete Article"
                                className="p-1.5 rounded-lg bg-[#0B0607] border border-[#2C181B] text-[#8A8175] hover:text-[#D6334A] hover:border-[#D6334A]/50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Links */}
                              {art.status === "published" && (
                                <a
                                  href={`/blog/${art.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:underline font-mono text-xs inline-flex items-center gap-0.5"
                                >
                                  <span>Live</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {art.status === "pending_approval" && art.approval_token && (
                                <a
                                  href={`/journals/review?token=${encodeURIComponent(art.approval_token)}&action=approve`}
                                  className="text-[#D6334A] hover:underline font-mono text-xs font-semibold"
                                >
                                  Review
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Infinite Scroll Sentinel & Indicator */}
                  <div
                    ref={tableSentinelRef}
                    className="p-4 text-center font-mono text-xs text-[#8A8175] border-t border-[#2C181B]/50 flex items-center justify-center gap-2 bg-[#0B0607]/60"
                  >
                    {visibleArticles.length < filteredArticles.length ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-[#D6334A] animate-spin" />
                        <span>Scroll down to load more articles...</span>
                      </>
                    ) : (
                      <span>✓ All {filteredArticles.length} articles loaded</span>
                    )}
                  </div>
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
            {/* Top GSC Metric Tiles */}
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

            {/* Capability 1: Keyword Cannibalization Checker Tool */}
            <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl text-[#F5EFE6] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#D6334A]" />
                    <span>Keyword Cannibalization Checker</span>
                  </h2>
                  <p className="font-mono text-xs text-[#8A8175] mt-1">
                    Before selecting or writing a topic, check existing WebziFire articles to avoid repeatedly targeting the same keyword.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCheckCannibalization} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={kwCheckInput}
                  onChange={(e) => setKwCheckInput(e.target.value)}
                  placeholder="e.g. custom crm software development, postgresql enterprise erp..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-xs placeholder:text-[#8A8175] focus:border-[#D6334A] outline-none"
                />
                <button
                  type="submit"
                  disabled={kwChecking || !kwCheckInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D6334A] hover:bg-[#e0455b] text-white font-mono text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer"
                >
                  {kwChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>{kwChecking ? "Checking Overlap..." : "Check Overlap"}</span>
                </button>
              </form>

              {kwCheckResult && (
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                    kwCheckResult.severity === "high"
                      ? "bg-[#D6334A]/10 border-[#D6334A]/50 text-[#ffb3ae]"
                      : kwCheckResult.severity === "medium"
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                      : "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold tracking-wider">
                      {kwCheckResult.severity === "high"
                        ? "⚠️ High Cannibalization Risk"
                        : kwCheckResult.severity === "medium"
                        ? "⚡ Moderate Thematic Overlap"
                        : "✓ Unique Target Keyword"}
                    </span>
                    <span className="font-mono text-xs">
                      Similarity: {Math.round((kwCheckResult.similarity || 0) * 100)}%
                    </span>
                  </div>

                  {kwCheckResult.conflictingArticle && (
                    <div className="text-xs">
                      Conflicting Article:{" "}
                      <strong className="underline">
                        {kwCheckResult.conflictingArticle.title}
                      </strong>{" "}
                      (/blog/{kwCheckResult.conflictingArticle.slug})
                    </div>
                  )}

                  {kwCheckResult.reason && (
                    <p className="text-xs leading-relaxed opacity-90">{kwCheckResult.reason}</p>
                  )}

                  {Array.isArray(kwCheckResult.suggestions) && kwCheckResult.suggestions.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-current/20 font-mono text-[11px]">
                      <div className="font-semibold uppercase">Differentiation Recommendations:</div>
                      {kwCheckResult.suggestions.map((s: string, idx: number) => (
                        <div key={idx}>• {s}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Capability 4: 30–60 Day Content Refresh Engine Card */}
            <div className="bg-[#140A0C] border border-[#2C181B] rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-[#F5EFE6] flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-emerald-400" />
                    <span>30–60 Day Content Refresh Engine</span>
                  </h2>
                  <p className="font-mono text-xs text-[#8A8175] mt-1">
                    Audits older published articles against live Google impressions and modern engineering standards. Sends refresh recommendations to founder email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunContentRefreshAudit}
                  disabled={runningRefreshAudit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-all shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningRefreshAudit ? "animate-spin" : ""}`} />
                  <span>{runningRefreshAudit ? "Auditing Content..." : "Run 30–60d Audit"}</span>
                </button>
              </div>

              {refreshResult && (
                <div className="p-4 rounded-xl bg-[#0B0607] border border-emerald-500/40 text-xs text-[#C4B5A5] space-y-2">
                  <div className="flex items-center gap-2 font-mono text-emerald-300 font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Audit Report Generated &amp; Emailed</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div>Audited: <strong className="text-white">{refreshResult.totalAudited}</strong></div>
                    <div>Underperforming: <strong className="text-amber-300">{refreshResult.underperformingCount}</strong></div>
                    <div>Outdated Tech: <strong className="text-amber-300">{refreshResult.outdatedCount}</strong></div>
                    <div>Recommendations: <strong className="text-emerald-300">{refreshResult.recommendationsCreated}</strong></div>
                  </div>
                  {refreshResult.emailSentTo && (
                    <div className="font-mono text-[11px] text-[#8A8175]">
                      Digest dispatched to: <span className="text-[#F5EFE6]">{refreshResult.emailSentTo}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Performance Recommendations */}
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

        {/* MODAL 1: EDIT ARTICLE MODAL */}
        {editingArticle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-[#140A0C] border border-[#2C181B] rounded-3xl p-6 md:p-8 flex flex-col gap-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2C181B] pb-4">
                <div>
                  <h3 className="font-display text-xl text-[#F5EFE6]">Edit Journal Article</h3>
                  <p className="font-mono text-xs text-[#8A8175] mt-0.5">
                    Update metadata, copy, or featured 1080p image. Changes save immediately to live journal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="w-8 h-8 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center text-[#8A8175] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase text-[#C4B5A5]">Article Title (H1)</label>
                  <input
                    type="text"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-sm focus:border-[#D6334A] outline-none"
                    required
                  />
                </div>

                {/* Slug & Pillar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs uppercase text-[#C4B5A5]">Slug (/blog/[slug])</label>
                    <input
                      type="text"
                      value={editingArticle.slug}
                      onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] font-mono text-xs focus:border-[#D6334A] outline-none"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs uppercase text-[#C4B5A5]">Service Pillar</label>
                    <select
                      value={editingArticle.service_pillar}
                      onChange={(e) =>
                        setEditingArticle({
                          ...editingArticle,
                          service_pillar: e.target.value,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-sm focus:border-[#D6334A] outline-none"
                    >
                      {SERVICE_PILLARS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status & Read Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs uppercase text-[#C4B5A5]">Article Status</label>
                    <select
                      value={editingArticle.status}
                      onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-sm focus:border-[#D6334A] outline-none"
                    >
                      <option value="drafting">Drafting</option>
                      <option value="qa_revising">QA Revising</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="revision_requested">Revision Requested</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs uppercase text-[#C4B5A5]">Read Time</label>
                    <input
                      type="text"
                      value={editingArticle.read_time || "7 min read"}
                      onChange={(e) => setEditingArticle({ ...editingArticle, read_time: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-sm focus:border-[#D6334A] outline-none"
                    />
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase text-[#C4B5A5]">Executive Summary / Excerpt</label>
                  <textarea
                    rows={3}
                    value={editingArticle.summary || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-sm focus:border-[#D6334A] outline-none resize-y"
                  />
                </div>

                {/* Key Architectural Takeaway */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs uppercase text-[#C4B5A5]">Key Takeaway</label>
                  <textarea
                    rows={2}
                    value={editingArticle.takeaway || ""}
                    onChange={(e) => setEditingArticle({ ...editingArticle, takeaway: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0607] border border-[#2C181B] text-[#F5EFE6] text-sm focus:border-[#D6334A] outline-none resize-y"
                  />
                </div>

                {/* Featured Image Management */}
                <div className="p-4 rounded-2xl bg-[#0B0607] border border-[#2C181B] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-bold text-[#F5EFE6] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D6334A]" />
                      <span>Featured 16:9 Image</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRegenerateImage(editingArticle.id)}
                      disabled={isRegeneratingImage}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1B0E10] border border-[#D6334A]/50 hover:bg-[#D6334A] text-[#F5EFE6] font-mono text-xs cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isRegeneratingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>{isRegeneratingImage ? "Generating FLUX 1080p..." : "✨ Regenerate FLUX 1080p"}</span>
                    </button>
                  </div>

                  {/* Image Preview Box */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#2C181B] bg-[#140A0C]">
                    {editingArticle.image_url ? (
                      <img
                        src={editingArticle.image_url}
                        alt={editingArticle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8A8175] text-xs font-mono">
                        No image set
                      </div>
                    )}
                    {isRegeneratingImage && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
                        <Loader2 className="w-7 h-7 text-[#D6334A] animate-spin" />
                        <span className="font-mono text-xs">Generating ultra-HD FLUX 1080p image & uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Direct URL input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[11px] uppercase text-[#8A8175]">Image URL</label>
                    <input
                      type="url"
                      value={editingArticle.image_url || ""}
                      onChange={(e) => setEditingArticle({ ...editingArticle, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#140A0C] border border-[#2C181B] text-[#F5EFE6] font-mono text-xs focus:border-[#D6334A] outline-none"
                    />
                  </div>

                  {/* Quick Photography Presets */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[11px] uppercase text-[#8A8175]">
                      Or select from curated 1080p enterprise photography presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_PHOTOS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setEditingArticle({ ...editingArticle, image_url: preset.url })}
                          className={`px-3 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
                            editingArticle.image_url === preset.url
                              ? "bg-[#D6334A] text-white"
                              : "bg-[#140A0C] border border-[#2C181B] text-[#C4B5A5] hover:text-white hover:border-[#D6334A]/50"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C181B]">
                  <button
                    type="button"
                    onClick={() => setEditingArticle(null)}
                    className="px-5 py-2.5 rounded-full bg-[#140A0C] border border-[#2C181B] text-[#C4B5A5] hover:text-white font-mono text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D6334A] hover:bg-[#e0455b] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEdit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingEdit ? "Saving Changes..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: DELETE CONFIRMATION MODAL */}
        {deletingArticle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#140A0C] border border-[#D6334A]/40 rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#D6334A]/15 border border-[#D6334A]/30 flex items-center justify-center text-[#D6334A]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-[#F5EFE6]">Delete Article?</h3>
                  <p className="font-mono text-xs text-[#8A8175]">Permanent action</p>
                </div>
              </div>

              <p className="text-sm text-[#C4B5A5] leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-white">&ldquo;{deletingArticle.title}&rdquo;</strong> (
                <span className="font-mono text-xs text-[#D6334A]">/blog/{deletingArticle.slug}</span>
                )?
              </p>
              <p className="text-xs text-[#8A8175]">
                This will remove the article draft, quality scoring records, and associated pipeline history.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingArticle(null)}
                  className="px-4 py-2 rounded-full bg-[#0B0607] border border-[#2C181B] text-[#C4B5A5] hover:text-white font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D6334A] hover:bg-[#b02237] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: GOOGLE SEARCH CONSOLE TELEMETRY MODAL */}
        {gscModalArticle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#140A0C] border border-[#2C181B] rounded-3xl p-6 md:p-8 flex flex-col gap-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2C181B] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-[#F5EFE6]">Google Search Console Telemetry</h3>
                    <p className="font-mono text-xs text-[#8A8175] mt-0.5">
                      /blog/{gscModalArticle.slug}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGscModalArticle(null)}
                  className="w-8 h-8 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center text-[#8A8175] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {gscLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#C4B5A5]">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                  <span className="font-mono text-xs">Querying Google Search Console API...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Article Title */}
                  <div className="text-base font-semibold text-[#F5EFE6]">
                    {gscModalArticle.title}
                  </div>

                  {/* Indexing Diagnostic Card */}
                  <div className="p-4 rounded-2xl bg-[#0B0607] border border-[#2C181B] flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs uppercase text-[#8A8175]">Indexing State:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase ${
                            gscDetails?.indexingStatus === "indexed"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {gscDetails?.indexingStatus === "indexed" ? "✓ Indexed by Google" : "Submitted / In Crawl Queue"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleReinspectGsc(gscModalArticle.slug)}
                        disabled={inspectingGsc}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] hover:border-emerald-500/50 text-xs font-mono text-[#F5EFE6] cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${inspectingGsc ? "animate-spin" : ""}`} />
                        <span>{inspectingGsc ? "Re-inspecting..." : "Re-inspect with Google"}</span>
                      </button>
                    </div>

                    <div className="text-xs text-[#C4B5A5] font-mono space-y-1">
                      <div>Coverage: <span className="text-[#F5EFE6]">{gscDetails?.coverageState || "Sitemap Submitted"}</span></div>
                      {gscDetails?.lastCrawlTime && (
                        <div>Last Googlebot Crawl: <span className="text-[#F5EFE6]">{new Date(gscDetails.lastCrawlTime).toLocaleString()}</span></div>
                      )}
                      {gscDetails?.message && (
                        <div className="text-[#8A8175] pt-1 text-[11px]">{gscDetails.message}</div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B]">
                      <div className="font-mono text-[10px] uppercase text-[#8A8175]">28d Impressions</div>
                      <div className="font-display text-2xl text-[#F5EFE6] mt-1">{gscDetails?.impressions ?? 0}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B]">
                      <div className="font-mono text-[10px] uppercase text-[#8A8175]">28d Clicks</div>
                      <div className="font-display text-2xl text-emerald-400 mt-1">{gscDetails?.clicks ?? 0}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B]">
                      <div className="font-mono text-[10px] uppercase text-[#8A8175]">CTR</div>
                      <div className="font-display text-2xl text-[#F5EFE6] mt-1">
                        {((gscDetails?.ctr ?? 0) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B]">
                      <div className="font-mono text-[10px] uppercase text-[#8A8175]">Avg Position</div>
                      <div className="font-display text-2xl text-[#D6334A] mt-1">
                        {gscDetails?.avgPosition || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Queries Generating Impressions */}
                  <div className="p-4 rounded-2xl bg-[#0B0607] border border-[#2C181B] space-y-3">
                    <div className="font-mono text-xs uppercase font-bold text-[#F5EFE6]">
                      Search Queries Driving Impressions &amp; Clicks
                    </div>
                    {gscDetails?.topQueries && gscDetails.topQueries.length > 0 ? (
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-[#2C181B] text-[#8A8175] text-[10px] uppercase">
                            <th className="py-2">Query</th>
                            <th className="py-2 text-right">Impressions</th>
                            <th className="py-2 text-right">Clicks</th>
                            <th className="py-2 text-right">Avg Pos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2C181B]/50">
                          {gscDetails.topQueries.map((q: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-2 text-[#F5EFE6]">{q.query}</td>
                              <td className="py-2 text-right text-[#C4B5A5]">{q.impressions}</td>
                              <td className="py-2 text-right text-emerald-400">{q.clicks}</td>
                              <td className="py-2 text-right text-[#8A8175]">{q.position}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-xs text-[#8A8175] leading-relaxed">
                        No specific search query impressions registered yet. As Google indexes the article, emerging search queries from founders and CTOs will appear here automatically.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-[#2C181B]">
                <button
                  type="button"
                  onClick={() => setGscModalArticle(null)}
                  className="px-5 py-2 rounded-full bg-[#140A0C] border border-[#2C181B] text-[#C4B5A5] hover:text-white font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: TECHNICAL FACT & SOURCE VERIFICATION MODAL */}
        {factModalArticle && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#140A0C] border border-[#2C181B] rounded-3xl p-6 md:p-8 flex flex-col gap-6 my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#2C181B] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D6334A]/15 border border-[#D6334A]/30 flex items-center justify-center text-[#D6334A]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-[#F5EFE6]">Source &amp; Fact Verification</h3>
                    <p className="font-mono text-xs text-[#8A8175] mt-0.5">
                      /blog/{factModalArticle.slug}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFactModalArticle(null)}
                  className="w-8 h-8 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center text-[#8A8175] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {factLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#C4B5A5]">
                  <Loader2 className="w-7 h-7 text-[#D6334A] animate-spin" />
                  <span className="font-mono text-xs">Auditing technical claims &amp; link integrity...</span>
                </div>
              ) : factReport ? (
                <div className="flex flex-col gap-5">
                  {/* Factual Score Hero Card */}
                  <div className="p-4 rounded-2xl bg-[#0B0607] border border-[#2C181B] flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs uppercase text-[#8A8175]">Factual Integrity Score</div>
                      <div className="font-display text-3xl text-emerald-400 mt-1">
                        {factReport.factualScore}/100
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-mono text-xs font-bold uppercase ${
                        factReport.overallPassed
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "bg-[#D6334A]/15 text-[#ffb3ae] border border-[#D6334A]/30"
                      }`}
                    >
                      {factReport.overallPassed ? "✓ All Checks Passed" : "⚠️ Factual Warnings"}
                    </span>
                  </div>

                  {/* 4 Core Verification Pillar Badges */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#0B0607] border border-[#2C181B] flex items-center justify-between">
                      <span className="text-[#C4B5A5]">Case Studies</span>
                      <span className="text-emerald-400 font-bold">
                        {factReport.caseStudiesVerified ? "✓ No Fake Clients" : "⚠️ Review"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0607] border border-[#2C181B] flex items-center justify-between">
                      <span className="text-[#C4B5A5]">Statistics</span>
                      <span className="text-emerald-400 font-bold">
                        {factReport.statisticsVerified ? "✓ Zero Invented Stats" : "⚠️ Review"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0607] border border-[#2C181B] flex items-center justify-between">
                      <span className="text-[#C4B5A5]">Link Safety</span>
                      <span className="text-emerald-400 font-bold">
                        {factReport.linksVerified ? "✓ Valid URLs" : "⚠️ Invalid Link"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0B0607] border border-[#2C181B] flex items-center justify-between">
                      <span className="text-[#C4B5A5]">Engineering Standards</span>
                      <span className="text-emerald-400 font-bold">
                        {factReport.technicalAccuracyVerified ? "✓ Verified Sound" : "⚠️ Review"}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[#C4B5A5] leading-relaxed p-3.5 rounded-xl bg-[#0B0607] border border-[#2C181B]">
                    {factReport.summary}
                  </p>

                  {/* Verified Claims */}
                  {Array.isArray(factReport.verifiedClaims) && factReport.verifiedClaims.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] space-y-2">
                      <div className="font-mono text-xs uppercase font-bold text-emerald-300">
                        Verified Software Engineering Principles:
                      </div>
                      <div className="space-y-1 font-mono text-xs text-[#C4B5A5]">
                        {factReport.verifiedClaims.map((c: string, idx: number) => (
                          <div key={idx}>✓ {c}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Violations if any */}
                  {Array.isArray(factReport.violations) && factReport.violations.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#D6334A]/10 border border-[#D6334A]/30 space-y-2">
                      <div className="font-mono text-xs uppercase font-bold text-[#ffb3ae]">
                        Flagged Claims to Adjust:
                      </div>
                      <div className="space-y-2 text-xs text-[#ffb3ae]">
                        {factReport.violations.map((v: any, idx: number) => (
                          <div key={idx} className="p-2 rounded bg-black/40 border border-[#D6334A]/20">
                            <div><strong>Claim:</strong> &ldquo;{v.claimText}&rdquo;</div>
                            <div className="text-white/80 mt-0.5"><strong>Reason:</strong> {v.reason}</div>
                            <div className="text-emerald-300 mt-0.5"><strong>Fix:</strong> {v.suggestedFix}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex justify-end pt-2 border-t border-[#2C181B]">
                <button
                  type="button"
                  onClick={() => setFactModalArticle(null)}
                  className="px-5 py-2 rounded-full bg-[#140A0C] border border-[#2C181B] text-[#C4B5A5] hover:text-white font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
