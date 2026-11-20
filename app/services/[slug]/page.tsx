import React from "react";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import { services } from "@/data/services";
import { caseStudies } from "@/data/caseStudies";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  Briefcase,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) return { title: "Service Not Found | WebziFire" };

  return {
    title: `${service.title} | WebziFire Enterprise Capabilities`,
    description: service.shortDescription,
  };
}

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = services.find((s) => s.slug === params.slug);
  if (!service) notFound();

  const relatedWorks = caseStudies.filter(
    (c) => c.relatedServiceSlug === service.slug
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-14">
          {/* Back link */}
          <div className="pt-4">
            <a
              href="/services"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#8A8175] hover:text-[#F5EFE6] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all capabilities</span>
            </a>
          </div>

          {/* Hero Header */}
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[#D6334A] px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B]">
                Capability {service.number}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175]">
                {service.category}
              </span>
            </div>

            <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-[3.75rem] text-[#F5EFE6] tracking-tight leading-[1.08]">
              {service.title}
            </h1>

            <p className="font-sans text-xl text-[#8A8175] leading-relaxed">
              {service.longDescription}
            </p>

            {/* Metric Banner */}
            <div className="p-4 rounded-xl bg-[#140A0C] border border-[#2C181B] flex items-center gap-3 w-fit">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="font-mono text-xs text-[#F5EFE6]">
                Benchmark Standard: <strong className="text-emerald-400">{service.metrics}</strong>
              </span>
            </div>
          </div>

          {/* Grid: Capabilities & Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: What We Engineer */}
            <div className="lg:col-span-7 bg-[#140A0C] rounded-2xl border border-[#2C181B] p-8 shadow-elevated-card">
              <h2 className="font-display font-light text-2xl font-bold text-[#F5EFE6] mb-6 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#D6334A]" />
                <span>Engineered Capabilities</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#1B0E10] border border-[#2C181B] flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D6334A] shrink-0 mt-0.5" />
                    <span className="font-sans text-sm text-[#C4B5A5] leading-snug">{cap}</span>
                  </div>
                ))}
              </div>

              {/* Technology Stack */}
              <div className="mt-8 pt-8 border-t border-[#2C181B]">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold">
                    Technical Architecture &amp; Stack
                  </h3>
                  <span className="font-mono text-[10px] text-[#C4B5A5]/60 uppercase tracking-widest hidden sm:inline">
                    Enterprise Grade
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-[#1B0E10] border border-[#2C181B] hover:border-[#D6334A]/50 font-mono text-xs text-[#F5EFE6] transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Concrete Deliverables */}
            <div className="lg:col-span-5 bg-[#140A0C] rounded-2xl border border-[#2C181B] p-8 shadow-elevated-card flex flex-col justify-between">
              <div>
                <h2 className="font-display font-light text-2xl font-bold text-[#F5EFE6] mb-6 flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-[#D6334A]" />
                  <span>Concrete Deliverables</span>
                </h2>
                <ul className="space-y-3 font-mono text-xs text-[#C4B5A5]">
                  {service.deliverables.map((item, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-lg bg-[#1B0E10] border border-[#2C181B] flex items-center gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-[#2C181B] mt-8">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-[#2C181B] mb-6">
                  <span className="font-mono text-xs text-[#8A8175] block mb-1">Senior Delivery Model</span>
                  <span className="font-sans text-xs text-[#C4B5A5] leading-relaxed">
                    All sprints directly architected and reviewed by principal engineers with zero junior agency handoffs.
                  </span>
                </div>
                
                {/* Structured Dual CTA Buttons */}
                <div className="flex flex-col gap-3">
                  <a
                    href={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="w-full group inline-flex items-center justify-between px-6 py-4 rounded-full bg-[#D6334A] hover:bg-[#E03A52] text-[#F5EFE6] font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-[0_4px_24px_rgba(214,51,74,0.35)] hover:shadow-[0_6px_28px_rgba(214,51,74,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Inquire for {service.title}</span>
                    <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </a>
                  <a
                    href={`/book?service=${encodeURIComponent(service.title)}`}
                    className="w-full inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider font-medium text-[#C4B5A5] hover:text-[#F5EFE6] bg-[#1B0E10] hover:bg-[#251E1C] border border-[#2C181B] py-3.5 rounded-full transition-colors"
                  >
                    <span>Book 30-Min Discovery Sprint</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Flagship Delivered Works */}
          {relatedWorks.length > 0 && (
            <div className="bg-[#140A0C] rounded-2xl border border-[#2C181B] p-8 shadow-elevated-card flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] w-fit">
                  <Briefcase className="w-3.5 h-3.5 text-[#D6334A]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C4B5A5] font-semibold">
                    Delivered Works in this Discipline
                  </span>
                </div>
                <h2 className="font-display font-light text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
                  Selected Engagements Delivered for Clients
                </h2>
                <p className="font-sans text-sm text-[#8A8175]">
                  Case studies showcasing production systems built under our {service.title} practice.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {relatedWorks.map((work) => (
                  <div
                    key={work.id}
                    className="group rounded-2xl overflow-hidden border border-[#2C181B] bg-[#1B0E10] flex flex-col justify-between hover:border-border-hover transition-all duration-300"
                  >
                    <div>
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={work.image}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/75 flex items-center justify-center text-white">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="p-6 flex flex-col gap-2">
                        <span className="font-mono text-xs text-[#8A8175]">
                          {work.client} — {work.location}
                        </span>
                        <h3 className="font-display font-light text-xl font-bold text-[#F5EFE6] group-hover:text-[#D6334A] transition-colors">
                          {work.title}
                        </h3>
                        <p className="font-sans text-xs text-[#C4B5A5] leading-relaxed line-clamp-2">
                          {work.description}
                        </p>
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <a
                        href={`/work/${work.id}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-[#D6334A] hover:underline font-semibold"
                      >
                        <span>View complete case study</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Reference UI / Design Showcase */}
          {service.previewImages && service.previewImages.length > 0 && (
            <div className="bg-[#140A0C] rounded-2xl border border-[#2C181B] p-8 shadow-elevated-card flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] w-fit">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D6334A]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#C4B5A5] font-semibold">
                    Curated Interface Previews
                  </span>
                </div>
                <h2 className="font-display font-light text-2xl sm:text-3xl font-bold text-[#F5EFE6]">
                  Production Design &amp; Architectural References
                </h2>
                <p className="font-sans text-sm text-[#8A8175]">
                  Visual benchmarks and UI paradigms engineered for high-conviction mobile, ecommerce, and administrative workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {service.previewImages.map((preview, idx) => (
                  <div
                    key={idx}
                    className="group rounded-2xl overflow-hidden border border-[#2C181B] bg-[#1B0E10] flex flex-col hover:border-border-hover transition-all duration-300"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview.url}
                        alt={preview.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <span className="font-mono text-xs font-semibold text-[#F5EFE6]">
                        {preview.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#8A8175] uppercase tracking-wider">
                        Architecture Reference · {service.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WebziFireBot />
    </div>
  );
}
