"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeroProps {
  eyebrow?: string;
  titleNormal: string;
  titleItalic: string;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  badge?: string;
  children?: React.ReactNode;
}

export default function PageHero({
  eyebrow = "Strategy · Design · Engineering · Growth",
  titleNormal,
  titleItalic,
  description,
  primaryCta,
  secondaryCta,
  badge,
  children,
}: PageHeroProps) {
  return (
    <section className="relative w-full overflow-hidden pb-8 md:pb-12 pt-2 md:pt-4 bg-[#0B0607] text-[#F5EFE6]">
      {/* CodeFier-Style Background Orbital Sweeps & Ambient Red Halos */}
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
            stroke="url(#page-sweep-grad-1)"
            strokeWidth="1.2"
          />
          <path
            d="M800 160C580 190 380 340 330 600"
            stroke="url(#page-sweep-grad-2)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
          <circle cx="220" cy="600" r="4" fill="#C4B5A5" fillOpacity="0.6" />
          <defs>
            <linearGradient id="page-sweep-grad-1" x1="800" y1="50" x2="220" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C4B5A5" stopOpacity="0.6" />
              <stop offset="0.6" stopColor="#D6334A" stopOpacity="0.4" />
              <stop offset="1" stopColor="#D6334A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="page-sweep-grad-2" x1="800" y1="160" x2="330" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C4B5A5" stopOpacity="0.4" />
              <stop offset="1" stopColor="#D6334A" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10 flex flex-col">
        {/* Top 12-Column Split Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pt-2 md:pt-4">
          {/* Left Column: Headline */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit"
              >
                <span className="text-[#D6334A] text-[10px]">✦</span>
                <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                  {badge}
                </span>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-mono text-xs uppercase tracking-widest text-[#C4B5A5] font-medium"
            >
              {eyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] text-[#F5EFE6] font-normal leading-[1.04] tracking-tight"
            >
              {titleNormal}
              <br />
              <span className="font-display italic font-light text-[#C4B5A5]">
                {titleItalic}
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
              {description}
            </p>

            <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 pt-2">
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  className="inline-flex items-center gap-3 bg-[#F5EFE6] hover:bg-white text-[#0A0707] px-7 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold shadow-[0_4px_24px_rgba(245,239,230,0.15)] hover:shadow-[0_8px_32px_rgba(245,239,230,0.25)] hover:scale-[1.02] transition-all group"
                >
                  <span>{primaryCta.label}</span>
                  <span className="w-6 h-6 rounded-full bg-[#D6334A] text-white flex items-center justify-center text-xs font-bold group-hover:rotate-45 transition-transform duration-300">
                    ↗
                  </span>
                </a>
              )}

              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#8A8175] hover:text-[#F5EFE6] transition-colors py-1 group"
                >
                  <span>{secondaryCta.label}</span>
                  <span className="text-[#D6334A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Optional Children (e.g. proof bar or sub-navigation) */}
        {children}
      </div>
    </section>
  );
}
