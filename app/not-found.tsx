import React from "react";
import Footer from "@/components/Footer";
import { ArrowLeft, Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas-dark text-on-surface">
      <main className="flex-1 flex items-center justify-center pt-28 pb-20 px-6">
        <div className="max-w-md w-full bg-surface-card rounded-3xl border border-border-subtle p-8 sm:p-10 text-center flex flex-col items-center gap-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-primary-coral/40 flex items-center justify-center text-primary shadow-coral-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              404 // Signal Lost
            </span>
            <h1 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6]">
              Endpoint Not Found
            </h1>
            <p className="font-sans text-sm text-text-muted leading-relaxed">
              The requested architectural resource does not exist or has been relocated to another service cluster.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full">
            <a
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-primary-container text-white font-mono text-xs uppercase font-semibold tracking-wider hover:bg-[#ff3b3b] shadow-coral-sm transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </a>
            <a
              href="/services"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-surface-elevated text-text-primary border border-border-subtle hover:border-border-hover font-mono text-xs uppercase tracking-wider transition-all"
            >
              <span>Explore Services</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
