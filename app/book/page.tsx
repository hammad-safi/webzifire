import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import ContactForm from "@/components/ContactForm";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";
import PageHero from "@/components/PageHero";
import { Video, ShieldCheck, Clock, ArrowRight } from "lucide-react";

export default function BookPage({
  searchParams,
}: {
  searchParams?: { service?: string };
}) {
  const steps = [
    { num: "01", title: "Select Services", desc: "Choose what you need" },
    { num: "02", title: "Timeline & Budget", desc: "Estimated delivery & investment" },
    { num: "03", title: "Project Details", desc: "Share what you want to build" },
    { num: "04", title: "Fast Review", desc: "Detailed proposal in 24 hours" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <Navbar />

      <main className="w-full pt-20 pb-20">
        <PageHero
          badge="Start Your Project · Fast 24h Response"
          eyebrow="PROJECT ESTIMATE · STRATEGY SESSION · DEDICATED TEAM"
          titleNormal="Turn your idea into a"
          titleItalic="launched product."
          description="Tell us about what you want to build. We will review your goals and provide a clear plan, fixed timeline, and transparent estimate within 24 hours."
          primaryCta={{
            label: "Start Scoping",
            href: "#scoping-app",
          }}
          secondaryCta={{
            label: "View Our Services",
            href: "/services",
          }}
        >
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[#8A8175] pt-6 border-t border-[#2C181B] mt-6">
            <span className="px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] flex items-center gap-1.5">
              <Video className="w-3 h-3 text-[#D6334A]" />
              Google Meet
            </span>
            <span className="px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-emerald-400" />
              24h Response
            </span>
            <span className="px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#C4B5A5]" />
              Mutual NDA
            </span>
          </div>
        </PageHero>

        <div id="scoping-app" className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-16 pt-12">
          {/* Stepper Progress & Scoping App Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Progress Stepper */}
            <aside className="lg:col-span-4 bg-[#140A0C] rounded-2xl border border-[#2C181B] p-6 sm:p-8 flex flex-col gap-6 lg:sticky lg:top-28">
              <div className="flex items-center justify-between pb-4 border-b border-[#2C181B]">
                <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold">
                  Scoping Protocol
                </span>
                <span className="font-mono text-xs text-[#D6334A] font-bold">4 Gates</span>
              </div>

              <ol className="flex flex-col gap-5 list-none">
                {steps.map((st, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="w-7 h-7 rounded-lg bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center font-mono text-xs text-[#D6334A] font-bold shrink-0">
                      {st.num}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-sans font-medium text-sm text-[#F5EFE6]">
                        {st.title}
                      </span>
                      <span className="font-sans text-xs text-[#8A8175]">
                        {st.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="pt-6 border-t border-[#2C181B] flex flex-col gap-2">
                <span className="font-mono text-xs text-[#8A8175]">Prefer direct email?</span>
                <a
                  href="mailto:inquire@webzifire.com"
                  className="font-mono text-xs text-[#D6334A] hover:underline flex items-center gap-1"
                >
                  <span>inquire@webzifire.com</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </aside>

            {/* Right Column: Direct Brief Submission Form */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <ContactForm sourcePage="Booking Page" defaultService={searchParams?.service || ""} />
            </div>
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
