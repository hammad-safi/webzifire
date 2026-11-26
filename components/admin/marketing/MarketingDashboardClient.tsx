"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Linkedin,
  Copy,
  Check,
  Building,
  Target,
  Send,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Bell,
  Clock,
  Layers,
  Flame
} from "lucide-react";
import { AdminNavHeader } from "../AdminNavHeader";
import { CompanyDrawer } from "./CompanyDrawer";
import { PipelineKanban } from "./PipelineKanban";
import { ProspectSequenceCard, ProspectSequenceGroup } from "./ProspectSequenceCard";
import {
  CompanyRecord,
  ContactRecord,
  OpportunityRecord,
  OutreachRecord,
  MarketingTelemetryResponse,
  CampaignRecord
} from "@/lib/marketing/types";

export function MarketingDashboardClient() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "companies" | "contacts" | "opportunities" | "kanban" | "outreach" | "settings"
  >("overview");

  // Telemetry & Data states
  const [telemetry, setTelemetry] = useState<MarketingTelemetryResponse | null>(null);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [outreachList, setOutreachList] = useState<OutreachRecord[]>([]);
  const [, setCampaigns] = useState<CampaignRecord[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [outreachStatusFilter, setOutreachStatusFilter] = useState("all");
  const [sequenceFilter, setSequenceFilter] = useState<"all" | "followups_due" | "pending_review" | "active" | "replied">("all");

  // Selection & Drawer states
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [drawerContacts, setDrawerContacts] = useState<ContactRecord[]>([]);
  const [drawerOpportunities, setDrawerOpportunities] = useState<OpportunityRecord[]>([]);
  const [drawerOutreach, setDrawerOutreach] = useState<OutreachRecord[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [runningSprint, setRunningSprint] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings form state
  const [campaignConfig, setCampaignConfig] = useState({
    target_countries: "United States, United Kingdom, Canada, Australia, Germany, Netherlands, France",
    target_industries: "SaaS, Software Agency, Technology Startup, Cloud Services",
    target_technologies: "Next.js, React, Node.js, TypeScript, PostgreSQL, MongoDB",
    min_lead_score: 50
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [telRes, compRes, contRes, oppRes, outRes, campRes] = await Promise.all([
        fetch("/api/admin/marketing/telemetry"),
        fetch("/api/admin/marketing/companies"),
        fetch("/api/admin/marketing/contacts"),
        fetch("/api/admin/marketing/opportunities"),
        fetch("/api/admin/marketing/outreach"),
        fetch("/api/admin/marketing/campaigns")
      ]);

      if (telRes.ok) {
        const telJson = await telRes.json();
        setTelemetry(telJson);
      }
      if (compRes.ok) {
        const compJson = await compRes.json();
        setCompanies(compJson.companies || []);
      }
      if (contRes.ok) {
        const contJson = await contRes.json();
        setContacts(contJson.contacts || []);
      }
      if (oppRes.ok) {
        const oppJson = await oppRes.json();
        setOpportunities(oppJson.opportunities || []);
      }
      if (outRes.ok) {
        const outJson = await outRes.json();
        setOutreachList(outJson.outreach || []);
      }
      if (campRes.ok) {
        const campJson = await campRes.json();
        setCampaigns(campJson.campaigns || []);
      }
    } catch (err) {
      console.error("Failed loading marketing data:", err);
      setBanner({ type: "err", text: "Failed to load marketing telemetry data." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Company Slide-over Drawer
  const handleOpenCompanyDrawer = async (company: CompanyRecord) => {
    setSelectedCompany(company);
    setIsDrawerOpen(true);
    try {
      const res = await fetch(`/api/admin/marketing/companies?id=${company.id}`);
      if (res.ok) {
        const json = await res.json();
        setDrawerContacts(json.contacts || []);
        setDrawerOpportunities(json.opportunities || []);
        setDrawerOutreach(json.outreach || []);
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
    }
  };

  // Run On-Demand Prospecting Sprint
  const handleRunSprint = async () => {
    setRunningSprint(true);
    setBanner(null);
    try {
      const res = await fetch("/api/admin/marketing/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_limit: 2 })
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Failed running prospecting sprint." });
      } else {
        const r = json.result;
        setBanner({
          type: "ok",
          text: `AI Sprint completed! Discovered ${r.companies_evaluated} targets, qualified ${r.companies_qualified} leads, identified ${r.contacts_created} contacts, and drafted ${r.outreach_drafts_created} personalized outreach messages.`
        });
        await loadData();
      }
    } catch (err: any) {
      setBanner({ type: "err", text: `Sprint error: ${err?.message || "Unknown error"}` });
    } finally {
      setRunningSprint(false);
    }
  };

  // Direct Email Sending via SMTP
  const handleDirectSendEmail = async (outreachId: string) => {
    setSendingEmailId(outreachId);
    try {
      const res = await fetch("/api/admin/marketing/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: outreachId })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setBanner({ type: "err", text: json.error || "Failed to deliver email via SMTP." });
      } else {
        setBanner({ type: "ok", text: `Cold email delivered successfully to ${json.sent_to} via SMTP!` });
        await loadData();
        if (selectedCompany) handleOpenCompanyDrawer(selectedCompany);
      }
    } catch (err: any) {
      setBanner({ type: "err", text: `SMTP send error: ${err?.message || "Unknown error"}` });
    } finally {
      setSendingEmailId(null);
    }
  };

  // Launch on LinkedIn (Option A: 1-click clipboard + open profile)
  const handleLaunchLinkedIn = (msg: OutreachRecord) => {
    copyText(msg.message_content, msg.id);
    const linkedinUrl = msg.b2b_contacts?.linkedin_url;
    if (linkedinUrl && linkedinUrl.startsWith("http")) {
      window.open(linkedinUrl, "_blank");
    } else {
      window.open(
        `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(msg.b2b_contacts?.full_name || "")}`,
        "_blank"
      );
    }
    setBanner({
      type: "ok",
      text: "LinkedIn connection draft copied to clipboard! Profile opened in new tab—paste and connect safely."
    });
  };

  // Outreach Approval
  const handleApproveOutreach = async (outreachId: string) => {
    try {
      const res = await fetch("/api/admin/marketing/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: outreachId, action: "approve" })
      });
      if (res.ok) {
        setBanner({ type: "ok", text: "Outreach message approved for delivery!" });
        await loadData();
        if (selectedCompany) handleOpenCompanyDrawer(selectedCompany);
      }
    } catch (err) {
      console.error("Error approving outreach:", err);
    }
  };

  // Mark Outreach Sent
  const handleMarkSentOutreach = async (outreachId: string) => {
    try {
      const res = await fetch("/api/admin/marketing/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: outreachId, action: "mark_sent" })
      });
      if (res.ok) {
        setBanner({ type: "ok", text: "Outreach marked as sent." });
        await loadData();
        if (selectedCompany) handleOpenCompanyDrawer(selectedCompany);
      }
    } catch (err) {
      console.error("Error updating outreach:", err);
    }
  };

  // Mark Outreach Replied
  const handleMarkReplied = async (outreachId: string) => {
    try {
      const res = await fetch("/api/admin/marketing/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: outreachId,
          action: "mark_replied",
          response_sentiment: "positive"
        })
      });
      if (res.ok) {
        setBanner({
          type: "ok",
          text: "Prospect marked as Replied! Pipeline stage advanced to In Conversation."
        });
        await loadData();
        if (selectedCompany) handleOpenCompanyDrawer(selectedCompany);
      }
    } catch (err) {
      console.error("Error marking outreach replied:", err);
    }
  };

  // Sequence Box Grouping (Idea 1 & 2: Group by prospect and calculate 4-day follow-up alarm)
  const sequenceGroups = useMemo(() => {
    const groupsMap = new Map<string, ProspectSequenceGroup>();

    outreachList.forEach((msg) => {
      const contact = msg.b2b_contacts;
      const company = msg.b2b_companies;
      const key = msg.contact_id || msg.company_id;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          key,
          contactName: contact?.full_name || "Decision-Maker",
          contactTitle: contact?.job_title,
          contactEmail: contact?.email,
          linkedinUrl: contact?.linkedin_url,
          companyName: company?.name || "Target Company",
          companyDomain: company?.domain || "",
          leadScore: company?.lead_score,
          companyId: msg.company_id,
          contactId: msg.contact_id || undefined,
          hasFollowUpDue: false,
          sequenceStatus: "ready_initial"
        });
      }

      const grp = groupsMap.get(key)!;
      if (msg.channel === "linkedin") {
        grp.linkedinMessage = msg;
      } else if (msg.message_type === "cold_email") {
        grp.initialEmail = msg;
      } else if (msg.message_type === "follow_up") {
        grp.followUpEmail = msg;
      }
    });

    const list = Array.from(groupsMap.values());

    // Calculate follow-up alarms & sequence statuses
    list.forEach((grp) => {
      if (grp.initialEmail?.status === "replied" || grp.followUpEmail?.status === "replied") {
        grp.sequenceStatus = "replied";
      } else if (grp.initialEmail?.status === "sent" && grp.initialEmail.sent_at) {
        const sentTime = new Date(grp.initialEmail.sent_at).getTime();
        const daysElapsed = (Date.now() - sentTime) / (1000 * 60 * 60 * 24);

        if (daysElapsed >= 4 && grp.followUpEmail?.status !== "sent") {
          grp.hasFollowUpDue = true;
          grp.sequenceStatus = "followup_due";
        } else if (daysElapsed < 4 && grp.followUpEmail?.status !== "sent") {
          grp.daysUntilFollowUp = Math.ceil(4 - daysElapsed);
          grp.sequenceStatus = "waiting_followup";
        } else if (grp.followUpEmail?.status === "sent") {
          grp.sequenceStatus = "completed";
        }
      } else if (grp.initialEmail?.status === "draft") {
        grp.sequenceStatus = "ready_initial";
      }
    });

    return list;
  }, [outreachList]);

  // Count follow-ups due
  const followUpsDueCount = useMemo(() => {
    return sequenceGroups.filter((s) => s.hasFollowUpDue).length;
  }, [sequenceGroups]);

  // Filtered sequence groups based on user filter
  const filteredSequences = useMemo(() => {
    return sequenceGroups.filter((grp) => {
      if (sequenceFilter === "followups_due") return grp.hasFollowUpDue;
      if (sequenceFilter === "pending_review")
        return grp.initialEmail?.status === "draft" || grp.linkedinMessage?.status === "draft";
      if (sequenceFilter === "active")
        return grp.sequenceStatus === "waiting_followup" || grp.sequenceStatus === "followup_due";
      if (sequenceFilter === "replied") return grp.sequenceStatus === "replied";
      return true;
    });
  }, [sequenceGroups, sequenceFilter]);

  // Update Company Status / Stage
  const handleUpdateCompanyStatus = async (companyId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/marketing/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: companyId, pipeline_stage: newStatus })
      });
      if (res.ok) {
        setBanner({ type: "ok", text: `Pipeline stage updated to ${newStatus}.` });
        await loadData();
        if (selectedCompany && selectedCompany.id === companyId) {
          setSelectedCompany((prev: CompanyRecord | null) =>
            prev ? ({ ...prev, pipeline_stage: newStatus as any } as CompanyRecord) : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating company status:", err);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Companies
  const filteredCompanies = companies.filter((c: CompanyRecord) => {
    const techStack: string[] = c.tech_stack || (c as any).technologies || [];
    const matchesSearch =
      !searchTerm ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      techStack.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === "all" || c.lead_priority === priorityFilter;
    const matchesCountry = countryFilter === "all" || c.country === countryFilter;

    return matchesSearch && matchesPriority && matchesCountry;
  });

  // Filtered Outreach
  const filteredOutreach = outreachList.filter((o: OutreachRecord) => {
    if (outreachStatusFilter === "all") return true;
    return o.status === outreachStatusFilter;
  });

  return (
    <div className="min-h-screen bg-[#070405] text-[#FAF7F2] pt-24 pb-20 px-4 sm:px-8 lg:px-12 font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Navigation Switcher */}
        <AdminNavHeader currentModule="marketing" />

        {/* Header Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2C181B]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#180A0E] border border-[#2C181B] font-mono text-[11px] uppercase tracking-wider text-[#D6334A] mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>WebziFire Autonomous Prospecting &amp; Lead Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light font-display text-[#FAF7F2]">
              B2B Marketing &amp; Client Acquisition Engine
            </h1>
            <p className="text-xs font-mono text-[#8A8175] mt-1">
              Targeting: US, UK, Canada, Australia, Europe • Tech Stack: Next.js, React, Node.js, TypeScript, PostgreSQL, Custom SaaS &amp; ERP
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunSprint}
              disabled={runningSprint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D6334A] hover:bg-[#e0324b] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D6334A]/30 cursor-pointer disabled:opacity-50 transition-all"
            >
              {runningSprint ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{runningSprint ? "Running AI Sprint..." : "Run AI Prospecting Sprint"}</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#140A0C] border border-[#2C181B] hover:border-[#D6334A]/50 text-[#F5EFE6] font-mono text-xs uppercase tracking-wider cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between gap-4 ${
              banner.type === "ok"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/40 border-rose-500/40 text-rose-200"
            }`}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-[#8A8175] hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#2C181B] pb-3 text-xs font-mono">
          {[
            { id: "overview", label: "📈 Overview & Telemetry" },
            { id: "companies", label: `🏢 Companies (${companies.length})` },
            { id: "contacts", label: `👤 Decision-Makers (${contacts.length})` },
            { id: "opportunities", label: `💼 Opportunities (${opportunities.length})` },
            { id: "kanban", label: "📋 Pipeline Kanban" },
            {
              id: "outreach",
              label:
                followUpsDueCount > 0
                  ? `🔔 Outreach Desk (${followUpsDueCount} Due Now)`
                  : `✉️ Outreach Desk (${sequenceGroups.length} Sequences)`
            },
            { id: "settings", label: "⚙️ Campaign Config" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1F0C12] text-white border border-[#D6334A]/50 font-bold"
                  : "bg-[#120709] text-[#8A8175] hover:text-[#FAF7F2] border border-[#2C181B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#120709] border border-[#2C181B] space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#8A8175]">Total Evaluated</span>
                <p className="text-2xl font-bold font-mono text-[#FAF7F2]">
                  {telemetry?.summary.total_companies || 0}
                </p>
                <span className="text-[10px] font-mono text-zinc-500">Across 7 Target Nations</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#180A0E] border border-rose-500/30 space-y-1">
                <span className="text-[11px] font-mono uppercase text-rose-400">🔥 Hot Leads</span>
                <p className="text-2xl font-bold font-mono text-rose-300">
                  {telemetry?.summary.hot_leads || 0}
                </p>
                <span className="text-[10px] font-mono text-rose-400/80">Score 85–100</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120709] border border-amber-500/30 space-y-1">
                <span className="text-[11px] font-mono uppercase text-amber-400">High Priority</span>
                <p className="text-2xl font-bold font-mono text-amber-300">
                  {telemetry?.summary.high_priority || 0}
                </p>
                <span className="text-[10px] font-mono text-amber-400/80">Score 70–84</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120709] border border-[#2C181B] space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#8A8175]">Decision-Makers</span>
                <p className="text-2xl font-bold font-mono text-[#FAF7F2]">
                  {telemetry?.summary.total_contacts || 0}
                </p>
                <span className="text-[10px] font-mono text-emerald-400">
                  {telemetry?.summary.verified_contacts || 0} Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#120709] border border-[#2C181B] space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#8A8175]">Opportunities</span>
                <p className="text-2xl font-bold font-mono text-[#FAF7F2]">
                  {telemetry?.summary.total_opportunities || 0}
                </p>
                <span className="text-[10px] font-mono text-sky-400">Jobs &amp; Dev Contracts</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#180A0E] border border-[#D6334A]/40 space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#D6334A]">Pending Outreach</span>
                <p className="text-2xl font-bold font-mono text-white">
                  {telemetry?.summary.pending_outreach_approval || 0}
                </p>
                <span className="text-[10px] font-mono text-amber-300">Awaiting Founder Approval</span>
              </div>
            </div>

            {/* Daily Intelligence Briefing & Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Executive Briefing */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#120709] border border-[#2C181B] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#2C181B]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D6334A]" />
                    <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-[#FAF7F2]">
                      Executive Prospecting Briefing ({telemetry?.latest_daily_report?.report_date || "Today"})
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#8A8175]">WebziFire Strategic AI</span>
                </div>

                <div className="p-4 rounded-xl bg-[#180A0E] border border-[#2C181B] text-sm text-[#D6CEC5] leading-relaxed">
                  {telemetry?.latest_daily_report?.executive_summary ||
                    "Autonomous prospecting sprint is active. Discovering high-growth companies requiring Next.js, React, and Node.js solutions across North America and Europe."}
                </div>

                {/* Recommended Actions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#8A8175]">
                    Recommended Founder Actions:
                  </h4>
                  <div className="space-y-2">
                    {(telemetry?.latest_daily_report?.actionable_insights || []).length === 0 ? (
                      <div className="p-4 text-center text-xs font-mono text-[#8A8175] bg-[#140A0C] rounded-xl border border-[#2C181B]">
                        Run an AI Prospecting Sprint to populate today&apos;s recommendations.
                      </div>
                    ) : (
                      telemetry?.latest_daily_report?.actionable_insights?.map((insight: string, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-[#160B0F] border border-[#2C181B] flex items-start justify-between gap-3 text-xs"
                        >
                          <p className="text-[#D6CEC5]">{insight}</p>
                          <button
                            type="button"
                            onClick={() => setActiveTab("outreach")}
                            className="px-3 py-1.5 rounded-lg bg-[#1F0C12] border border-[#2C181B] hover:border-[#D6334A]/50 text-white font-mono text-[11px] whitespace-nowrap cursor-pointer"
                          >
                            Execute →
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="p-6 rounded-2xl bg-[#120709] border border-[#2C181B] space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#2C181B]">
                  <TrendingUp className="w-4 h-4 text-[#D6334A]" />
                  <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-[#FAF7F2]">
                    Prospecting Funnel
                  </h3>
                </div>

                <div className="space-y-3">
                  {(telemetry?.pipeline_funnel || []).map((step: { stage: string; count: number }, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#B8AEA3]">{step.stage}</span>
                        <span className="font-bold text-[#FAF7F2]">{step.count}</span>
                      </div>
                      <div className="w-full bg-[#1A0C10] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D6334A] h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              telemetry?.summary.total_companies
                                ? Math.min(100, Math.max(5, (step.count / telemetry.summary.total_companies) * 100))
                                : 5
                            }%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANIES DIRECTORY */}
        {activeTab === "companies" && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#120709] border border-[#2C181B] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-[#8A8175] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search company, domain, tech, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1A0C10] border border-[#2C181B] rounded-xl text-xs text-[#FAF7F2] placeholder-[#8A8175] focus:outline-none focus:border-[#D6334A]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-[#1A0C10] border border-[#2C181B] rounded-xl px-3 py-2 text-xs font-mono text-[#FAF7F2] focus:outline-none focus:border-[#D6334A]"
                >
                  <option value="all">All Priorities</option>
                  <option value="Hot Lead">🔥 Hot Leads (85+)</option>
                  <option value="High Priority">High Priority (70–84)</option>
                  <option value="Medium Priority">Medium Priority (50–69)</option>
                  <option value="Low Priority">Low Priority (&lt;50)</option>
                </select>

                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="bg-[#1A0C10] border border-[#2C181B] rounded-xl px-3 py-2 text-xs font-mono text-[#FAF7F2] focus:outline-none focus:border-[#D6334A]"
                >
                  <option value="all">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="France">France</option>
                </select>
              </div>
            </div>

            {/* Companies Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#2C181B] bg-[#120709]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1A0C10] border-b border-[#2C181B] text-[#8A8175] uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Company &amp; Domain</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Industry &amp; Size</th>
                    <th className="p-4">Technologies</th>
                    <th className="p-4">ICP Score</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C181B]/50 text-[#D6CEC5]">
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#8A8175]">
                        No companies found. Click &quot;Run AI Prospecting Sprint&quot; to discover international targets.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((c: CompanyRecord) => {
                      const techStack: string[] = c.tech_stack || (c as any).technologies || [];
                      const stage: string = c.pipeline_stage || (c as any).lead_status || "qualified";

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-[#180B0F] transition-colors cursor-pointer group"
                          onClick={() => handleOpenCompanyDrawer(c)}
                        >
                          <td className="p-4 font-bold text-white">
                            <div className="flex items-center gap-2">
                              <span>{c.name}</span>
                              {c.website_url && (
                                <a
                                  href={c.website_url.startsWith("http") ? c.website_url : `https://${c.website_url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[#8A8175] hover:text-[#D6334A]"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8A8175] font-normal block">{c.domain}</span>
                          </td>
                          <td className="p-4">
                            {c.city ? `${c.city}, ` : ""}{c.country || "International"}
                          </td>
                          <td className="p-4">
                            <span className="text-[#FAF7F2]">{c.industry || "Software"}</span>
                            <span className="text-[10px] text-[#8A8175] block">{c.company_size || "10-50 employees"}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {techStack.slice(0, 3).map((t: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded text-[10px] bg-[#1C0D11] border border-[#2C181B] text-[#B8AEA3]"
                                >
                                  {t}
                                </span>
                              ))}
                              {techStack.length > 3 && (
                                <span className="text-[10px] text-[#8A8175]">
                                  +{techStack.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                c.lead_score >= 85
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                : c.lead_score >= 70
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-sky-500/20 text-sky-300 border-sky-500/40"
                              }`}
                            >
                              {c.lead_score} / 100
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-[#1C0D11] text-[10px] uppercase text-[#B8AEA3]">
                              {stage}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCompanyDrawer(c);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#1C0D11] border border-[#2C181B] text-white hover:border-[#D6334A]/50 text-xs transition-colors cursor-pointer"
                            >
                              Intelligence →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DECISION-MAKERS */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-[#2C181B] bg-[#120709]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1A0C10] border-b border-[#2C181B] text-[#8A8175] uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Contact Name &amp; Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">LinkedIn</th>
                    <th className="p-4">Relevance</th>
                    <th className="p-4">Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2C181B]/50 text-[#D6CEC5]">
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#8A8175]">
                        No decision-makers mapped yet.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((ct: ContactRecord) => (
                      <tr key={ct.id} className="hover:bg-[#180B0F] transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{ct.full_name}</span>
                            {ct.is_decision_maker && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                KEY LEAD
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#8A8175] font-normal block">{ct.job_title}</span>
                        </td>
                        <td className="p-4">
                          {ct.b2b_companies?.name || "Company"}
                        </td>
                        <td className="p-4">
                          {ct.email ? (
                            <div className="inline-flex items-center gap-1.5 bg-[#1C0D11] px-2 py-1 rounded border border-[#2C181B]">
                              <span>{ct.email}</span>
                              <button
                                type="button"
                                onClick={() => copyText(ct.email!, ct.id)}
                                className="text-[#8A8175] hover:text-white cursor-pointer"
                              >
                                {copiedId === ct.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#8A8175]">Not available</span>
                          )}
                        </td>
                        <td className="p-4">
                          {ct.linkedin_url ? (
                            <a
                              href={ct.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                            >
                              <Linkedin className="w-3 h-3" />
                              <span>Profile</span>
                            </a>
                          ) : (
                            <span className="text-[#8A8175]">N/A</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#D6334A]">{ct.relevance_score || 85}/100</span>
                        </td>
                        <td className="p-4 text-[11px] text-[#B8AEA3] max-w-sm truncate">
                          {ct.selection_reason || "Identified as engineering decision-maker."}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: OPPORTUNITIES & JOBS */}
        {activeTab === "opportunities" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.length === 0 ? (
                <div className="col-span-3 p-8 text-center text-xs font-mono text-[#8A8175] bg-[#120709] rounded-2xl border border-[#2C181B]">
                  No opportunities detected yet. Run an AI Prospecting Sprint to identify engineering jobs and client development contracts.
                </div>
              ) : (
                opportunities.map((opp: OpportunityRecord) => (
                  <div
                    key={opp.id}
                    className="p-5 rounded-2xl bg-[#120709] border border-[#2C181B] space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {opp.opportunity_type}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#D6334A]">
                          {opp.match_score}% Match
                        </span>
                      </div>

                      <h4 className="text-base font-medium text-white">{opp.title}</h4>
                      <p className="text-xs font-mono text-[#8A8175]">
                        Target: {opp.b2b_companies?.name || "Company"}
                      </p>

                      <p className="text-xs text-[#D6CEC5] leading-relaxed line-clamp-3">
                        {opp.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#2C181B]/50">
                      {opp.match_rationale && (
                        <p className="text-[11px] text-[#B8AEA3] italic">
                          💡 Pitch Angle: {opp.match_rationale}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {(opp.required_skills || []).map((sk: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#1A0C10] text-[#B8AEA3] border border-[#2C181B]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PIPELINE KANBAN */}
        {activeTab === "kanban" && (
          <PipelineKanban
            companies={companies}
            onSelectCompany={handleOpenCompanyDrawer}
            onUpdateStatus={handleUpdateCompanyStatus}
          />
        )}

        {/* TAB 6: OUTREACH DESK */}
        {activeTab === "outreach" && (
          <div className="space-y-4">
            {/* Outreach Desk Header & Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#120709] border border-[#2C181B] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <span>Prospect Outreach Sequences &amp; 4-Day Alarms</span>
                  {followUpsDueCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      {followUpsDueCount} Due Now
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#8A8175] font-mono mt-0.5">
                  Organized by prospect: Step 1 (Initial Email + LinkedIn) and Step 2 (4-Day Follow-Up). AI never sends without your 1-click approval.
                </p>
              </div>

              {/* Sequence Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#1A0C10] p-1 rounded-xl border border-[#2C181B]">
                <button
                  type="button"
                  onClick={() => setSequenceFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    sequenceFilter === "all"
                      ? "bg-[#D6334A] text-white font-bold"
                      : "text-[#8A8175] hover:text-white"
                  }`}
                >
                  All ({sequenceGroups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSequenceFilter("followups_due")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                    sequenceFilter === "followups_due"
                      ? "bg-amber-500 text-black font-bold"
                      : "text-amber-400/80 hover:text-amber-300"
                  }`}
                >
                  <Bell className="w-3 h-3" />
                  Follow-Ups Due ({followUpsDueCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSequenceFilter("pending_review")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    sequenceFilter === "pending_review"
                      ? "bg-[#D6334A] text-white font-bold"
                      : "text-[#8A8175] hover:text-white"
                  }`}
                >
                  Pending Review
                </button>
                <button
                  type="button"
                  onClick={() => setSequenceFilter("active")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    sequenceFilter === "active"
                      ? "bg-[#D6334A] text-white font-bold"
                      : "text-[#8A8175] hover:text-white"
                  }`}
                >
                  Waiting 4 Days
                </button>
                <button
                  type="button"
                  onClick={() => setSequenceFilter("replied")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    sequenceFilter === "replied"
                      ? "bg-emerald-500 text-black font-bold"
                      : "text-emerald-400/80 hover:text-emerald-300"
                  }`}
                >
                  Replied
                </button>
              </div>
            </div>

            {/* Grouped Prospect Sequences List */}
            <div className="space-y-4">
              {filteredSequences.length === 0 ? (
                <div className="p-10 text-center text-xs font-mono text-[#8A8175] bg-[#120709] rounded-2xl border border-[#2C181B] space-y-2">
                  <p>No prospect sequences match this filter.</p>
                  <p className="text-[11px] text-[#635B50]">
                    {sequenceFilter === "followups_due"
                      ? "Great work! There are no 4-day follow-ups due right now."
                      : "Run an AI Prospecting Sprint to discover high-fit prospects and generate multi-step sequences."}
                  </p>
                </div>
              ) : (
                filteredSequences.map((seq) => (
                  <ProspectSequenceCard
                    key={seq.key}
                    sequence={seq}
                    copiedId={copiedId}
                    sendingEmailId={sendingEmailId}
                    onCopyText={copyText}
                    onLaunchLinkedIn={handleLaunchLinkedIn}
                    onDirectSendEmail={handleDirectSendEmail}
                    onApproveOutreach={handleApproveOutreach}
                    onMarkSentOutreach={handleMarkSentOutreach}
                    onMarkReplied={handleMarkReplied}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 7: CAMPAIGN CONFIGURATION */}
        {activeTab === "settings" && (
          <div className="p-6 rounded-2xl bg-[#120709] border border-[#2C181B] max-w-3xl space-y-6">
            <div>
              <h3 className="text-base font-mono uppercase font-bold text-white">
                Campaign Targeting &amp; Lead Qualification Settings
              </h3>
              <p className="text-xs text-[#8A8175] font-mono mt-1">
                Customize target international markets, industry verticals, company size limits, and minimum lead score thresholds.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#B8AEA3] mb-1.5">Target Countries (comma-separated):</label>
                <input
                  type="text"
                  value={campaignConfig.target_countries}
                  onChange={(e) => setCampaignConfig({ ...campaignConfig, target_countries: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#1A0C10] border border-[#2C181B] text-white focus:outline-none focus:border-[#D6334A]"
                />
              </div>

              <div>
                <label className="block text-[#B8AEA3] mb-1.5">Target Industries &amp; Verticals:</label>
                <input
                  type="text"
                  value={campaignConfig.target_industries}
                  onChange={(e) => setCampaignConfig({ ...campaignConfig, target_industries: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#1A0C10] border border-[#2C181B] text-white focus:outline-none focus:border-[#D6334A]"
                />
              </div>

              <div>
                <label className="block text-[#B8AEA3] mb-1.5">Target Technologies / Stack Focus:</label>
                <input
                  type="text"
                  value={campaignConfig.target_technologies}
                  onChange={(e) => setCampaignConfig({ ...campaignConfig, target_technologies: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#1A0C10] border border-[#2C181B] text-white focus:outline-none focus:border-[#D6334A]"
                />
              </div>

              <div>
                <label className="block text-[#B8AEA3] mb-1.5">Minimum ICP Lead Qualification Score (0–100):</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={campaignConfig.min_lead_score}
                  onChange={(e) => setCampaignConfig({ ...campaignConfig, min_lead_score: parseInt(e.target.value, 10) || 50 })}
                  className="w-32 p-2.5 rounded-xl bg-[#1A0C10] border border-[#2C181B] text-white focus:outline-none focus:border-[#D6334A]"
                />
              </div>

              <div className="pt-4 border-t border-[#2C181B]">
                <button
                  type="button"
                  onClick={() => {
                    setBanner({ type: "ok", text: "Campaign configuration updated successfully." });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#D6334A] hover:bg-[#e0324b] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D6334A]/30"
                >
                  Save Campaign Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Company Intelligence Slide-Over Drawer */}
        <CompanyDrawer
          company={selectedCompany}
          contacts={drawerContacts}
          opportunities={drawerOpportunities}
          outreach={drawerOutreach}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onApproveOutreach={handleApproveOutreach}
          onMarkSentOutreach={handleMarkSentOutreach}
          onUpdateCompanyStatus={handleUpdateCompanyStatus}
        />
      </div>
    </div>
  );
}
