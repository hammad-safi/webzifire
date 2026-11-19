"use client";

import React from "react";
import { Calendar, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import BorderBeam from "@/components/ui/BorderBeam";

export default function CtaBox() {
  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden bg-[#0B0607]">
      {/* Coral Glow Diffusion */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 max-w-[90vw] h-96 bg-[radial-gradient(ellipse_at_center,rgba(214,51,74,0.24),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-b from-[#140A0C] to-[#0B0607] rounded-3xl border border-[#2C181B] p-8 sm:p-14 lg:p-20 flex flex-col items-center text-center gap-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden"
        >
          {/* Hero-Style Top Crimson Halo inside CTA Card */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] max-w-[95vw] h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(214,51,74,0.30),transparent_68%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Electric Border Beam Laser on Main CTA Box */}
          <BorderBeam duration={8} colorFrom="#D6334A" colorTo="#F5EFE6" />

          {/* Badge */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1B0E10] border border-[#2C181B] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold">
              Initiate an Architectural Engagement
            </span>
          </div>

          {/* Heading & Subhead */}
          <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
            <h2 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-[#F5EFE6] tracking-tight leading-[1.08]">
              Have a mission-critical platform <br className="hidden sm:inline" />
              <span className="display-italic font-normal text-[#C4B5A5]">to engineer?</span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#C4B5A5]/80 leading-relaxed max-w-2xl mx-auto">
              Tell us what you are building, your target delivery milestones, and your technical constraints. WebziFire will deliver a structured architecture blueprint and milestone-anchored scope within 24 hours.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-3">
            <a
              href="/book"
              className="group inline-flex items-center gap-3 bg-[#F5EFE6] hover:bg-white text-[#0A0707] font-sans font-medium text-xs sm:text-sm tracking-wider uppercase pl-6 pr-2.5 py-2.5 rounded-full shadow-[0_4px_24px_rgba(255,255,255,0.12)] transition-all duration-300 hover:scale-[1.02]"
            >
              <span>Initiate Project Brief</span>
              <span className="w-8 h-8 rounded-full bg-[#D6334A] text-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-wider text-[#F5EFE6] bg-[#140A0C] hover:bg-[#1B0E10] px-8 py-4 rounded-full border border-[#2C181B] hover:border-[#423330] transition-all"
            >
              <Calendar className="w-4 h-4 text-[#D6334A]" />
              <span>Schedule Strategy Session</span>
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-wider text-[#8A8175] hover:text-[#F5EFE6] px-6 py-4 transition-colors"
            >
              <span>Review 12 Disciplines</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="relative z-10 pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 font-mono text-xs text-[#8A8175] border-t border-[#2C181B]/60 w-full max-w-2xl">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D6334A] shadow-[0_0_8px_rgba(214,51,74,0.6)]" />
              Architect review within 24 hours
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#8A8175]" />
              Standard Mutual NDA Protection
            </span>
            <span>Zero Unsolicited Agency Pitches</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
