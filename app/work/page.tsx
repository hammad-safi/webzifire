import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import PageHero from "@/components/PageHero";
import PortfolioSection from "@/components/PortfolioSection";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";

export default function WorkPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20">
        {/* Route Hero Matching Signature Hero Layout & Red Atmosphere */}
        <PageHero
          badge="Verified Client Outcomes · Case Studies"
          eyebrow="PORTFOLIO · SAAS PLATFORMS · COMMERCE · APPLIED AI"
          titleNormal="Work that makes."
          titleItalic="The Capability Visible."
          description="Explore production engagements delivered for high-growth enterprises and industry disruptors across enterprise SaaS, mobile commerce, automated AI agents, and POS/ERP suites."
          primaryCta={{
            label: "Explore Case Studies",
            href: "#selected-work",
          }}
          secondaryCta={{
            label: "Book an Architectural Sprint",
            href: "/book",
          }}
        />

        {/* Full Portfolio Section with 1px bento tabs & cards */}
        <PortfolioSection />

        {/* Credentials Band */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-12">
          <TrackRecord />
        </div>

        {/* Bottom CTA Box */}
        <CtaBox />
      </main>

      <Footer />
      <WebziFireBot />
    </div>
  );
}
