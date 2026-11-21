import React from "react";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import { caseStudies } from "@/data/caseStudies";
import DeviceMockup from "@/components/ui/DeviceMockup";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  CheckCircle2,
  Layers,
  Calendar,
  Sparkles,
  Cpu,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return caseStudies.map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = caseStudies.find((p) => p.id === params.slug);
  if (!project) return { title: "Project Not Found | WebziFire" };

  return {
    title: `${project.title} — ${project.category} | WebziFire Work`,
    description: project.description,
  };
}

export default function CaseStudyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = caseStudies.find((p) => p.id === params.slug);
  if (!project) notFound();

  const relatedInCategory = caseStudies.filter(
    (p) => p.category === project.category && p.id !== project.id
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: project.title,
    description: project.description,
    image: `https://webzifire.com${project.image}`,
    author: {
      "@type": "Organization",
      name: "WebziFire AI",
      url: "https://webzifire.com",
    },
    publisher: {
      "@type": "Organization",
      name: "WebziFire AI",
      logo: {
        "@type": "ImageObject",
        url: "https://webzifire.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://webzifire.com/work/${project.id}`,
    },
    about: {
      "@type": "SoftwareApplication",
      name: project.title,
      applicationCategory: project.category,
      operatingSystem: "Web, Cloud, iOS, Android, Desktop",
    },
    keywords: project.techStack.join(", "),
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <main className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12">
          {/* Back button */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <a
              href="/work"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#8A8175] hover:text-[#F5EFE6] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all selected work</span>
            </a>

            <a
              href={`/services/${project.relatedServiceSlug}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#D6334A] hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D6334A]" />
              <span>Practice: {project.relatedServiceName} →</span>
            </a>
          </div>

          {/* Hero Header */}
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#F5EFE6] px-3 py-1 rounded-full bg-[#D6334A]/20 border border-[#D6334A]/50">
                #{project.number}
              </span>
              <a
                href={`/services/${project.relatedServiceSlug}`}
                className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B] hover:border-border-hover transition-colors"
              >
                {project.categoryLabel}
              </a>
              {project.isImportantCategory && (
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#D6334A] font-semibold px-2.5 py-1 rounded-full bg-[#D6334A]/10 border border-[#D6334A]/30">
                  ★ Core Specialty
                </span>
              )}
              <span className="font-mono text-xs text-[#8A8175] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8A8175]" />
                {project.year}
              </span>
            </div>

            <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-[3.75rem] text-[#F5EFE6] tracking-tight leading-[1.08]">
              {project.title}
            </h1>

            <p className="font-sans text-xl sm:text-2xl text-[#C4B5A5] leading-snug font-normal">
              {project.headline}
            </p>
          </div>

          {/* Hero Image Device Mockup */}
          <div className="w-full">
            <DeviceMockup
              src={project.image}
              alt={project.title}
              type={project.category === "Mobile Apps" ? "phone" : "browser"}
              urlDisplay={`https://${project.id.replace(/-(management|system|platform|portal|app|shopping|fleet|ecommerce|accounting|design)/g, "")}.webzifire.app`}
            />
          </div>

          {/* Quantifiable Metrics Trio Banner */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-3xl bg-[#140A0C] border border-[#2C181B] shadow-elevated-card">
              {project.metrics.map((m, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-display font-light text-4xl sm:text-5xl font-black text-[#D6334A]">
                    {m.value}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] mt-2">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-2">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div>
                <h2 className="font-display font-light text-2xl sm:text-3xl text-[#F5EFE6] mb-4">
                  Platform Overview
                </h2>
                <p className="font-sans text-base sm:text-lg text-[#C4B5A5] leading-relaxed mb-4">
                  {project.description}
                </p>
                <p className="font-sans text-base text-[#8A8175] leading-relaxed">
                  Architected under WebziFire&apos;s <strong>{project.relatedServiceName}</strong> practice, this system focuses on clean domain modeling, resilient database performance, and intuitive operator workflows engineered for long-term scalability.
                </p>
              </div>

              {/* The Engineering Challenge Callout */}
              {project.challenge && (
                <div className="p-7 rounded-2xl bg-[#1B0E10] border-l-4 border-[#D6334A] border-y border-r border-y-[#2C181B] border-r-[#2C181B] space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                    <AlertTriangle className="w-4 h-4 text-[#D6334A]" />
                    <span>The Engineering Challenge</span>
                  </div>
                  <p className="font-sans text-base sm:text-lg text-[#F5EFE6] leading-relaxed">
                    {project.challenge}
                  </p>
                </div>
              )}

              {/* Multi-Layer System Architecture Breakdown */}
              {project.architecture && (
                <div className="p-7 rounded-2xl bg-[#140A0C] border border-[#2C181B] space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                      <Cpu className="w-4 h-4 text-[#D6334A]" />
                      <span>System Architecture &amp; Engineering Layers</span>
                    </div>
                    <p className="font-sans text-sm text-[#8A8175] leading-relaxed">
                      {project.architecture.overview}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.architecture.layers.map((layer, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-xl bg-[#0B0607] border border-[#2C181B] space-y-2 hover:border-[#D6334A]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-bold">
                            {layer.layer}
                          </span>
                          <span className="font-mono text-[10px] text-[#8A8175]">Layer 0{idx + 1}</span>
                        </div>
                        <div className="font-mono text-xs text-[#F5EFE6] font-medium">
                          {layer.technologies}
                        </div>
                        <p className="font-sans text-xs text-[#C4B5A5]/80 leading-relaxed">
                          {layer.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features & Modules Grid */}
              <div className="p-7 rounded-2xl bg-[#140A0C] border border-[#2C181B]">
                <h2 className="font-display font-light text-2xl text-[#F5EFE6] mb-5 flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-[#D6334A]" />
                  <span>Key Features &amp; Modules</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {project.tags.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#1B0E10] border border-[#2C181B] flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#D6334A] shrink-0" />
                      <span className="font-sans text-sm text-[#F5EFE6]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Deliverables Catalog */}
              {project.deliverables && project.deliverables.length > 0 && (
                <div className="p-7 rounded-2xl bg-[#140A0C] border border-[#2C181B] space-y-5">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                    <FileCheck className="w-4 h-4 text-[#D6334A]" />
                    <span>Verified Project Deliverables</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.deliverables.map((deliv, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#1B0E10] border border-[#2C181B] flex items-start gap-3"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-sans text-sm text-[#F5EFE6] leading-snug">{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Service Practice Box */}
              <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D6334A] font-semibold">
                    Associated Agency Practice
                  </span>
                  <span className="font-display font-light text-lg font-bold text-[#F5EFE6]">
                    {project.relatedServiceName}
                  </span>
                  <span className="font-sans text-xs text-[#8A8175]">
                    Explore capabilities, deliverables, and technology stacks for this discipline.
                  </span>
                </div>
                <a
                  href={`/services/${project.relatedServiceSlug}`}
                  className="font-mono text-xs uppercase tracking-wider text-[#F5EFE6] bg-[#1B0E10] hover:bg-surface-bright px-5 py-2.5 rounded-full border border-[#2C181B] transition-all shrink-0"
                >
                  View Discipline →
                </a>
              </div>

              {/* Optional Client Testimonial */}
              {project.testimonial && (
                <div className="p-8 rounded-2xl bg-[#1B0E10] border border-[#2C181B] relative overflow-hidden">
                  <Quote className="w-10 h-10 text-[#D6334A] mb-3 opacity-40" />
                  <p className="font-sans text-lg text-[#C4B5A5] italic leading-relaxed">
                    &ldquo;{project.testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-4 font-mono text-sm text-[#F5EFE6] font-semibold">
                    {project.testimonial.author} —{" "}
                    <span className="text-[#8A8175] font-normal">
                      {project.testimonial.role}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar: Tech Stack & Inquiry */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-4 sticky top-28">
                <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold">
                  {project.stackLabel === "Tools" ? "Design Tools" : "Engineering Stack"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-[#1B0E10] border border-[#2C181B] font-mono text-xs text-[#F5EFE6]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#2C181B] mt-2 flex flex-col gap-2 font-mono text-xs">
                  <span className="text-[#8A8175]">
                    Category: <strong className="text-[#F5EFE6]">{project.categoryLabel}</strong>
                  </span>
                  <span className="text-[#8A8175]">
                    Practice: <strong className="text-[#F5EFE6]">{project.relatedServiceName}</strong>
                  </span>
                  <span className="text-[#8A8175]">
                    Architecture: <strong className="text-emerald-400">Production Ready</strong>
                  </span>
                </div>

                {/* Enterprise Standards Guarantee Box */}
                <div className="p-4 rounded-xl bg-[#1B0E10] border border-[#2C181B] flex flex-col gap-2 mt-1">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Enterprise Guarantee</span>
                  </div>
                  <ul className="space-y-1.5 font-mono text-[10px] text-[#8A8175]">
                    <li>✓ 100% IP &amp; Code Ownership Handover</li>
                    <li>✓ Pre-Signed Mutual NDA on File</li>
                    <li>✓ Zero Junior Dev Handoffs</li>
                    <li>✓ Fixed-Bid Milestone Delivery</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2.5 mt-3">
                  <a
                    href={`/contact?service=${encodeURIComponent(project.relatedServiceName)}`}
                    className="w-full group inline-flex items-center justify-between px-6 py-3.5 rounded-full bg-[#D6334A] hover:bg-[#E03A52] text-[#F5EFE6] font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 shadow-[0_4px_20px_rgba(214,51,74,0.35)] hover:-translate-y-0.5"
                  >
                    <span>Inquire for {project.title}</span>
                    <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </span>
                  </a>
                  <a
                    href={`/book?service=${encodeURIComponent(project.relatedServiceName)}`}
                    className="w-full inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider font-medium text-[#C4B5A5] hover:text-[#F5EFE6] bg-[#1B0E10] hover:bg-[#251618] border border-[#2C181B] py-3 rounded-full transition-colors"
                  >
                    Book 30-Min Discovery Sprint
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* More in Same Category */}
          {relatedInCategory.length > 0 && (
            <div className="pt-10 border-t border-[#2C181B] flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-light text-2xl sm:text-3xl text-[#F5EFE6]">
                  More in {project.category}
                </h2>
                <a
                  href="/work"
                  className="font-mono text-xs text-[#D6334A] hover:underline"
                >
                  View all {caseStudies.length} projects →
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedInCategory.map((rel) => (
                  <a
                    key={rel.id}
                    href={`/work/${rel.id}`}
                    className="group p-5 rounded-2xl bg-[#140A0C] border border-[#2C181B] hover:border-[#423330] transition-all flex flex-col sm:flex-row gap-5 items-center"
                  >
                    <div className="w-full sm:w-44 aspect-[16/10] rounded-xl overflow-hidden border border-[#2C181B] shrink-0 bg-[#090707]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[11px] text-[#D6334A] font-semibold">
                        #{rel.number} · {rel.categoryLabel}
                      </span>
                      <h3 className="font-display font-light text-xl text-[#F5EFE6] group-hover:text-white">
                        {rel.title}
                      </h3>
                      <p className="font-sans text-xs text-[#C4B5A5]/80 line-clamp-2">
                        {rel.description}
                      </p>
                    </div>
                  </a>
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
