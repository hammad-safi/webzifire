"use client";

import React, { useState } from "react";
import { Compass, FileCode2, Cpu, LineChart, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BorderBeam from "@/components/ui/BorderBeam";

export default function ProcessTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      codefierLabel: "Discover",
      title: "Discovery & Audit",
      icon: Compass,
      summary:
        "Clarify the audience, offer, commercial KPIs, architectural constraints, and evidence of success.",
      detail:
        "We dissect existing analytics, interview primary stakeholders, audit competitors, and formalize precise conversion benchmarks. No speculative guessing; we anchor the project in hard commercial realities.",
      deliverables: [
        "Commercial Goal Charter",
        "User Persona Synthesis",
        "Technical Constraint Audit",
        "KPI Telemetry Framework",
      ],
    },
    {
      num: "02",
      codefierLabel: "Define",
      title: "Systems Design",
      icon: FileCode2,
      summary:
        "Shape the message, customer journey, content structure, technical scope, and measurement plan.",
      detail:
        "Translating discovery into an ironclad blueprint. We create wireframes, editorial message hierarchies, system architecture diagrams, database schemas, and API dependency contracts.",
      deliverables: [
        "Information Architecture",
        "Wireframe Prototypes",
        "Technical Specification (OpenAPI)",
        "Telemetry & Event Map",
      ],
    },
    {
      num: "03",
      codefierLabel: "Build",
      title: "Sprint Engineering",
      icon: Cpu,
      summary:
        "Create the copy, design, and technology as one connected system, with senior review throughout.",
      detail:
        "Sprint execution led by principal engineers. Frontends built in Next.js with sub-second speeds, robust microservices, rigorous unit/integration test coverage, and continuous client preview staging.",
      deliverables: [
        "Full-fidelity Obsidian UI",
        "Clean Next.js Codebase",
        "Headless CMS & API Integration",
        "Security & Load Audits",
      ],
    },
    {
      num: "04",
      codefierLabel: "Improve",
      title: "Scale & Compound",
      icon: LineChart,
      summary:
        "Launch, measure real behavior, and refine the experience using search, telemetry, and analytics.",
      detail:
        "Deployment is day zero of growth. We monitor user heatmaps, Core Web Vitals telemetry, organic search indexing, and run iterative conversion rate optimization experiments.",
      deliverables: [
        "Zero-downtime Deployment",
        "Real-time Telemetry Dashboard",
        "SEO & Schema Indexation",
        "Iterative Growth Roadmap",
      ],
    },
  ];

  return (
    <section
      className="w-full py-24 lg:py-32 bg-[#0B0607] border-y border-[#2C181B] relative overflow-x-clip"
      id="process"
      aria-labelledby="approach-heading"
    >
      {/* Hero-Style Ambient Crimson Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 w-[860px] max-w-[95vw] h-[580px] bg-[radial-gradient(ellipse_at_top_left,rgba(214,51,74,0.24),transparent_65%)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        {/* CodeFier Split 12-Column Principles Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column (Sticky Protocol Briefing - .principles-grid__left) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
              <span className="text-[#D6334A] text-[10px]">✦</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                Senior-Led Protocol
              </span>
            </div>

            <h2
              id="approach-heading"
              className="font-display font-light text-3xl sm:text-4xl lg:text-[2.75rem] text-[#F5EFE6] leading-[1.08] tracking-tight"
            >
              A clear route from<br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                brief to compounding scale.
              </span>
            </h2>

            <p className="font-sans text-base text-[#C4B5A5]/80 leading-relaxed max-w-sm">
              Every project begins with the commercial problem, not a predetermined deliverable. The result is a disciplined scope, fewer handoffs, and software engineered to compound in value over time.
            </p>

            {/* Quick Status Box */}
            <div className="mt-4 pt-6 border-t border-[#2C181B] flex flex-col gap-3">
              <div className="flex items-center gap-2.5 font-mono text-xs text-[#8A8175]">
                <span className="w-2 h-2 rounded-full bg-[#D6334A] animate-pulse" />
                <span className="text-[#F5EFE6] font-medium">
                  Phase {steps[activeStep].num} ({steps[activeStep].codefierLabel}) Selected
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#8A8175] leading-normal">
                Click any phase on the right to inspect technical scope, senior review gates, and concrete verified deliverables.
              </p>
            </div>
          </div>

          {/* Right Column (Disciplined Route 4-Step List - .principles-list) */}
          <div className="lg:col-span-8 flex flex-col">
            <ol className="border-t border-b border-[#2C181B] list-none divide-y divide-[#2C181B]">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                const isActive = activeStep === idx;

                return (
                  <li
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`transition-all duration-300 group cursor-pointer relative py-8 sm:py-10 px-4 sm:px-6 -mx-4 sm:-mx-6 rounded-xl ${
                      isActive
                        ? "bg-[#140A0C] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                        : "hover:bg-[#140A0C]/60"
                    }`}
                  >
                    {/* Active State Laser Border Beam */}
                    {isActive && (
                      <BorderBeam duration={7} colorFrom="#D6334A" colorTo="#F5EFE6" />
                    )}

                    {/* Step Row Layout Matching CodeFier's .principle-item */}
                    <div className="grid grid-cols-12 gap-4 sm:gap-6 items-baseline">
                      {/* CodeFier's .principle-item__num */}
                      <div className="col-span-2 sm:col-span-1 font-mono text-xs text-[#D6334A] pt-1 font-bold">
                        {step.num}
                      </div>

                      {/* CodeFier's .principle-item__label */}
                      <div className="col-span-10 sm:col-span-3 font-mono text-xs uppercase tracking-[0.24em] text-[#8A8175] group-hover:text-[#F5EFE6] pt-1 font-semibold transition-colors flex items-center justify-between sm:justify-start gap-2">
                        <span>{step.codefierLabel}</span>
                        <div
                          className={`p-1.5 rounded-lg transition-colors sm:hidden ${
                            isActive
                              ? "bg-[#D6334A] text-white"
                              : "bg-[#1B0E10] text-[#8A8175]"
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* CodeFier's .principle-item__text */}
                      <div className="col-span-12 sm:col-span-8 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-display font-light text-xl sm:text-2xl text-[#F5EFE6] leading-snug tracking-tight group-hover:translate-x-1.5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.75,0.2,1)]">
                            {step.summary}
                          </p>
                          <div
                            className={`p-2 rounded-xl transition-colors shrink-0 hidden sm:flex ${
                              isActive
                                ? "bg-[#D6334A] text-white shadow-[0_0_16px_rgba(214,51,74,0.4)]"
                                : "bg-[#1B0E10] text-[#8A8175] group-hover:text-[#F5EFE6] border border-[#2C181B]"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Interactive Phase Trigger Indicator */}
                        <div className="flex items-center gap-2 font-mono text-xs pt-1">
                          <span
                            className={`transition-colors flex items-center gap-1.5 ${
                              isActive
                                ? "text-[#D6334A] font-medium"
                                : "text-[#8A8175] group-hover:text-[#C4B5A5]"
                            }`}
                          >
                            {isActive ? "Phase scope open" : "Inspect phase deliverables"}
                            <ArrowRight
                              className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? "rotate-90 text-[#D6334A]" : "text-[#8A8175] group-hover:translate-x-1"
                              }`}
                            />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Integrated Deep Dive Deliverables Scope (Retains 100% functionality) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 pt-6 border-t border-[#2C181B] flex flex-col gap-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1B0E10] p-4 rounded-xl border border-[#2C181B]">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] uppercase tracking-wider text-[#D6334A] font-semibold">
                                  {step.title}
                                </span>
                                <span className="text-[#8A8175] text-xs">·</span>
                                <span className="font-mono text-xs text-[#C4B5A5]">
                                  Phase {step.num} Scope Blueprint
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-[#C4B5A5] flex items-center gap-1.5 font-medium">
                                <span className="w-2 h-2 rounded-full bg-[#D6334A] shadow-[0_0_8px_rgba(214,51,74,0.6)]" />
                                Senior Review Checkpoint Enforced
                              </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              <div className="lg:col-span-6">
                                <p className="font-sans text-sm text-[#C4B5A5] leading-relaxed">
                                  {step.detail}
                                </p>
                              </div>
                              <div className="lg:col-span-6 flex flex-col gap-2">
                                <span className="font-mono text-[11px] uppercase tracking-wider text-[#8A8175] font-semibold pb-0.5">
                                  Verified Phase Deliverables &amp; Artifacts
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {step.deliverables.map((d, dIdx) => (
                                    <div
                                      key={dIdx}
                                      className="flex items-center gap-2 text-xs font-mono text-[#F5EFE6] bg-[#1B0E10]/80 p-2.5 rounded-lg border border-[#2C181B]"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D6334A] shrink-0" />
                                      <span className="truncate">{d}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </div>

        </div>
      </div>
    </section>
  );
}
