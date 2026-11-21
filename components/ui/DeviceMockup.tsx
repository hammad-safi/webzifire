"use client";

import React from "react";
import { Lock, Globe } from "lucide-react";

interface DeviceMockupProps {
  src: string;
  alt: string;
  type?: "browser" | "phone" | "auto";
  urlDisplay?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export default function DeviceMockup({
  src,
  alt,
  type = "browser",
  urlDisplay,
  className = "",
  imageClassName = "",
}: DeviceMockupProps) {
  const isPhone =
    type === "phone" ||
    (type === "auto" &&
      (alt.toLowerCase().includes("mobile") ||
        alt.toLowerCase().includes("phone") ||
        src.toLowerCase().includes("novakart") ||
        src.toLowerCase().includes("gonza")));

  if (isPhone) {
    return (
      <div
        className={`relative mx-auto rounded-[2.5rem] p-3 bg-gradient-to-b from-[#2C181B] via-[#1B0E10] to-[#0B0607] border-2 border-[#3D2226] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-w-[340px] ${className}`}
      >
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-20 flex items-center justify-center gap-2 border border-white/10 shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-white/5" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#0D223A]" />
        </div>

        {/* Screen Bezel */}
        <div className="relative aspect-[9/19.5] w-full rounded-[2rem] overflow-hidden bg-black border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover object-top ${imageClassName}`}
            loading="lazy"
          />
          {/* Subtle Screen Glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/[0.04] pointer-events-none" />
        </div>

        {/* Home Indicator Bar */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-2" />
      </div>
    );
  }

  // Default: Browser Chrome Mockup
  const displayUrl =
    urlDisplay ||
    `https://${alt.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16)}.webzifire.app`;

  return (
    <div
      className={`rounded-2xl lg:rounded-3xl overflow-hidden border border-[#2C181B] bg-[#0E0708] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col group/mockup ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="px-4 py-2.5 bg-[#140A0C] border-b border-[#2C181B] flex items-center justify-between gap-4 select-none">
        {/* Traffic Light Dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D6334A]/80 border border-[#D6334A] shadow-[0_0_6px_rgba(214,51,74,0.3)]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4B5A5]/40 border border-[#C4B5A5]/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/50 border border-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.2)]" />
        </div>

        {/* URL Address Pill Bar */}
        <div className="flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#0B0607] border border-[#2C181B] font-mono text-[11px] text-[#8A8175] truncate">
          <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
          <span className="truncate group-hover/mockup:text-[#D8CFC2] transition-colors">
            {displayUrl}
          </span>
        </div>

        {/* Browser Action Icons */}
        <div className="flex items-center gap-2 text-[#8A8175] shrink-0">
          <Globe className="w-3 h-3 text-[#8A8175]/60" />
        </div>
      </div>

      {/* Screen Canvas */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover object-top transition-transform duration-700 group-hover/mockup:scale-[1.02] ${imageClassName}`}
          loading="lazy"
        />
        {/* Top-down soft vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 pointer-events-none" />
      </div>
    </div>
  );
}
