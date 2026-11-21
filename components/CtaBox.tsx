"use client";

import React from "react";
import { Calendar, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import BorderBeam from "@/components/ui/BorderBeam";

export default function CtaBox() {
  return (
    <section className="w-full py-20 lg:py-28 relative overflow-hidden bg-[#070405]">
      {/* Precision Coral Glow Diffusion */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 max-w-[90vw] h-96 bg-[radial-gradient(ellipse_at_center,rgba(224,50,75,0.20),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-b from-[#12080A] to-[#070405] rounded-3xl border border-white/[0.08] p-8 sm:p-14 lg:p-20 flex flex-col items-center text-center gap-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_25px_60px_rgba(0,0,0,0.95)] relative overflow-hidden"
        >
          {/* Top Crimson Halo inside CTA Card */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] max-w-[95vw] h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(224,50,75,0.25),transparent_68%)] pointer-events-none"
            aria-hidden="true"
          />

          {/* Electric Border Beam Laser on Main CTA Box */}
          <BorderBeam duration={8} colorFrom="#E0324B" colorTo="#FAF7F2" />

          {/* Badge */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0324B] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#D6CEC5] font-semibold">
              Let&apos;s Build Together
            </span>
          </div>

          {/* Heading & Subhead */}
          <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
            <h2 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-[#FAF7F2] tracking-tight leading-[1.08]">
              Ready to bring your digital <br className="hidden sm:inline" />
              <span className="display-italic font-normal text-[#D6CEC5]">vision to life?</span>
            </h2>
            <p className="font-sans text-base sm:text-lg text-[#D6CEC5] leading-relaxed max-w-2xl mx-auto">
              Tell us about your project, target launch date, and goals. We will review your requirements and provide a clear plan, fixed timeline, and transparent estimate within 24 hours.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-3">
            <a
              href="/book"
              className="group inline-flex items-center gap-3 bg-[#FAF7F2] hover:bg-white text-[#0A0707] font-sans font-medium text-xs sm:text-sm tracking-wider uppercase pl-6 pr-2.5 py-2.5 rounded-full shadow-[0_4px_24px_rgba(255,255,255,0.12)] transition-all duration-300 hover:scale-[1.02]"
            >
              <span>Start Your Project</span>
              <span className="w-8 h-8 rounded-full bg-[#E0324B] text-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-wider text-[#FAF7F2] bg-white/[0.04] hover:bg-white/[0.08] px-8 py-4 rounded-full border border-white/[0.08] hover:border-[#E0324B]/40 transition-all"
            >
              <Calendar className="w-4 h-4 text-[#E0324B]" />
              <span>Book a Free Strategy Call</span>
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-wider text-[#D6CEC5] hover:text-[#FAF7F2] px-6 py-4 transition-colors"
            >
              <span>Explore 12 Services</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="relative z-10 pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 font-mono text-xs text-[#D6CEC5] border-t border-white/[0.08] w-full max-w-2xl">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0324B] shadow-[0_0_8px_rgba(224,50,75,0.6)]" />
              Clear response within 24 hours
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#D6CEC5]" />
              100% Confidential (Mutual NDA)
            </span>
            <span>Zero Sales Pressure</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
