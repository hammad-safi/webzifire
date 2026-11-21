import React from "react";
import HeroSection from "@/components/HeroSection";
import TrackRecord from "@/components/TrackRecord";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import ProcessTimeline from "@/components/ProcessTimeline";
import PortfolioSection from "@/components/PortfolioSection";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBox from "@/components/CtaBox";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20 bg-transparent">
        {/* Section 1: Hero with live telemetry and coordinates */}
        <HeroSection />

        {/* Section 2: Recognition & Track Record */}
        <TrackRecord />

        {/* Section 3: Connected Capabilities (Twelve Services) */}
        <CapabilitiesGrid />

        {/* Section 4: Process Timeline (Discover, Define, Build, Improve) */}
        <ProcessTimeline />

        {/* Section 5: Selected Work & Case Studies Showcase */}
        <PortfolioSection />

        {/* Section 6: Interactive FAQ Accordion */}
        <FaqAccordion />

        {/* Section 8: High-Impact Enterprise CTA */}
        <CtaBox />
      </main>

      {/* Enterprise Multi-Column Footer */}
      <Footer />

      {/* Floating WebziFire AI Assistant Widget */}
      <WebziFireBot />
    </div>
  );
}
