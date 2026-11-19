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
        {/* Route Hero with Clear, Engaging Copy */}
        <PageHero
          badge="Selected Projects &amp; Case Studies"
          eyebrow="PORTFOLIO · WEBSITES · APPS · AI TOOLS · COMMERCE"
          titleNormal="Real Work."
          titleItalic="Real Results for Growing Businesses."
          description="Explore custom software, mobile apps, and high-performing websites built and launched by WebziFire for businesses worldwide."
          primaryCta={{
            label: "View Projects",
            href: "#selected-work",
          }}
          secondaryCta={{
            label: "Start a Project",
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
