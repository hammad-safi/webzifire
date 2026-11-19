import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import PageHero from "@/components/PageHero";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import ProcessTimeline from "@/components/ProcessTimeline";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20">
        {/* Route Hero with Clear, Engaging Copy */}
        <PageHero
          badge="Full-Stack Capabilities · 12 Services"
          eyebrow="WEB · MOBILE · SOFTWARE · AI · GROWTH"
          titleNormal="Twelve Core Services."
          titleItalic="Built to Help Your Business Grow."
          description="Explore WebziFire's complete range of web design, custom software, and smart AI automation services. Use what you need today, or combine them to launch your next big product."
          primaryCta={{
            label: "View All Services",
            href: "#capabilities",
          }}
          secondaryCta={{
            label: "Start a Project",
            href: "/book",
          }}
        />

        {/* 12 Disciplines Bento Grid */}
        <CapabilitiesGrid />

        {/* Disciplined Route / How We Work */}
        <ProcessTimeline />

        {/* Credentials & Awards Band */}
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
