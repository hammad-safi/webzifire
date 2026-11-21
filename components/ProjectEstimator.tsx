"use client";

import React, { useState, useMemo } from "react";
import {
  Code2,
  Smartphone,
  Layers,
  Cpu,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Send,
  Loader2,
  Calendar,
  DollarSign,
  HelpCircle,
} from "lucide-react";

interface ServiceOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  baseWeeks: number;
  baseMinPrice: number;
  baseMaxPrice: number;
  recommendedStack: string;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "web-app",
    label: "Web App & Portal",
    desc: "Sub-second Next.js portal with reactive UI and high conversion",
    icon: Code2,
    baseWeeks: 5,
    baseMinPrice: 4500,
    baseMaxPrice: 9500,
    recommendedStack: "Next.js 14 · TypeScript · Tailwind CSS · Supabase Postgres",
  },
  {
    id: "mobile-app",
    label: "Mobile Application",
    desc: "Cross-platform iOS & Android with offline-first architecture",
    icon: Smartphone,
    baseWeeks: 8,
    baseMinPrice: 7500,
    baseMaxPrice: 15000,
    recommendedStack: "React Native / Expo · TypeScript · Node.js · Fast APIs",
  },
  {
    id: "erp-enterprise",
    label: "Custom ERP & Backoffice",
    desc: "Bespoke operations, inventory & logistics without per-seat licensing",
    icon: Layers,
    baseWeeks: 10,
    baseMinPrice: 12000,
    baseMaxPrice: 25000,
    recommendedStack: "Next.js · PostgreSQL · RBAC Security · Automated Workflows",
  },
  {
    id: "ai-agents",
    label: "AI Agents & Automation",
    desc: "Custom LLM agents, RAG pipelines, and automated business workflows",
    icon: Cpu,
    baseWeeks: 4,
    baseMinPrice: 5000,
    baseMaxPrice: 11000,
    recommendedStack: "Python / Node.js · Vector Databases · LLM Orchestration",
  },
  {
    id: "saas-product",
    label: "Multi-Tenant SaaS",
    desc: "Scalable subscription software with billing, teams, and analytics",
    icon: Sparkles,
    baseWeeks: 9,
    baseMinPrice: 9500,
    baseMaxPrice: 20000,
    recommendedStack: "Next.js · Supabase Auth · Stripe Billing · Postgres Multi-Tenancy",
  },
  {
    id: "ecommerce-pos",
    label: "Custom Commerce / POS",
    desc: "High-throughput store or retail system with real-time sync",
    icon: ShoppingBag,
    baseWeeks: 7,
    baseMinPrice: 6500,
    baseMaxPrice: 14000,
    recommendedStack: "Next.js · Headless API · Stripe Payments · Realtime Sync",
  },
];

const SCALES = [
  { id: "mvp", label: "MVP / Prototype", multiplier: 1.0, weeksAdd: 0, desc: "Fast-to-market, core features for launch" },
  { id: "growth", label: "Production & Growth", multiplier: 1.45, weeksAdd: 3, desc: "Built for scaling users, robust automated testing & CI/CD" },
  { id: "enterprise", label: "Enterprise Grade", multiplier: 2.1, weeksAdd: 6, desc: "High availability, SOC2/HIPAA ready, audit logs, 99.99% SLA" },
];

const FEATURE_MODULES = [
  { id: "auth-rbac", label: "Auth & Multi-Role Permissions", weeksAdd: 1, priceAdd: 800 },
  { id: "payments-billing", label: "Stripe Billing & Subscriptions", weeksAdd: 1.5, priceAdd: 1400 },
  { id: "realtime-chat", label: "Real-Time WebSockets & Notifications", weeksAdd: 1.5, priceAdd: 1200 },
  { id: "ai-rag", label: "Custom AI Assistant & Knowledge Base", weeksAdd: 2, priceAdd: 2200 },
  { id: "integrations", label: "Third-Party API & Webhook Connectors", weeksAdd: 1, priceAdd: 1000 },
  { id: "admin-analytics", label: "Executive Analytics & Reporting Command Center", weeksAdd: 1.5, priceAdd: 1500 },
];

