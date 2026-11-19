import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import TrackRecord from "@/components/TrackRecord";
import CtaBox from "@/components/CtaBox";
import PageHero from "@/components/PageHero";
import { founder } from "@/data/team";
import { ShieldCheck, Award, Globe, Compass, ArrowUpRight, CheckCircle2, Quote } from "lucide-react";

export default function AboutPage() {
  const habits = [
    {
      num: "01",
      title: "Begin with the commercial problem",
      text: "Every project begins with hard commercial realities, not a predetermined template. We define measurable KPIs, system constraints, and conversion standards before writing a single line of code.",
    },
    {
      num: "02",
      title: "Connect design to deep engineering",
      text: "No speculative mockups that collapse in production. Principal designers and software architects collaborate in tandem so bespoke typography, obsidian aesthetics, and sub-second performance operate in lockstep.",
    },
    {
      num: "03",
      title: "Make architectural progress visible",
      text: "Continuous client preview staging, live telemetry dashboards, and direct access to senior engineers. No account managers or communication silos.",
    },
    {
      num: "04",
      title: "Measure & compound after launch",
      text: "Deployment is day zero of scaling. We monitor real user sessions, Core Web Vitals, organic search indexing, and automated AI workflows to compound platform value.",
    },
  ];

  const standards = [
    {
      key: "01",
      label: "Briefing",
      value: "One accountable brief with zero speculative guessing",
    },
    {
      key: "02",
      label: "Staffing",
      value: "Senior-led execution with zero junior pass-through layers",
    },
    {
      key: "03",
      label: "Intellectual Property",
      value: "100% client code and IP assignment upon milestone completion",
    },
    {
      key: "04",
      label: "Performance Benchmark",
      value: "Sub-second Next.js speeds and 99.99% infrastructure uptime",
    },
    {
      key: "05",
      label: "Post-Launch Warranty",
      value: "30-day comprehensive technical warranty and telemetry observation",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-20 pb-20">
        {/* Route Hero Matching Signature Hero Layout & Red Atmosphere */}
        <PageHero
          badge="The Studio Manifesto · Est. 2023"
          eyebrow="PURPOSE · PRINCIPLES · SENIOR LEADERSHIP · DELIVERY"
          titleNormal="Built to Connect."
          titleItalic="What Agencies Keep Apart."
          description="Traditional agencies fracture work between strategy, design, and offshore code factories. WebziFire engineers copy, visual systems, cloud architecture, and growth telemetry as one interconnected engine."
          primaryCta={{
            label: "Start an Engagement",
            href: "/book",
          }}
          secondaryCta={{
            label: "View Selected Work",
            href: "/work",
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-20 pt-12">

          {/* Section 2: The Core Story (Split 12-Column Layout) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-b border-[#2C181B] pb-16">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#D6334A] font-semibold">
                Why We Exist
              </span>
              <h2 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6] leading-snug">
                A connected studio for software that has to perform.
              </h2>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-base text-[#C4B5A5] leading-relaxed">
              <p>
                Founded in 2023, WebziFire began with a single dissatisfaction: modern organizations were spending fortunes on beautifully designed interfaces that broke under real operational load, or technical systems with impenetrable, outdated UX.
              </p>
              <p>
                We built WebziFire to bridge this chasm. By uniting senior software architects, editorial product designers, and performance engineers under one roof, we eliminate pass-through handoffs and deliver compounding digital assets that withstand rigorous enterprise demands.
              </p>
            </div>
          </section>

          {/* Section 3: Operating Habits (.about-operating bento grid) */}
          <section className="flex flex-col gap-10 border-b border-[#2C181B] pb-16">
            <div className="flex flex-col gap-3 max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-widest text-[#D6334A] font-semibold">
                Operating Protocol
              </span>
              <h2 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6]">
                Four habits that keep complex work clear.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] p-[1px] bg-[#2C181B] rounded-3xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
              {habits.map((habit, idx) => (
                <div
                  key={idx}
                  className="bg-[#140A0C] p-8 sm:p-10 flex flex-col gap-4 hover:bg-[#1B0E10] transition-colors"
                >
                  <span className="font-mono text-xs text-[#D6334A] font-bold">
                    {habit.num}
                  </span>
                  <h3 className="font-display font-light text-2xl text-[#F5EFE6]">
                    {habit.title}
                  </h3>
                  <p className="font-sans text-sm text-[#C4B5A5]/80 leading-relaxed">
                    {habit.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: A Practical Standard (.about-expectations ledger) */}
          <section className="flex flex-col gap-10 border-b border-[#2C181B] pb-16">
            <div className="flex flex-col gap-3 max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-widest text-[#D6334A] font-semibold">
                Accountability Ledger
              </span>
              <h2 className="font-display font-light text-3xl sm:text-4xl text-[#F5EFE6]">
                A practical standard, not agency theatre.
              </h2>
            </div>

            <div className="border-t border-[#2C181B] divide-y divide-[#2C181B]">
              {standards.map((s, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 sm:gap-6 py-6 sm:py-7 items-baseline hover:bg-[#D6334A]/[0.015] transition-colors px-2"
                >
                  <span className="col-span-2 sm:col-span-1 font-mono text-xs text-[#D6334A] font-bold">
                    {s.key}
                  </span>
                  <span className="col-span-10 sm:col-span-3 font-mono text-xs uppercase tracking-[0.24em] text-[#8A8175] font-semibold">
                    {s.label}
                  </span>
                  <span className="col-span-12 sm:col-span-8 font-display font-light text-xl text-[#F5EFE6]">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Founder / Standard Bearer Note */}
          <section className="bg-[#140A0C] rounded-3xl border border-[#2C181B] p-8 sm:p-12 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-[#2C181B] shrink-0 bg-[#1B0E10] shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={founder.avatar}
                alt={founder.name}
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex flex-col gap-4 flex-1">
              <Quote className="w-8 h-8 text-[#D6334A] opacity-60" />
              <p className="font-display font-light text-xl sm:text-2xl text-[#F5EFE6] leading-relaxed italic">
                &ldquo;We don&apos;t build disposable websites or bloated templates. We engineer high-performance web platforms, enterprise software, and custom AI systems designed to solve real operational bottlenecks, accelerate conversion, and scale with your business without architectural rewrites.&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className="text-[#F5EFE6] font-semibold">{founder.name}</span>
                <span className="text-[#8A8175]">·</span>
                <span className="text-[#D6334A]">{founder.role}</span>
              </div>
            </div>
          </section>

          {/* TrackRecord Credentials */}
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
