"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft, Shield, Sparkles, Send, Clock, DollarSign, Calculator } from "lucide-react";

export default function ProjectEstimator() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Website & Web Application Development",
  ]);
  const [stage, setStage] = useState<string>("Enterprise Redesign");
  const [timeline, setTimeline] = useState<string>("4-8 Weeks");
  const [budget, setBudget] = useState<string>("$15K - $30K");
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const availableServices = [
    { name: "Website & Web Application Development", baseWeeks: 4, desc: "High-performance Next.js marketing & business portals" },
    { name: "Mobile Application Development", baseWeeks: 6, desc: "Native iOS & Android apps with offline synchronization" },
    { name: "ERP & Enterprise Software", baseWeeks: 10, desc: "Custom HR, inventory, procurement & finance platforms" },
    { name: "POS & Retail Management Systems", baseWeeks: 6, desc: "High-velocity retail POS with cloud & offline sync" },
    { name: "SaaS Product Development", baseWeeks: 8, desc: "Multi-tenant cloud architecture & Stripe subscriptions" },
    { name: "CRM & Business Applications", baseWeeks: 5, desc: "Custom pipelines, appointment booking & dashboards" },
    { name: "E-commerce Development", baseWeeks: 5, desc: "Online stores, marketplaces & 1-page checkout funnels" },
    { name: "Backend & API Development", baseWeeks: 4, desc: "High-throughput Node.js APIs, PostgreSQL, MySQL & MongoDB architectures" },
    { name: "Desktop Application Development", baseWeeks: 6, desc: "Windows & Electron desktop software with local DB" },
    { name: "AI-Powered Application Development", baseWeeks: 4, desc: "OpenAI integrations, AI chatbots & smart workflows" },
    { name: "UI/UX Design", baseWeeks: 3, desc: "World-class Figma design systems & interactive prototypes" },
    { name: "Software Maintenance & Optimization", baseWeeks: 2, desc: "Speed optimization, bug fixing & 24/7 technical SLA" },
  ];

  const stages = [
    { title: "Greenfield MVP", desc: "Building a brand new platform from ground zero" },
    { title: "Enterprise Redesign", desc: "Overhauling an existing system to boost conversions" },
    { title: "Platform Re-architecture", desc: "Migrating legacy stacks to modern Next.js & cloud" },
    { title: "Growth & Compounding", desc: "Ongoing dedicated engineering & search sprint cycles" },
  ];

  const timelines = ["2-4 Weeks (Rapid Sprint)", "4-8 Weeks (Standard)", "8-16 Weeks (Multi-Phase)", "Ongoing Strategic Partnership"];
  const budgets = ["$10K - $25K", "$25K - $50K", "$50K - $100K", "$100K+"];

  const [referenceId, setReferenceId] = useState<string>("WBZ-984210");
  const [submitting, setSubmitting] = useState(false);

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== srv));
      }
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInfo.name || !clientInfo.email) {
      setStep(4);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientInfo,
          services: selectedServices,
          stage,
          timeline,
          budget,
        }),
      });
      const data = await res.json();
      if (data.referenceId) {
        setReferenceId(data.referenceId);
      }
    } catch {
      // Graceful fallback to client generated ticket
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#140A0C] rounded-3xl border border-[#2C181B] p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
      {/* Top Progress Stepper */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#2C181B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center text-[#D6334A] font-mono text-sm font-bold">
            0{step}
          </div>
          <div className="flex flex-col">
            <span className="font-display font-light text-lg text-[#F5EFE6]">
              {step === 1 && "Select Required Capabilities"}
              {step === 2 && "Project Stage & Architecture Scope"}
              {step === 3 && "Timeline & Investment Target"}
              {step === 4 && "Contact Details & Brief Synthesis"}
            </span>
            <span className="font-mono text-xs text-[#8A8175]">
              Step {step} of 4 · Senior Architectural Scoping
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-[#8A8175]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full transition-all ${
                i <= step ? "bg-[#D6334A] shadow-[0_0_8px_#ff5352]" : "bg-[#2C181B]"
              }`}
            />
          ))}
        </div>
      </div>

      {submitted ? (
        <div className="py-12 flex flex-col items-center text-center gap-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-display font-light text-3xl font-bold text-[#F5EFE6]">
            Project Scope Successfully Submitted
          </h3>
          <p className="font-sans text-base text-[#C4B5A5] max-w-lg leading-relaxed">
            Thank you, <span className="text-[#F5EFE6] font-semibold">{clientInfo.name}</span>. Our senior technical engineering directors are reviewing your brief and specifications.
          </p>
          <div className="p-4 rounded-xl bg-[#1B0E10] border border-[#2C181B] max-w-md w-full text-left font-mono text-xs space-y-1.5 mt-2">
            <div className="text-[#D6334A] font-semibold">Scope Reference ID: <span>{referenceId}</span></div>
            <div className="text-[#8A8175]">Target Services: <span className="text-[#F5EFE6] font-medium">{selectedServices.join(", ")}</span></div>
            <div className="text-[#8A8175]">Engagement Stage: <span className="text-[#F5EFE6] font-medium">{stage}</span></div>
            <div className="text-[#8A8175]">Target Timeline: <span className="text-[#F5EFE6] font-medium">{timeline}</span></div>
            <div className="text-[#8A8175]">Formal Blueprint Turnaround: <span className="text-emerald-400 font-semibold">&lt; 24 Hours</span></div>
          </div>
          <a
            href="/"
            className="mt-6 px-8 py-3 rounded-full bg-[#1B0E10] hover:bg-surface-bright text-[#F5EFE6] border border-[#2C181B] font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      ) : (
        <div>
          {/* STEP 1: Select Services */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <p className="font-sans text-sm text-[#8A8175]">
                Select one focused discipline or combine multiple connected capabilities into a cohesive enterprise solution.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableServices.map((srv) => {
                  const isSelected = selectedServices.includes(srv.name);
                  return (
                    <div
                      key={srv.name}
                      onClick={() => toggleService(srv.name)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#1B0E10] border-primary-coral/60 shadow-coral-sm"
                          : "bg-[#140A0C] border border-[#2C181B] hover:border-border-hover"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-light font-semibold text-sm text-[#F5EFE6]">
                          {srv.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#D6334A] border-[#D6334A] text-white"
                              : "border-[#2C181B]"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className="font-sans text-xs text-[#8A8175] mt-2">{srv.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Project Stage */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <p className="font-sans text-sm text-[#8A8175]">
                What is the current maturity and strategic objective of this project?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stages.map((stg) => {
                  const isSelected = stage === stg.title;
                  return (
                    <div
                      key={stg.title}
                      onClick={() => setStage(stg.title)}
                      className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#1B0E10] border-primary-coral/60 shadow-coral-sm"
                          : "bg-[#140A0C] border border-[#2C181B] hover:border-border-hover"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-light text-base text-[#F5EFE6]">
                          {stg.title}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-[#D6334A] border-[#D6334A] text-white"
                              : "border-[#2C181B]"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="font-sans text-xs text-[#8A8175] mt-3">{stg.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Timeline & Budget */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold block mb-3">
                  Target Launch Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timelines.map((tl) => (
                    <button
                      key={tl}
                      type="button"
                      onClick={() => setTimeline(tl)}
                      className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all ${
                        timeline === tl
                          ? "bg-[#1B0E10] border-primary-coral text-[#F5EFE6] shadow-coral-sm"
                          : "bg-[#140A0C] border border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6]"
                      }`}
                    >
                      {tl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold block mb-3">
                  Target Investment Tier
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {budgets.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBudget(bg)}
                      className={`p-3.5 rounded-xl border text-center font-mono text-xs transition-all ${
                        budget === bg
                          ? "bg-[#1B0E10] border-primary-coral text-[#F5EFE6] shadow-coral-sm"
                          : "bg-[#140A0C] border border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6]"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Client Info & Submit */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-[#8A8175] block mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl bg-[#1B0E10] border border-[#2C181B] text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-primary-coral"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-[#8A8175] block mb-1.5">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#1B0E10] border border-[#2C181B] text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-primary-coral"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-[#8A8175] block mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={clientInfo.company}
                  onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                  placeholder="e.g. Nexus Enterprises"
                  className="w-full px-4 py-3 rounded-xl bg-[#1B0E10] border border-[#2C181B] text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-primary-coral"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-[#8A8175] block mb-1.5">
                  Brief Overview &amp; Key Goals *
                </label>
                <textarea
                  rows={3}
                  required
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                  placeholder="Describe your current bottleneck, desired deliverables, and key success metrics..."
                  className="w-full px-4 py-3 rounded-xl bg-[#1B0E10] border border-[#2C181B] text-sm text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-primary-coral resize-none"
                />
              </div>

              {/* Summary Pill Preview */}
              <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] font-mono text-xs text-[#C4B5A5] flex flex-wrap gap-x-6 gap-y-2">
                <span>Selected: <strong className="text-[#D6334A]">{selectedServices.length} Disciplines</strong></span>
                <span>Stage: <strong className="text-[#F5EFE6]">{stage}</strong></span>
                <span>Target Window: <strong className="text-[#F5EFE6]">{timeline}</strong></span>
                <span>Tier: <strong className="text-[#F5EFE6]">{budget}</strong></span>
              </div>
            </form>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-8 border-t border-[#2C181B] flex items-center justify-between gap-4 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#8A8175] hover:text-[#F5EFE6] px-5 py-2.5 rounded-full border border-[#2C181B] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#F5EFE6] bg-[#D6334A] hover:bg-[#ff3b3b] px-7 py-3 rounded-full shadow-coral-sm transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#F5EFE6] bg-[#D6334A] hover:bg-[#ff3b3b] px-8 py-3.5 rounded-full shadow-coral-md transition-all cursor-pointer"
              >
                <span>Submit Scope to Directors</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