export default function ProjectEstimator() {
  const [selectedService, setSelectedService] = useState<string>("web-app");
  const [selectedScale, setSelectedScale] = useState<string>("growth");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "auth-rbac",
    "payments-billing",
  ]);
  const [velocity, setVelocity] = useState<"standard" | "accelerated">("standard");

  // Client proposal form
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const calculation = useMemo(() => {
    const service = SERVICE_OPTIONS.find((s) => s.id === selectedService) || SERVICE_OPTIONS[0];
    const scale = SCALES.find((s) => s.id === selectedScale) || SCALES[0];

    const extraFeaturePrice = selectedFeatures.reduce((acc, fId) => {
      const feat = FEATURE_MODULES.find((m) => m.id === fId);
      return acc + (feat ? feat.priceAdd : 0);
    }, 0);

    const extraFeatureWeeks = selectedFeatures.reduce((acc, fId) => {
      const feat = FEATURE_MODULES.find((m) => m.id === fId);
      return acc + (feat ? feat.weeksAdd : 0);
    }, 0);

    const rawMin = Math.round((service.baseMinPrice * scale.multiplier + extraFeaturePrice) / 500) * 500;
    const rawMax = Math.round((service.baseMaxPrice * scale.multiplier + extraFeaturePrice * 1.3) / 500) * 500;

    let totalWeeks = Math.max(3, Math.round(service.baseWeeks + scale.weeksAdd + extraFeatureWeeks));
    if (velocity === "accelerated") {
      totalWeeks = Math.max(3, Math.round(totalWeeks * 0.7));
    }

    return {
      service,
      scale,
      minPrice: rawMin,
      maxPrice: rawMax,
      weeks: totalWeeks,
      recommendedStack: service.recommendedStack,
    };
  }, [selectedService, selectedScale, selectedFeatures, velocity]);

  const handleSubmitScope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const featureNames = selectedFeatures
        .map((fId) => FEATURE_MODULES.find((m) => m.id === fId)?.label)
        .filter(Boolean);

      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          number: clientPhone,
          services: [calculation.service.label],
          stage: calculation.scale.label,
          timeline: `${calculation.weeks} Weeks (${velocity === "accelerated" ? "Accelerated Sprint" : "Standard"})`,
          budget: `$${calculation.minPrice.toLocaleString()} – $${calculation.maxPrice.toLocaleString()} USD`,
          message: `Scope: ${calculation.service.label} (${calculation.scale.label})
Selected Modules: ${featureNames.join(", ") || "Standard"}
Velocity: ${velocity === "accelerated" ? "Accelerated Sprint (40% faster)" : "Standard Sprint"}
Recommended Stack: ${calculation.recommendedStack}
Client Notes: ${clientNotes || "None"}`,
          source: "Interactive Project Estimator",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedRef(data.referenceId || "WBZ-ESTIMATE");
      }
    } catch (err) {
      console.error("Scope submit error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="project-estimator"
      className="w-full rounded-3xl bg-[#140A0C] border border-[#2C181B] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.7)]"
    >
      {/* Background Ambient Glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 bg-[radial-gradient(circle,rgba(214,51,74,0.12),transparent_70%)] pointer-events-none blur-3xl"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F0F13] border border-[#2C181B] text-[#D6334A] font-mono text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Scope &amp; Architecture Estimator</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#F5EFE6] font-normal tracking-tight">
          Configure Your System. <em className="italic text-[#D6334A]">Calculate Your Sprint.</em>
        </h2>
        <p className="font-sans text-sm sm:text-base text-[#A29A8E] mt-2 leading-relaxed">
          Select your target platform, scale, and feature modules. Our engine provides an immediate
          architectural blueprint, estimated delivery window, and transparent pricing benchmark.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Selectors (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Step 1: Platform Selection */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[#C4B5A5] mb-3">
              Step 01 · Select Target Platform
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((srv) => {
                const Icon = srv.icon;
                const isSelected = selectedService === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedService(srv.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#220E13] border-[#D6334A] shadow-[0_0_20px_rgba(214,51,74,0.25)]"
                        : "bg-[#0B0607]/70 border-[#2C181B] hover:border-[#3D2226] hover:bg-[#140A0C]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? "bg-[#D6334A] text-white" : "bg-[#1B0E11] text-[#A29A8E]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#D6334A]" />}
                    </div>
                    <div>
                      <div className="font-display text-sm font-medium text-[#F5EFE6]">
                        {srv.label}
                      </div>
                      <div className="font-sans text-xs text-[#8A8175] mt-1 line-clamp-2 leading-relaxed">
                        {srv.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Scale & Maturity */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[#C4B5A5] mb-3">
              Step 02 · Select Scale &amp; Production Maturity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SCALES.map((scale) => {
                const isSelected = selectedScale === scale.id;
                return (
                  <button
                    key={scale.id}
                    type="button"
                    onClick={() => setSelectedScale(scale.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[#220E13] border-[#D6334A] shadow-[0_0_15px_rgba(214,51,74,0.2)]"
                        : "bg-[#0B0607]/70 border-[#2C181B] hover:border-[#3D2226]"
                    }`}
                  >
                    <div className="font-display text-xs font-semibold text-[#F5EFE6] flex items-center justify-between">
                      <span>{scale.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#D6334A]" />}
                    </div>
                    <p className="text-[11px] text-[#8A8175] mt-1 leading-snug">{scale.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Feature Modules */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[#C4B5A5] mb-3">
              Step 03 · Specialized Capabilities &amp; Integrations
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FEATURE_MODULES.map((feat) => {
                const isSelected = selectedFeatures.includes(feat.id);
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => toggleFeature(feat.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#220E13]/80 border-[#D6334A]/80 text-[#F5EFE6]"
                        : "bg-[#0B0607]/60 border-[#2C181B] text-[#A29A8E] hover:border-[#3D2226]"
                    }`}
                  >
                    <span className="font-sans font-medium pr-2">{feat.label}</span>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                        isSelected ? "bg-[#D6334A] border-[#D6334A] text-white" : "border-[#3D2226]"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Sprint Velocity */}
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[#C4B5A5] mb-3">
              Step 04 · Target Delivery Velocity
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVelocity("standard")}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  velocity === "standard"
                    ? "bg-[#220E13] border-[#D6334A]"
                    : "bg-[#0B0607]/70 border-[#2C181B] text-[#8A8175]"
                }`}
              >
                <div className="font-display text-xs font-semibold text-[#F5EFE6]">
                  Standard Milestones
                </div>
                <div className="text-[11px] text-[#8A8175] mt-0.5">
                  Sequential 2-week agile sprints
                </div>
              </button>
              <button
                type="button"
                onClick={() => setVelocity("accelerated")}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  velocity === "accelerated"
                    ? "bg-[#220E13] border-[#D6334A]"
                    : "bg-[#0B0607]/70 border-[#2C181B] text-[#8A8175]"
                }`}
              >
                <div className="font-display text-xs font-semibold text-[#F5EFE6] flex items-center gap-1.5">
                  <span>Accelerated Sprint</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D6334A]/20 text-[#D6334A] uppercase font-mono">
                    Fast Track
                  </span>
                </div>
                <div className="text-[11px] text-[#8A8175] mt-0.5">
                  Dedicated parallel engineering pods
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Output & 1-Click Proposal (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0B0607] rounded-2xl border border-[#2C181B] p-6 lg:p-7 flex flex-col gap-6 lg:sticky lg:top-28 shadow-xl">
          {/* Header Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2C181B]">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175]">
                Architecture Estimate
              </div>
              <div className="font-display text-base font-semibold text-[#F5EFE6] mt-0.5">
                {calculation.service.label}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Fixed Scope Ready
            </span>
          </div>

          {/* Key Metrics: Timeline & Investment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#140A0C] border border-[#2C181B]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8A8175] uppercase">
                <Clock className="w-3.5 h-3.5 text-[#D6334A]" />
                <span>Est. Timeline</span>
              </div>
              <div className="font-display text-2xl font-bold text-[#F5EFE6] mt-2">
                {calculation.weeks}{" "}
                <span className="text-xs font-normal text-[#8A8175]">Weeks</span>
              </div>
              <div className="text-[10px] text-[#8A8175] font-mono mt-1">
                {velocity === "accelerated" ? "Accelerated pod" : "Agile delivery"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#140A0C] border border-[#2C181B]">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8A8175] uppercase">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Investment Est.</span>
              </div>
              <div className="font-display text-xl font-bold text-emerald-400 mt-2">
                ${calculation.minPrice.toLocaleString()}{" "}
                <span className="text-xs font-normal text-[#8A8175]">
                  – ${calculation.maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="text-[10px] text-[#8A8175] font-mono mt-1">USD · All IP Handover</div>
            </div>
          </div>

          {/* Recommended Stack */}
          <div className="p-3.5 rounded-xl bg-[#140A0C] border border-[#2C181B]">
            <div className="font-mono text-[10px] uppercase text-[#8A8175] tracking-wider mb-1.5 flex items-center gap-1.5">
              <Code2 className="w-3 h-3 text-[#D6334A]" />
              <span>Recommended Architecture Stack</span>
            </div>
            <div className="font-mono text-xs text-[#E8DFD1] leading-relaxed">
              {calculation.recommendedStack}
            </div>
          </div>

          {/* Direct Scope Dispatch Form */}
          {submittedRef ? (
            <div className="p-5 rounded-xl bg-[#140A0C] border border-emerald-500/40 text-center animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="font-display text-base font-semibold text-[#F5EFE6]">
                Scope Proposal Dispatched!
              </div>
              <p className="text-xs text-[#A29A8E] mt-1.5 leading-relaxed">
                Reference ID: <strong className="text-emerald-400 font-mono">{submittedRef}</strong>.
                Our lead architect will review your configuration and email your formal sprint
                roadmap within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="mt-4 text-xs font-mono text-[#D6334A] hover:underline cursor-pointer"
              >
                Configure another project ↗
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitScope} className="flex flex-col gap-3">
              <div className="font-mono text-[11px] text-[#C4B5A5] uppercase tracking-wider mb-1">
                Lock In This Scope &amp; Get Proposal
              </div>
              <input
                type="text"
                required
                placeholder="Your Full Name *"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#140A0C] border border-[#2C181B] focus:border-[#D6334A] focus:outline-none text-xs text-[#F5EFE6] placeholder-[#8A8175] transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Work Email *"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#140A0C] border border-[#2C181B] focus:border-[#D6334A] focus:outline-none text-xs text-[#F5EFE6] placeholder-[#8A8175] transition-colors"
              />
              <input
                type="tel"
                placeholder="WhatsApp / Phone (for instant chat)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#140A0C] border border-[#2C181B] focus:border-[#D6334A] focus:outline-none text-xs text-[#F5EFE6] placeholder-[#8A8175] transition-colors"
              />
              <textarea
                rows={2}
                placeholder="Additional project requirements or goals (optional)..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#140A0C] border border-[#2C181B] focus:border-[#D6334A] focus:outline-none text-xs text-[#F5EFE6] placeholder-[#8A8175] transition-colors resize-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D6334A] hover:bg-[#b02237] disabled:opacity-60 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(214,51,74,0.35)] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Scope...</span>
                  </>
                ) : (
                  <>
                    <span>Request Formal Scope &amp; Estimate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="text-[10px] text-center text-[#8A8175] font-mono mt-0.5">
                ✦ 100% Confidential · Mutual NDA Guaranteed · 24h Review
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
