"use client";

import React from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden pb-3 md:pb-4 pt-1 md:pt-2 bg-[#0B0607] text-[#F5EFE6]">
      {/* CodeFier-Style Background Orbital Sweeps & Halos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft Radial Ambient Crimson Halo matching screenshot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] max-w-[95vw] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(214,51,74,0.30),transparent_65%)]" />

        {/* Golden / Bronze Sweeping Orbital Arcs */}
        <svg
          className="absolute top-0 right-0 w-[800px] h-[600px] opacity-25"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M800 50C520 80 280 260 220 600"
            stroke="url(#sweep-grad-1)"
            strokeWidth="1.2"
          />
          <path
            d="M800 160C580 190 380 340 330 600"
            stroke="url(#sweep-grad-2)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
          <circle cx="220" cy="600" r="4" fill="#C4B5A5" fillOpacity="0.6" />
          <defs>
            <linearGradient id="sweep-grad-1" x1="800" y1="50" x2="220" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C4B5A5" stopOpacity="0.6" />
              <stop offset="0.6" stopColor="#D6334A" stopOpacity="0.4" />
              <stop offset="1" stopColor="#D6334A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sweep-grad-2" x1="800" y1="160" x2="330" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C4B5A5" stopOpacity="0.4" />
              <stop offset="1" stopColor="#D6334A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
         </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10 flex flex-col">
        {/* Practice Status & Global Delivery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pt-2 md:pt-4">
          {/* Left Column: Massive Editorial Fraunces Display Headline */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-xs uppercase tracking-widest text-[#C4B5A5] font-medium"
            >
              Strategy · Design · Engineering · Growth
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-display text-5xl sm:text-7xl lg:text-8xl xl:text-[5.75rem] text-[#F5EFE6] font-normal leading-[1.02] tracking-tight"
            >
              Build Smarter.
<br />
              <span className="font-display italic font-light text-[#C4B5A5]">
                Grow Faster. With WebZifire.
              </span>
            </motion.h1>
          </div>

          {/* Right Column: Left-Bordered Editorial Description & Pill Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-4 flex flex-col justify-between gap-6 lg:border-l border-white/10 lg:pl-8 lg:pb-2"
          >
            <p className="font-sans text-sm sm:text-base text-[#D8CFC2] leading-relaxed">
              WebziFire connects positioning, bespoke web engineering, ecommerce, search, and autonomous AI systems around one senior-led brief. The result is clearer ownership, fewer handoffs, and digital work that compounds after launch.
            </p>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 pt-2">
              {/* CodeFier Signature White Pill Button with Red Circle Arrow */}
              <a
                href="/book"
                className="inline-flex items-center gap-3 bg-[#F5EFE6] hover:bg-white text-[#0A0707] px-7 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold shadow-[0_4px_24px_rgba(245,239,230,0.15)] hover:shadow-[0_8px_32px_rgba(245,239,230,0.25)] hover:scale-[1.02] transition-all group"
              >
                <span>Explore Services</span>
                <span className="w-6 h-6 rounded-full bg-[#D6334A] text-white flex items-center justify-center text-xs font-bold group-hover:rotate-45 transition-transform duration-300">
                  ↗
                </span>
              </a>

              <a
                href="/about"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#8A8175] hover:text-[#F5EFE6] transition-colors py-1 group"
              >
                <span>Explore the Studio</span>
                <span className="text-[#D6334A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom 4-Column Metric Bar with Hairline Dividers */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-5 md:mt-6 pt-3 md:pt-4 border-t border-white/10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Stat 1 */}
            <div className="flex flex-col md:pr-6 pt-2 md:pt-0">
              <span className="font-display text-3xl lg:text-4xl text-[#F5EFE6] font-normal tracking-tight">
                <AnimatedCounter value={2023} />
              </span>
              <span className="font-mono text-[11px] text-[#8A8175] uppercase tracking-widest mt-1">
                Studio Founded
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col md:px-6 pt-2 md:pt-0">
              <span className="font-display text-3xl lg:text-4xl text-[#F5EFE6] font-normal tracking-tight">
                <AnimatedCounter value={12} />
              </span>
              <span className="font-mono text-[11px] text-[#8A8175] uppercase tracking-widest mt-1">
                Connected Services
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col md:px-6 pt-2 md:pt-0">
              <span className="font-display text-3xl lg:text-4xl text-[#F5EFE6] font-normal tracking-tight">
                <AnimatedCounter value={12} suffix="+" />
              </span>
              <span className="font-mono text-[11px] text-[#8A8175] uppercase tracking-widest mt-1">
                Team Specialists
              </span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col md:pl-6 pt-2 md:pt-0">
              <span className="font-display text-3xl lg:text-4xl text-[#D6334A] font-normal tracking-tight">
                <AnimatedCounter value={3} />
              </span>
              <span className="font-mono text-[11px] text-[#8A8175] uppercase tracking-widest mt-1">
                International Awards
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
