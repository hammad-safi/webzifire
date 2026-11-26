"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Target, BarChart3, LogOut, ArrowUpRight } from "lucide-react";

interface AdminNavHeaderProps {
  currentModule?: "seo" | "marketing";
}

export function AdminNavHeader({ currentModule }: AdminNavHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSeoActive = currentModule === "seo" || pathname?.startsWith("/admin/seo");
  const isMarketingActive = currentModule === "marketing" || pathname?.startsWith("/admin/marketing");

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    router.push("/admin/login");
  };

  return (
    <nav className="w-full bg-[#120709]/80 backdrop-blur-md border border-[#2C181B] rounded-2xl p-2.5 mb-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Brand & Module Switcher */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Link
          href="/admin/seo"
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all ${
            isSeoActive
              ? "bg-[#D6334A] text-white shadow-lg shadow-[#D6334A]/30"
              : "bg-[#180A0E] text-[#B8AEA3] hover:text-white hover:bg-[#251015] border border-[#2C181B]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>SEO & Content Engine</span>
        </Link>

        <Link
          href="/admin/marketing"
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all ${
            isMarketingActive
              ? "bg-[#D6334A] text-white shadow-lg shadow-[#D6334A]/30"
              : "bg-[#180A0E] text-[#B8AEA3] hover:text-white hover:bg-[#251015] border border-[#2C181B]"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>AI Marketing & B2B Prospecting</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30">
            PRO
          </span>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 self-end md:self-center">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#180A0E] border border-[#2C181B] text-[#B8AEA3] hover:text-white text-xs font-mono transition-colors"
        >
          <span>Live Site</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#180A0E] border border-[#2C181B] text-[#B8AEA3] hover:text-[#D6334A] hover:border-[#D6334A]/40 text-xs font-mono transition-colors cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
