"use client";

import React from "react";
import { Star, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function TrackRecord() {
  return (
    <section className="w-full py-8 lg:py-10 bg-[#0B0607] border-y border-[#2C181B] relative overflow-hidden">
      {/* Ambient Crimson Light matching Hero */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-[-10%] w-[820px] max-w-[95vw] h-[480px] bg-[radial-gradient(ellipse_at_top_left,rgba(214,51,74,0.22),transparent_65%)]" />
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-10 relative z-10">
        {/* Header Title with Clean, Approachable Styling */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-start gap-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B]">
            <span className="text-[#D6334A] text-[10px]">✦</span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#D8CFC2] font-semibold">
              Our Track Record
            </span>
          </div>
          <div className="flex flex-col gap-2 max-w-3xl">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#F5EFE6] font-normal tracking-tight leading-[1.08]">
              Proven through work.{" "}
              <span className="font-display italic font-light text-[#C4B5A5]">
                Trusted by clients worldwide.
              </span>
            </h2>
          </div>
        </motion.div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Track Record - 80+ Projects Delivered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#140A0C] p-8 rounded-2xl border border-[#2C181B] flex flex-col justify-between hover:border-[#D6334A]/50 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8A8175] tracking-widest uppercase">
                  Track record
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/10 group-hover:bg-[#D6334A] transition-colors shadow-[0_0_8px_rgba(214,51,74,0.4)]" />
              </div>
              <div className="font-display text-6xl lg:text-7xl text-[#F5EFE6] font-normal group-hover:text-[#D6334A] transition-colors tracking-tight">
                <AnimatedCounter value={80} suffix="+" />
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE6] font-normal">
                Projects delivered
              </h3>
            </div>
            <p className="font-sans text-sm text-[#8A8175] mt-6 leading-relaxed">
              Across modern web applications, mobile apps, custom SaaS platforms, e-commerce stores, and smart business automation tools worldwide.
            </p>
          </motion.div>

          {/* Card 2: 99% Client Satisfaction (Replaces Global Excellence Wins) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#140A0C] p-8 rounded-2xl border border-[#2C181B] flex flex-col justify-between hover:border-[#D6334A]/50 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 shadow-2xl"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#D6334A]/10 rounded-full blur-2xl group-hover:bg-[#D6334A]/20 transition-all pointer-events-none" />
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8A8175] tracking-widest uppercase">
                  Client Trust
                </span>
                <div className="w-8 h-8 rounded-full bg-[#1B0E10] flex items-center justify-center border border-[#2C181B] text-[#D6334A]">
                  <Star className="w-4 h-4 text-[#D6334A] fill-[#D6334A]" />
                </div>
              </div>
              <div className="font-display text-6xl lg:text-7xl text-[#D6334A] font-normal tracking-tight">
                <AnimatedCounter value={99} suffix="%" />
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE6] font-normal">
                Client satisfaction
              </h3>
              <p className="font-mono text-xs text-[#D8CFC2] pt-1">
                5.0 ★ average rating across verified client reviews
              </p>
            </div>
            <div className="pt-6 relative z-10 border-t border-[#2C181B] mt-4">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#F5EFE6] group-hover:text-[#D6334A] transition-colors">
                <span>Delivering work clients love and trust</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Direct Senior Team Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#140A0C] p-8 rounded-2xl border border-[#2C181B] flex flex-col justify-between hover:border-[#D6334A]/50 transition-all duration-300 hover:-translate-y-1 group shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#8A8175] tracking-widest uppercase">
                  Senior-Led Model
                </span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              </div>
              <div className="font-display text-6xl lg:text-7xl text-[#F5EFE6] font-normal group-hover:text-[#D6334A] transition-colors tracking-tight">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <h3 className="font-display text-2xl text-[#F5EFE6] font-normal">
                Direct senior access
              </h3>
              <p className="font-sans text-sm text-[#8A8175] leading-relaxed">
                Work directly with senior developers and lead designers. Zero junior handoffs, clear weekly updates, and honest communication.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] font-mono text-[11px] text-[#D8CFC2]">
                North America
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] font-mono text-[11px] text-[#D8CFC2]">
                GCC / UAE
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] font-mono text-[11px] text-[#D8CFC2]">
                Europe &amp; Global
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
