"use client";

import React, { useState } from "react";
import { services, Service } from "@/data/services";
import { ArrowUpRight, ArrowRight, CheckCircle2, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function CapabilitiesGrid() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden bg-[#0B0607] text-[#F5EFE6]" id="capabilities">
      {/* Hero-Style Ambient Crimson Halos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[950px] max-w-[95vw] h-[560px] bg-[radial-gradient(ellipse_at_top_right,rgba(214,51,74,0.25),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 w-[850px] max-w-[95vw] h-[520px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(214,51,74,0.20),transparent_65%)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-14 relative z-10">
        {/* Header Section: CodeFier-Style Split Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-[#2C181B] items-end"
        >
          {/* Left Heading */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                Connected Capabilities
              </span>
            </div>
            <h2 className="font-display font-light text-3xl sm:text-5xl lg:text-[3.5rem] text-[#F5EFE6] tracking-tight leading-[1.04]">
              Twelve Core Practices.<br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                One Unified Engine.
              </span>
            </h2>
          </div>

          {/* Right Lead + Legend Badge */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
            <p className="font-sans text-sm sm:text-base text-[#C4B5A5]/80 leading-relaxed">
              Deploy a dedicated technical strike team for a mission-critical release, or orchestrate an end-to-end multi-tenant platform. Strategy, creative, technology and compounding growth stay aligned from the first architectural decision through deployment.
            </p>
            <div className="flex items-center gap-3.5 pt-4 border-t border-[#2C181B] text-xs font-mono uppercase tracking-[0.16em] text-[#8A8175]">
              <span className="w-8 h-8 rounded-full border border-[#D6334A]/50 text-[#D6334A] flex items-center justify-center font-bold text-xs shrink-0">
                12
              </span>
              <span>Distinct capabilities · zero duplicated disciplines</span>
            </div>
          </div>
        </motion.div>

        {/* 12 Services Grid: CodeFier 1px Hairline Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[1px] p-[1px] bg-[#2C181B] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          {services.map((service, idx) => {
            // Flagship Web (01) and Flagship AI (10) are wide 12-column showcase cards
            const isWide = service.number === "01" || service.number === "10";

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (idx % 3) * 0.08 }}
                className={`relative min-w-0 bg-[#140A0C] hover:bg-[#1B0E10] transition-colors duration-400 group overflow-hidden flex flex-col justify-between ${
                  isWide
                    ? "col-span-1 lg:col-span-12 p-8 sm:p-12 lg:p-14"
                    : "col-span-1 lg:col-span-6 p-7 sm:p-9 lg:p-10"
                }`}
              >
                {/* CodeFier Hover Effect 1: Top-Left Crimson Gradient Aura */}
                <div
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(214,51,74,0.13),transparent_48%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  aria-hidden="true"
                />

                {/* CodeFier Hover Effect 2: Bottom Razor-Sharp Neon Laser Scale-X Hairline */}
                <div
                  className="absolute bottom-0 left-6 sm:left-9 right-6 sm:right-9 h-[2px] bg-[#D6334A] shadow-[0_0_12px_rgba(214,51,74,0.85)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                  aria-hidden="true"
                />

                {/* CodeFier Signature Giant Ghost Watermark Number */}
                <span
                  className={`absolute font-display font-light leading-none text-white/[0.035] group-hover:text-[#D6334A]/[0.09] group-hover:-translate-y-1 transition-all duration-500 pointer-events-none select-none ${
                    isWide
                      ? "top-4 right-6 sm:right-12 text-[100px] sm:text-[140px]"
                      : "top-4 right-6 text-[80px] sm:text-[104px]"
                  }`}
                  aria-hidden="true"
                >
                  {service.number}
                </span>

                {/* Topline: Circular Number Badge + Category */}
                <header className="relative z-10 flex items-center gap-3.5 pb-4 border-b border-[#2C181B]/60">
                  <span className="w-9 h-9 rounded-full border border-[#D6334A]/50 flex items-center justify-center font-mono text-xs text-[#D6334A] transition-all duration-300 group-hover:border-[#D6334A] group-hover:bg-[#D6334A]/10 group-hover:shadow-[0_0_16px_rgba(214,51,74,0.35)] shrink-0">
                    {service.number}
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] text-[#8A8175] uppercase tracking-[0.22em] truncate">
                    {service.category}
                  </span>
                </header>

                {/* Wide Card Layout: Split Columns */}
                {isWide ? (
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-6 items-start">
                    {/* Left: Title + Description */}
                    <div className="lg:col-span-7">
                      <a href={`/services/${service.slug}`} className="block">
                        <h3 className="font-display font-light text-2xl sm:text-4xl text-[#F5EFE6] tracking-tight leading-[1.08] transition-all duration-300 group-hover:text-[#D6334A] group-hover:translate-x-1.5 inline-block">
                          {service.title}
                        </h3>
                      </a>
                      <p className="font-sans text-sm sm:text-base text-[#C4B5A5]/80 leading-relaxed mt-4 max-w-xl">
                        {service.shortDescription}
                      </p>
                    </div>

                    {/* Right: Capabilities Checklist */}
                    <div className="lg:col-span-5 self-end">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A8175] font-semibold block mb-2.5">
                        Core Capabilities
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 font-mono text-xs text-[#C4B5A5]/90">
                        {service.capabilities.slice(0, 5).map((cap, i) => (
                          <li key={i} className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] shrink-0" />
                            <span className="truncate">{cap}</span>
                          </li>
                        ))}
                        {service.capabilities.length > 5 && (
                          <li className="font-mono text-[11px] text-[#8A8175] pl-4 italic">
                            + {service.capabilities.length - 5} more capabilities
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* Standard Card Layout: Stacked */
                  <div className="relative z-10 pt-6 flex-1 flex flex-col">
                    <a href={`/services/${service.slug}`} className="block">
                      <h3 className="font-display font-light text-xl sm:text-2xl text-[#F5EFE6] tracking-tight leading-[1.1] transition-all duration-300 group-hover:text-[#D6334A] group-hover:translate-x-1.5 inline-block">
                        {service.title}
                      </h3>
                    </a>
                    <p className="font-sans text-xs sm:text-sm text-[#C4B5A5]/80 leading-relaxed mt-3">
                      {service.shortDescription}
                    </p>

                    {/* Capabilities Checklist */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-6 mt-auto font-mono text-xs text-[#C4B5A5]/85">
                      {service.capabilities.slice(0, 4).map((cap, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] shrink-0" />
                          <span className="truncate">{cap}</span>
                        </li>
                      ))}
                      {service.capabilities.length > 4 && (
                        <li className="font-mono text-[11px] text-[#8A8175] pl-3.5 italic col-span-full">
                          + {service.capabilities.length - 4} more capabilities
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Footer: Quick View Action + Explore Service Link */}
                <div className="relative z-10 mt-8 pt-5 border-t border-[#2C181B]/60 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider font-medium text-[#F5EFE6] hover:text-white transition-colors cursor-pointer group/btn"
                  >
                    <span>Quick view</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D6334A] transition-transform duration-300 group-hover/btn:rotate-45" />
                  </button>

                  <a
                    href={`/services/${service.slug}`}
                    className="font-mono text-[11px] tracking-wider uppercase text-[#C4B5A5] hover:text-[#F5EFE6] border-b border-white/20 hover:border-[#D6334A] transition-all pb-0.5"
                  >
                    Explore practice <span className="text-[#D6334A]">↗</span>
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Quick View Modal (Full Details Preserved) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#140A0C] border border-[#2C181B] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2C181B] mb-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-bold text-[#D6334A]">
                  {selectedService.number}
                </span>
                <span className="font-mono text-xs text-[#8A8175] uppercase tracking-wider">
                  {selectedService.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="p-2 rounded-full bg-[#1B0E10] border border-[#2C181B] text-[#8A8175] hover:text-[#F5EFE6] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <h3 className="font-display font-light text-2xl sm:text-3xl text-[#F5EFE6] mb-3">
              {selectedService.title}
            </h3>
            <p className="font-sans text-sm sm:text-base text-[#C4B5A5] leading-relaxed mb-6">
              {selectedService.longDescription}
            </p>

            {/* Key Deliverables */}
            <div className="mb-6">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#8A8175] mb-3 font-semibold">
                Core Deliverables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedService.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-[#1B0E10] border border-[#2C181B] text-xs font-sans text-[#C4B5A5]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D6334A] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Images if Available */}
            {selectedService.previewImages && selectedService.previewImages.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#8A8175] mb-3 font-semibold">
                  Reference UI &amp; Design Previews
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedService.previewImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group/img rounded-xl overflow-hidden border border-[#2C181B] bg-[#1B0E10] flex flex-col"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2.5">
                        <span className="font-mono text-[10px] text-[#8A8175] line-clamp-1">
                          {img.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div className="mb-6">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#8A8175] mb-3 font-semibold">
                Technology &amp; Architecture
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedService.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] text-xs font-mono text-[#F5EFE6]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-6 border-t border-[#2C181B] flex flex-col sm:flex-row items-center justify-between gap-4">
              <a
                href={`/services/${selectedService.slug}`}
                className="font-mono text-xs text-[#8A8175] hover:text-[#F5EFE6] flex items-center gap-1.5 transition-colors"
              >
                <span>Open full dedicated page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={`/contact?service=${encodeURIComponent(selectedService.title)}`}
                  onClick={() => setSelectedService(null)}
                  className="w-full sm:w-auto font-mono font-semibold text-xs uppercase tracking-wider text-[#F5EFE6] bg-[#D6334A] hover:bg-[#E03A52] px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(214,51,74,0.35)] transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Inquire About This Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
