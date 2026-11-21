"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, X } from "lucide-react";

export default function MobileQuickAction() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show after slight scroll or after 2 seconds
    const timer = setTimeout(() => {
      if (!dismissed) setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [dismissed]);

  if (!isVisible || dismissed) return null;

  return (
    <aside
      aria-label="Quick contact"
      className="md:hidden fixed bottom-4 left-3 right-3 z-40 flex items-center justify-between gap-2 p-1.5 rounded-full bg-[#070405]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.85)] animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* WhatsApp Direct Chat */}
      <a
        href="https://wa.me/923145660928?text=Hello%20WebziFire!%20I%20would%20like%20to%20discuss%20a%20project."
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-mono text-[11px] font-semibold tracking-wide transition-all active:scale-95"
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>WhatsApp</span>
      </a>

      {/* Start Project / Book Call */}
      <Link
        href="/book"
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#E0324B] hover:bg-[#c9253d] text-white font-mono text-[11px] font-semibold tracking-wide shadow-[0_2px_12px_rgba(224,50,75,0.4)] transition-all active:scale-95"
      >
        <span>Start Project</span>
        <ArrowRight className="w-3 h-3" />
      </Link>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1.5 text-[#D6CEC5] hover:text-white rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss quick action bar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
