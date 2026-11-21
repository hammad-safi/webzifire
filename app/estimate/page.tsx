import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import ProjectEstimator from "@/components/ProjectEstimator";
import PageHero from "@/components/PageHero";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Scope & Project Cost Estimator | WebziFire",
  description:
    "Calculate your custom web application, mobile app, ERP, or SaaS platform scope, delivery timeline, and investment estimate in under 60 seconds.",
  openGraph: {
    title: "Interactive Scope & Cost Estimator | WebziFire",
    description:
      "Configure your platform, scale, and feature modules. Get an instant architecture blueprint and estimated sprint investment.",
    url: "https://webzifire.com/estimate",
    type: "website",
    siteName: "WebziFire",
  },
};

export default function EstimatePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20 pb-20">
        <PageHero
          badge="Interactive Estimator · Real-Time Scope"
          eyebrow="TRANSPARENT SCOPING · ZERO COMMITMENT · INSTANT BLUEPRINT"
          titleNormal="Estimate your system."
          titleItalic="Plan your sprint."
          description="Select your target platform, production maturity, and feature capabilities. Calculate an immediate architectural blueprint, estimated delivery window, and transparent pricing benchmark."
          primaryCta={{
            label: "Open Estimator",
            href: "#project-estimator",
          }}
          secondaryCta={{
            label: "Book Strategy Call",
            href: "/contact",
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-16 pt-12">
          {/* Main Scoping Engine */}
          <ProjectEstimator />

          {/* Credentials Band */}
          <TrackRecord />

          {/* CTA Box */}
          <CtaBox />
        </div>
      </main>

      <Footer />
      <WebziFireBot />
    </div>
  );
}
