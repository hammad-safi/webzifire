import React from "react";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";
import PageHero from "@/components/PageHero";
import { getPublishedJournals } from "@/lib/journals";
import { ArrowUpRight, Clock } from "lucide-react";

export const revalidate = 3600;

export default async function BlogPage() {
  const articles = await getPublishedJournals();
  const featuredSlug =
    articles[0]?.slug || "sub-second-nextjs-enterprise-software-portals";

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20 pb-20">
        {/* Route Hero Matching Signature Hero Layout & Red Atmosphere */}
        <PageHero
          badge="Engineering Journal · Dispatches"
          eyebrow="PERSPECTIVES · NEXT.JS · DATA ARCHITECTURES · AI AGENTS"
          titleNormal="Architectural Perspectives."
          titleItalic="And Technical Dispatches."
          description="Essays, architectural blueprints, and production findings written directly by WebziFire technical leads on enterprise software scale, modern databases, and business automation."
          primaryCta={{
            label: "Read Latest Dispatch",
            href: `/blog/${featuredSlug}`,
          }}
          secondaryCta={{
            label: "Discuss Architecture",
            href: "/contact",
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-16 pt-12">
          {/* Articles Grid (2-col editorial card layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((art) => (
              <a
                key={art.id}
                href={`/blog/${art.slug}`}
                className="bg-[#140A0C] rounded-2xl border border-[#2C181B] overflow-hidden hover:border-[#D6334A]/50 hover:-translate-y-1 transition-all duration-400 group flex flex-col justify-between shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer"
              >
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#0B0607] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.image}
                      alt={art.imageAlt || art.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.2,0.75,0.2,1)] opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140A0C] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-wider text-[#D6334A] px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 font-semibold">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between font-mono text-xs text-[#8A8175]">
                      <span>{art.date}</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D6334A]" />
                        {art.readTime}
                      </span>
                    </div>

                    <h2 className="font-display font-light text-2xl text-[#F5EFE6] group-hover:text-white transition-colors leading-snug">
                      {art.title}
                    </h2>

                    <p className="font-sans text-xs sm:text-sm text-[#C4B5A5]/80 leading-relaxed line-clamp-2">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="p-7 pt-4 flex items-center justify-between border-t border-[#2C181B] font-mono text-xs text-[#8A8175]">
                  <span>By {art.author}</span>
                  <span className="text-[#F5EFE6] group-hover:text-[#D6334A] flex items-center gap-1 transition-colors">
                    <span>Read dispatch</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>

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
