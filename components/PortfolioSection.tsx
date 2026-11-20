"use client";

import React, { useState, useMemo } from "react";
import { caseStudies, CaseStudy } from "@/data/caseStudies";
import {
  ArrowUpRight,
  Award,
  X,
  Quote,
  ArrowRight,
  Eye,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function PortfolioSection() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);

  const categories = useMemo(
    () => [
      { id: "all", num: "ALL", label: "All Works", filterVal: "all", important: false },
      { id: "web-saas", num: "01", label: "Web & SaaS", filterVal: "Web & SaaS", important: false },
      { id: "mobile-apps", num: "02", label: "Mobile Apps", filterVal: "Mobile Apps", important: false },
      { id: "erp-pos", num: "03", label: "ERP & POS", filterVal: "ERP & POS", important: true },
      { id: "ecommerce", num: "04", label: "E-Commerce", filterVal: "E-Commerce", important: false },
      { id: "ai-automation", num: "05", label: "AI & Automation", filterVal: "AI & Automation", important: false },
      { id: "ui-ux", num: "06", label: "UI/UX & Desktop", filterVal: "UI/UX & Desktop", important: false },
    ],
    []
  );

  // Compute counts for each category
  const tabsWithCounts = useMemo(() => {
    return categories.map((cat) => {
      const count =
        cat.filterVal === "all"
          ? caseStudies.length
          : caseStudies.filter((item) => item.category === cat.filterVal).length;
      return {
        ...cat,
        count,
      };
    });
  }, [categories]);

  const filteredProjects = useMemo(() => {
    const selected = categories.find((c) => c.id === activeTab);
    if (!selected || selected.filterVal === "all") {
      return caseStudies;
    }
    return caseStudies.filter((item) => item.category === selected.filterVal);
  }, [activeTab, categories]);

  return (
    <section
      className="w-full py-24 lg:py-32 bg-[#0B0607] border-y border-[#2C181B] relative"
      id="selected-work"
      aria-labelledby="portfolio-heading"
    >
      {/* Hero-Style Ambient Crimson Halo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] max-w-[95vw] h-[560px] bg-[radial-gradient(ellipse_at_top,rgba(214,51,74,0.26),transparent_65%)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 relative z-10">
        {/* Section Header Matching CodeFier's .portfolio-header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2C181B]">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
              <span className="text-[#D6334A] text-[10px]">✦</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                Selected Work · {caseStudies.length} Production Systems
              </span>
            </div>
            <h2
              id="portfolio-heading"
              className="font-display font-light text-3xl sm:text-5xl lg:text-[3.25rem] text-[#F5EFE6] tracking-tight leading-[1.08]"
            >
              Work that makes the
              <br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                capability visible.
              </span>
            </h2>
          </div>
          <p className="font-sans text-base text-[#C4B5A5]/80 max-w-md leading-relaxed">
            Explore WebziFire production deployments across Web &amp; SaaS, Mobile Apps, Enterprise ERP &amp; POS, E-Commerce, AI Automation, and Desktop / Design Systems.
          </p>
        </div>

        {/* Mobile Filter Tabs (Horizontal Scrollable Rail - 100% responsive, no text clipping) */}
        <div
          role="tablist"
          aria-label="Portfolio categories mobile rail"
          className="flex md:hidden overflow-x-auto no-scrollbar gap-2 p-1.5 bg-[#140A0C] border border-[#2C181B] rounded-2xl scroll-smooth"
        >
          {tabsWithCounts.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-mono text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#D6334A] text-white font-semibold shadow-[0_2px_14px_rgba(214,51,74,0.45)]"
                    : "bg-[#1B0E10] text-[#8A8175] hover:text-[#F5EFE6] hover:border-[#D6334A]/40 border border-[#2C181B]"
                }`}
              >
                <span className={isActive ? "text-white/80" : "text-[#D6334A] font-bold"}>
                  {tab.num}
                </span>
                <span className="font-sans font-medium">{tab.label}</span>
                {tab.important && <span className="text-[10px] text-amber-300">★</span>}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? "bg-black/30 text-white" : "bg-[#25181A] text-[#C4B5A5]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filter Tabs (1px hairline bento grid for md & above) */}
        <div
          role="tablist"
          aria-label="Portfolio categories desktop grid"
          className="hidden md:grid md:grid-cols-4 xl:grid-cols-7 gap-[1px] p-[1px] bg-[#2C181B] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
        >
          {tabsWithCounts.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`portfolio-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`portfolio-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group flex items-center justify-between gap-2 px-4 py-3.5 text-left transition-all duration-200 cursor-pointer min-h-[58px] ${
                  isActive
                    ? "bg-[#1B0E10] text-[#F5EFE6]"
                    : "bg-[#140A0C] text-[#8A8175] hover:bg-[#1B0E10] hover:text-[#F5EFE6]"
                }`}
              >
                {/* Numeric Index Prefix */}
                <span
                  className={`font-mono text-[11px] shrink-0 ${
                    tab.important ? "text-[#D6334A] font-semibold" : "text-[#8A8175]/80"
                  }`}
                >
                  {tab.num}
                </span>

                {/* Category Label */}
                <span className="font-sans font-medium text-xs sm:text-[13px] text-inherit truncate flex-1 flex items-center gap-1">
                  <span className="truncate">{tab.label}</span>
                  {tab.important && (
                    <span
                      className="text-[#D6334A] text-[10px] shrink-0"
                      title="Core Specialty Category"
                    >
                      ★
                    </span>
                  )}
                </span>

                {/* Count Badge */}
                <span
                  className={`font-mono text-[10px] min-w-[22px] h-[22px] px-1 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "border-[#D6334A] text-[#D6334A] bg-[#D6334A]/10 font-bold"
                      : "border-[#2C181B] text-[#8A8175] group-hover:border-[#D6334A]/50 group-hover:text-[#D6334A]"
                  }`}
                >
                  {tab.count}
                </span>

                {/* Signature bottom laser line */}
                <span
                  className={`absolute bottom-0 left-3 right-3 h-[2px] bg-[#D6334A] rounded-t-sm transition-all duration-300 origin-center ${
                    isActive
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-50"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Active Category Sub-Header when filtered */}
        {activeTab !== "all" && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 rounded-xl bg-[#140A0C] border border-[#2C181B]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#D6334A]">
                {tabsWithCounts.find((t) => t.id === activeTab)?.num} —
              </span>
              <span className="font-display text-lg text-[#F5EFE6]">
                {tabsWithCounts.find((t) => t.id === activeTab)?.label}
              </span>
              {tabsWithCounts.find((t) => t.id === activeTab)?.important && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D6334A]/15 border border-[#D6334A]/40 font-mono text-[10px] uppercase tracking-wider text-[#D6334A] font-semibold">
                  <Sparkles className="w-2.5 h-2.5" />
                  Core Category
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-[#8A8175]">
              {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>
        )}

        {/* Portfolio Showcase Grid */}
        <div
          id={`portfolio-panel-${activeTab}`}
          role="tabpanel"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="group bg-[#140A0C] rounded-2xl border border-[#2C181B] overflow-hidden hover:border-[#423330] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
            >
              <div>
                {/* Media Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#090707]">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    aria-label={`View ${project.title} quick view`}
                    className="w-full h-full block cursor-zoom-in text-left relative overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.2,0.75,0.2,1)]"
                    />

                    {/* Subtle Vignette Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140A0C] via-transparent to-black/25 opacity-80" />

                    {/* Project Index & Category Badges */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#0B0607]/85 backdrop-blur-md border border-[#D6334A]/50 font-mono text-[10px] font-bold text-[#F5EFE6]">
                        {project.number}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#0B0607]/85 backdrop-blur-md border border-white/10 font-mono text-[10px] uppercase tracking-wider text-[#C4B5A5]">
                        {project.category}
                      </span>
                      {project.isImportantCategory && (
                        <span className="px-2 py-1 rounded-full bg-[#D6334A]/90 font-mono text-[9px] uppercase tracking-wider text-white font-semibold">
                          Core
                        </span>
                      )}
                    </div>

                    {/* Quick Zoom Pill Button */}
                    <div className="absolute top-3.5 right-3.5">
                      <div className="w-8 h-8 rounded-full bg-[#0B0607]/85 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#F5EFE6] group-hover:bg-[#D6334A] group-hover:text-white transition-all shadow-md">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex flex-col gap-4">
                  {/* Category Kicker */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[#D6334A] font-semibold">
                      {project.categoryLabel}
                    </span>
                    <span className="font-mono text-[10px] text-[#8A8175]">
                      #{project.number}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="font-display font-light text-2xl text-[#F5EFE6] group-hover:text-white transition-colors cursor-pointer leading-snug"
                  >
                    {project.title}
                  </h3>

                  {/* Exact Project Description */}
                  <p className="font-sans text-xs sm:text-sm text-[#C4B5A5]/85 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Features / Modules List */}
                  <div className="pt-3.5 border-t border-[#2C181B] flex flex-col gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#8A8175]">
                      Key Capabilities
                    </span>
                    <ul className="flex flex-wrap gap-1.5 list-none">
                      {project.tags.map((feature, idx) => (
                        <li
                          key={idx}
                          className="px-2.5 py-1 rounded-full border border-[#2C181B] bg-[#1B0E10]/90 text-[#C4B5A5] font-mono text-[10px]"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Stack / Tools Row */}
                  <div className="pt-3.5 border-t border-[#2C181B]/70 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#D6334A] font-semibold mr-1">
                      {project.stackLabel || "Stack"}:
                    </span>
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[11px] text-[#F5EFE6]/90"
                      >
                        {tech}
                        {idx < project.techStack.length - 1 && (
                          <span className="text-[#8A8175] ml-1.5">·</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-6 sm:p-7 pt-4 border-t border-[#2C181B]/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="font-sans text-xs uppercase tracking-wider font-medium text-[#F5EFE6] hover:text-[#D6334A] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Quick view</span>
                </button>
                <a
                  href={`/work/${project.id}`}
                  className="font-mono text-xs text-[#D6334A] hover:underline flex items-center gap-1"
                >
                  <span>Case study</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Proven Track Record Callout Banner */}
        <div className="bg-[#140A0C] rounded-2xl border border-[#2C181B] p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#1B0E10] flex items-center justify-center border border-[#2C181B] text-[#D6334A] shrink-0 shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                Proven Track Record
              </span>
              <h3 className="font-display font-light text-2xl sm:text-3xl text-[#F5EFE6]">
                Proven results. 80+ projects delivered.
              </h3>
              <p className="font-sans text-sm text-[#C4B5A5]/80">
                From fast-growing startups to enterprise businesses, we build digital products that launch on schedule and deliver real commercial results.
              </p>
            </div>
          </div>
          <a
            href="/work"
            className="group inline-flex items-center gap-3 bg-[#F5EFE6] hover:bg-white text-[#0A0707] font-sans font-medium text-xs tracking-wider uppercase pl-5 pr-2 py-2 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.08)] transition-all duration-300 hover:scale-[1.02] shrink-0"
          >
            <span>Explore all case studies</span>
            <span className="w-7 h-7 rounded-full bg-[#D6334A] text-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </div>

      {/* Interactive Case Study QuickView Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProject(null);
          }}
        >
          <div className="bg-[#140A0C] border border-[#2C181B] rounded-3xl max-w-3xl w-full p-6 sm:p-10 relative shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close modal"
              className="absolute top-6 right-6 p-2 rounded-full bg-[#1B0E10] border border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2 text-[#D6334A] font-mono text-xs uppercase tracking-widest pb-2 pr-10">
              <span>#{selectedProject.number}</span>
              <span>·</span>
              <span>{selectedProject.categoryLabel}</span>
              <span>·</span>
              <a
                href={`/services/${selectedProject.relatedServiceSlug}`}
                className="hover:underline text-[#C4B5A5]"
              >
                {selectedProject.relatedServiceName}
              </a>
            </div>

            <h3 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6] mb-4">
              {selectedProject.title}
            </h3>

            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-6 border border-[#2C181B] bg-[#0B0607]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="font-sans text-base text-[#C4B5A5] leading-relaxed mb-6">
              {selectedProject.description}
            </p>

            {/* Key Features & Modules */}
            <div className="mb-6 p-5 rounded-2xl bg-[#1B0E10] border border-[#2C181B]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold flex items-center gap-2 mb-3">
                <Layers className="w-3.5 h-3.5 text-[#D6334A]" />
                <span>Key Features &amp; Modules</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedProject.tags.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-[#F5EFE6]">
                    <CheckCircle2 className="w-4 h-4 text-[#D6334A] shrink-0" />
                    <span className="font-sans">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Metrics Grid */}
            {selectedProject.metrics && selectedProject.metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#1B0E10] border border-[#2C181B] mb-6">
                {selectedProject.metrics.map((m, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-display font-light text-3xl text-[#D6334A]">
                      {m.value}
                    </span>
                    <span className="font-mono text-xs text-[#8A8175] mt-1">{m.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Optional Client Testimonial */}
            {selectedProject.testimonial && (
              <div className="p-5 rounded-2xl bg-[#0B0607] border border-[#2C181B] mb-6 relative">
                <Quote className="w-6 h-6 text-[#D6334A] mb-2 opacity-60" />
                <p className="font-sans text-sm text-[#C4B5A5] italic leading-relaxed">
                  &ldquo;{selectedProject.testimonial.quote}&rdquo;
                </p>
                <div className="mt-3 font-mono text-xs text-[#F5EFE6]">
                  {selectedProject.testimonial.author} —{" "}
                  <span className="text-[#8A8175] font-normal">
                    {selectedProject.testimonial.role}
                  </span>
                </div>
              </div>
            )}

            {/* Tech Stack / Tools */}
            <div className="mb-8">
              <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold block mb-2.5">
                {selectedProject.stackLabel === "Tools" ? "Design Tools" : "Technology Stack"}
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedProject.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full bg-[#1B0E10] border border-[#2C181B] font-mono text-xs text-[#F5EFE6]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#2C181B] flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href={`/work/${selectedProject.id}`}
                className="font-mono text-xs text-[#D6334A] hover:underline flex items-center gap-1"
              >
                <span>Open full project page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={`/contact?service=${encodeURIComponent(selectedProject.relatedServiceName || selectedProject.title)}`}
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto font-mono font-semibold text-xs uppercase tracking-wider text-[#F5EFE6] bg-[#D6334A] hover:bg-[#E03A52] px-6 py-3.5 rounded-full shadow-[0_4px_20px_rgba(214,51,74,0.35)] text-center transition-all flex items-center justify-center gap-2"
              >
                <span>Inquire for {selectedProject.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
