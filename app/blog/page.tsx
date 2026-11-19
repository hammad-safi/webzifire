import React from "react";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";
import PageHero from "@/components/PageHero";
import InfiniteBlogGrid from "@/components/blog/InfiniteBlogGrid";
import { getPublishedJournals } from "@/lib/journals";

export const revalidate = 3600;

export default async function BlogPage() {
  const articles = await getPublishedJournals();
  const featuredSlug =
    articles[0]?.slug || "sub-second-nextjs-enterprise-software-portals";

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20 pb-20">
        {/* Route Hero with Clear, Engaging Copy */}
        <PageHero
          badge="WebziFire Journal &amp; Guides"
          eyebrow="WEB DESIGN · CUSTOM SOFTWARE · AI AUTOMATION · GROWTH"
          titleNormal="Practical Insights."
          titleItalic="For Growing Businesses."
          description="Clear, practical guides written by our senior engineers and designers on building fast websites, custom software, and smart AI automation."
          primaryCta={{
            label: "Read Latest Guide",
            href: `/blog/${featuredSlug}`,
          }}
          secondaryCta={{
            label: "Talk to Our Team",
            href: "/contact",
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-16 pt-12">
          {/* Progressive Scroll-Based Article Grid */}
          <InfiniteBlogGrid articles={articles} batchSize={4} />

          {/* Credentials Band */}
          <TrackRecord />

          {/* Bottom CTA Box */}
          <CtaBox />
        </div>
      </main>

      <Footer />
      <WebziFireBot />
    </div>
  );
}
