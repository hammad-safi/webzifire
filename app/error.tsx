"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#070405] text-[#FAF7F2]">
      <main className="flex-1 flex items-center justify-center pt-28 pb-20 px-6">
        <div className="max-w-md w-full bg-[#120709] rounded-3xl border border-[#2C181B] p-8 sm:p-10 text-center flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#180A0E] border border-[#D6334A]/40 flex items-center justify-center text-[#D6334A]">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-[#D6334A] font-bold">
              System Fault
            </span>
            <h1 className="font-display font-light text-3xl sm:text-4xl text-[#FAF7F2]">
              Temporary Interruption
            </h1>
            <p className="font-sans text-sm text-[#8A8175] leading-relaxed">
              An unexpected anomaly occurred while processing this interface request.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#D6334A] text-white font-mono text-xs uppercase font-semibold tracking-wider hover:bg-[#e0324b] transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#180A0E] text-[#B8AEA3] border border-[#2C181B] hover:text-white font-mono text-xs uppercase tracking-wider transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
