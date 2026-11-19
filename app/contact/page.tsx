import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import ContactForm from "@/components/ContactForm";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";
import PageHero from "@/components/PageHero";
import { ArrowUpRight } from "lucide-react";

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { service?: string };
}) {
  const channels = [
    {
      key: "A.",
      label: "Delivery Model",
      value: "Worldwide Remote Engineering / Flexible coverage across US, UK, Europe & UAE time zones",
      link: null,
    },
    {
      key: "B.",
      label: "Direct Email",
      value: "inquire@webzifire.com",
      link: "mailto:inquire@webzifire.com",
    },
    {
      key: "C.",
      label: "Phone & WhatsApp",
      value: "+92 314 5660928",
      link: "https://wa.me/923145660928?text=Hello%20WebziFire!%20I%20would%20like%20to%20discuss%20a%20project.",
    },
    {
      key: "D.",
      label: "Confidentiality",
      value: "100% Confidential / Mutual NDA protection on every project",
      link: null,
    },
    {
      key: "E.",
      label: "Response Time",
      value: "Personal review and reply from our senior team within 24 hours",
      link: null,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20 pb-20">
        {/* Route Hero with Clear, Friendly Copy */}
        <PageHero
          badge="Get In Touch · 24h Response"
          eyebrow="DIRECT INQUIRIES · US, UK, EUROPE & UAE TIME ZONES"
          titleNormal="Tell us about"
          titleItalic="what you are building."
          description="Tell us about your project, goals, and timeline. Our senior team will review your requirements and reply with a clear plan and estimate within 24 hours."
          primaryCta={{
            label: "Send a Message",
            href: "#contact-form-section",
          }}
          secondaryCta={{
            label: "Chat on WhatsApp",
            href: "https://wa.me/923145660928?text=Hello%20WebziFire!%20I%20would%20like%20to%20discuss%20a%20project.",
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-16 pt-12">

          {/* CodeFier Channels Ledger (.contact-channel-row) */}
          <section className="flex flex-col gap-2 border-b border-[#2C181B] pb-16">
            <div className="border-t border-[#2C181B] divide-y divide-[#2C181B]">
              {channels.map((ch, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 sm:gap-6 py-6 sm:py-8 items-baseline hover:bg-[#D6334A]/[0.015] transition-colors px-2 group"
                >
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-[#D6334A] font-bold">
                    {ch.key}
                  </span>
                  <span className="col-span-10 sm:col-span-3 font-mono text-xs uppercase tracking-[0.24em] text-[#8A8175] font-semibold">
                    {ch.label}
                  </span>
                  <div className="col-span-12 sm:col-span-8 flex items-center justify-between">
                    {ch.link ? (
                      <a
                        href={ch.link}
                        target={ch.link.startsWith("http") ? "_blank" : undefined}
                        rel={ch.link.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="font-display font-light text-xl sm:text-2xl text-[#F5EFE6] hover:text-[#D6334A] transition-colors flex items-center gap-2"
                      >
                        <span>{ch.value}</span>
                        <ArrowUpRight className="w-4 h-4 text-[#D6334A] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="font-display font-light text-xl sm:text-2xl text-[#F5EFE6]">
                        {ch.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Direct Brief Submission Form Matching CodeFier's .cff-contact-form */}
          <section className="flex flex-col gap-10">
            <ContactForm sourcePage="Contact Page" defaultService={searchParams?.service || ""} />
          </section>

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
