"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Clock, AlertCircle } from "lucide-react";

interface ContactFormProps {
  defaultService?: string;
  sourcePage?: string;
}

export default function ContactForm({
  defaultService = "",
  sourcePage = "Contact",
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: defaultService,
    budget: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [refId, setRefId] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: formData.phone,
          company: formData.company,
          services: formData.service ? [formData.service] : ["General Architecture"],
          budget: formData.budget || "Unspecified",
          message: formData.message,
          sourcePage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setRefId(data.referenceId || "WBZ-DIRECT");
        setResponseMessage(data.message || "Project brief registered successfully.");
      } else {
        setStatus("error");
        setResponseMessage(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setResponseMessage("Network error. Please try again or email us directly at inquire@webzifire.com");
    }
  };

  return (
    <div className="w-full" id="contact-form-section">
      {/* Form Header Matching CodeFier's .contact-form-header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 pb-6 border-b border-[#2C181B]">
        <div className="lg:col-span-4 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
            <span className="text-[#D6334A] text-[10px]">✦</span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
              The Brief
            </span>
          </div>
          <span className="font-mono text-xs text-[#8A8175] mt-1">Direct Client Submission</span>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-3">
          <h2 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6] leading-tight">
            Tell us what you&apos;re{" "}
            <span className="display-italic font-normal text-[#C4B5A5]">
              trying to build.
            </span>
          </h2>
          <p className="font-sans text-sm text-[#C4B5A5]/80 leading-relaxed">
            Fill in your project requirements and target objectives. We review every brief directly with principal engineers and reply with a structured scope of work within 24 hours.
          </p>
        </div>
      </div>

      {status === "success" ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col items-center text-center gap-5 shadow-[0_16px_40px_rgba(0,0,0,0.8)] animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
              Brief Registered // Reference {refId}
            </span>
            <h3 className="font-display font-light text-3xl text-[#F5EFE6]">
              Thank you, {formData.name}.
            </h3>
            <p className="font-sans text-sm text-[#C4B5A5]/90 leading-relaxed mt-1">
              Your project brief has been securely transmitted. A WebziFire principal software architect will review your commercial goals, technical constraints, and follow up within 24 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] font-mono text-xs text-left w-full max-w-md space-y-2 mt-2">
            <div className="flex justify-between border-b border-[#2C181B] pb-2">
              <span className="text-[#8A8175]">Reference Ticket</span>
              <span className="text-[#F5EFE6] font-semibold">{refId}</span>
            </div>
            {formData.service && (
              <div className="flex justify-between border-b border-[#2C181B] pb-2">
                <span className="text-[#8A8175]">Service / Discipline</span>
                <span className="text-[#F5EFE6] truncate max-w-[220px]">{formData.service}</span>
              </div>
            )}
            {formData.budget && (
              <div className="flex justify-between border-b border-[#2C181B] pb-2">
                <span className="text-[#8A8175]">Budget Range</span>
                <span className="text-[#F5EFE6]">{formData.budget}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#8A8175]">Guaranteed SLA</span>
              <span className="text-emerald-400">&lt; 24 Hours Response</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setFormData({
                name: "",
                email: "",
                company: "",
                phone: "",
                service: defaultService,
                budget: "",
                message: "",
              });
            }}
            className="mt-4 px-6 py-2.5 rounded-full bg-[#1B0E10] hover:bg-[#2C181B] text-[#F5EFE6] border border-[#2C181B] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Submit Another Brief
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col" noValidate>
          {/* CodeFier 2-Column Hairline Grid (.cff-form__grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#2C181B] rounded-t-2xl overflow-hidden bg-[#0B0607]">
            {/* Field 1: Name */}
            <label className="flex flex-col gap-2 p-5 sm:p-6 border-b sm:border-r border-[#2C181B] cursor-text hover:bg-[#1B0E10]/40 transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Your name *
              </span>
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Smith"
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40"
              />
            </label>

            {/* Field 2: Email */}
            <label className="flex flex-col gap-2 p-5 sm:p-6 border-b border-[#2C181B] cursor-text hover:bg-[#1B0E10]/40 transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Email address *
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@company.com"
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40"
              />
            </label>

            {/* Field 3: Company */}
            <label className="flex flex-col gap-2 p-5 sm:p-6 border-b sm:border-r border-[#2C181B] cursor-text hover:bg-[#1B0E10]/40 transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Company / Organization
              </span>
              <input
                type="text"
                name="company"
                autoComplete="organization"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40"
              />
            </label>

            {/* Field 4: Phone */}
            <label className="flex flex-col gap-2 p-5 sm:p-6 border-b border-[#2C181B] cursor-text hover:bg-[#1B0E10]/40 transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Phone / WhatsApp
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40"
              />
            </label>

            {/* Field 5: Service / Project Type (Manual text input) */}
            <label className="flex flex-col gap-2 p-5 sm:p-6 sm:border-r border-b sm:border-b-0 border-[#2C181B] cursor-text hover:bg-[#1B0E10]/40 transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Service / Project Type
              </span>
              <input
                type="text"
                name="service"
                autoComplete="off"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="e.g. Web & SaaS, Mobile App, AI System"
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40"
              />
            </label>

            {/* Field 6: Budget Range (Manual text input) */}
            <label className="flex flex-col gap-2 p-5 sm:p-6 cursor-text hover:bg-[#1B0E10]/40 transition-colors">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Estimated Budget Target
              </span>
              <input
                type="text"
                name="budget"
                autoComplete="off"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. $10k - $25k, $50k+, or Flexible"
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40"
              />
            </label>
          </div>

          {/* Full-width Message Area (.cff-form__message-wrap) */}
          <div className="border-x border-b border-[#2C181B] rounded-b-2xl bg-[#0B0607] p-5 sm:p-6 flex flex-col gap-2 hover:bg-[#1B0E10]/40 transition-colors">
            <label className="flex flex-col gap-2 cursor-text">
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#8A8175]">
                Project details &amp; commercial objectives *
              </span>
              <textarea
                name="message"
                required
                rows={5}
                autoComplete="off"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your project, key conversion goals, existing technical challenges, and target launch timeline..."
                className="w-full bg-transparent text-[#F5EFE6] font-sans text-base focus:outline-none placeholder:text-[#8A8175]/40 resize-y min-h-[120px]"
              />
            </label>
          </div>

          {/* Footer with Submit Button & Guarantees Matching CodeFier */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#8A8175]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6334A]" />
                Mutual NDA Protected
              </span>
              <span className="text-[#2C181B]">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                24-Hour Review Turnaround
              </span>
            </div>

            {/* CodeFier's Signature White Pill Submit Button */}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="group inline-flex items-center gap-3 bg-[#F5EFE6] hover:bg-white text-[#0A0707] font-sans font-medium text-xs tracking-wider uppercase pl-6 pr-2 py-2 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              <span>{status === "submitting" ? "Sending brief..." : "Send the brief"}</span>
              <span className="w-8 h-8 rounded-full bg-[#D6334A] text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>

          {/* Error Notice if any */}
          {status === "error" && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{responseMessage}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
