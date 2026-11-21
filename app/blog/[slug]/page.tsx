import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import { articles as staticArticles } from "@/data/articles";
import { services } from "@/data/services";
import { getJournalBySlug } from "@/lib/journals";
import { linkifyContent } from "@/lib/seo/keywordLinks";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Calendar,
  HelpCircle,
  Layers,
  Eye,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return staticArticles.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { preview?: string };
}): Promise<Metadata> {
  const article = await getJournalBySlug(params.slug, searchParams?.preview);
  if (!article) return { title: "Dispatch Not Found | WebziFire" };

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://webzifire.com"
  ).replace(/\/+$/, "");
  const canonicalUrl = `${baseUrl}/blog/${article.slug}`;

  return {
    title: article.metaTitle || `${article.title} | WebziFire Engineering Journal`,
    description: article.metaDescription || article.summary,
    keywords: article.keywords,
    robots: article.isPreview ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.summary,
      url: canonicalUrl,
      type: "article",
      siteName: "WebziFire",
      images: article.image
        ? [
            {
              url: article.image,
              alt: article.imageAlt || article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.summary,
      images: article.image ? [article.image] : undefined,
    },
  };
}

export default async function ArticleDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { preview?: string };
}) {
  const article = await getJournalBySlug(params.slug, searchParams?.preview);
  if (!article) notFound();

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://webzifire.com"
  ).replace(/\/+$/, "");

  const structuredGraph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: article.title,
      description: article.metaDescription || article.summary,
      image: article.image,
      datePublished: article.publishedAt || undefined,
      author: {
        "@type": "Person",
        name: article.author,
        jobTitle: article.authorRole,
      },
      publisher: {
        "@type": "Organization",
        name: "WebziFire",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/webzifire-logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${article.slug}`,
      },
      keywords: article.keywords.join(", "),
    },
  ];

  if (article.faqs && article.faqs.length > 0) {
    structuredGraph.push({
      "@type": "FAQPage",
      mainEntity: article.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  const hasStructuredBlocks =
    Array.isArray(article.contentBlocks) && article.contentBlocks.length > 0;
  const usedServiceSlugs = new Set<string>();

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": structuredGraph,
          }),
        }}
      />

      <main className="w-full pt-24 sm:pt-28 pb-20">
        {/* Private Draft Preview Bar (shown ONLY when previewing via secure email token) */}
        {article.isPreview && article.previewToken && (
          <div className="sticky top-20 z-40 bg-[#1B0E10]/95 backdrop-blur-md border-y border-[#D6334A]/50 py-3 px-4 mb-6">
            <div className="max-w-[1000px] mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#ffb3ae]">
                <Eye className="w-4 h-4 text-[#D6334A]" />
                <span>PRIVATE DRAFT PREVIEW — NOT YET PUBLISHED</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/journals/review?token=${encodeURIComponent(article.previewToken)}&action=approve`}
                  className="px-4 py-1.5 rounded-full bg-emerald-500 text-[#0B0607] font-mono text-xs font-bold uppercase"
                >
                  Approve
                </a>
                <a
                  href={`/journals/review?token=${encodeURIComponent(article.previewToken)}&action=revise`}
                  className="px-4 py-1.5 rounded-full bg-[#F5EFE6] text-[#0B0607] font-mono text-xs font-bold uppercase"
                >
                  Request Revision
                </a>
                <a
                  href={`/journals/review?token=${encodeURIComponent(article.previewToken)}&action=reject`}
                  className="px-4 py-1.5 rounded-full bg-[#2C181B] border border-[#D6334A] text-[#ffb3ae] font-mono text-xs font-bold uppercase"
                >
                  Reject
                </a>
              </div>
            </div>
          </div>
        )}

        <article className="max-w-[1000px] mx-auto px-4 sm:px-8 flex flex-col gap-10">
          {/* Back link */}
          <div className="pt-2">
            <a
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#8A8175] hover:text-[#F5EFE6] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all journal dispatches</span>
            </a>
          </div>

          {/* Article Header */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold px-3 py-1 rounded-full bg-[#1B0E10] border border-[#2C181B]">
                {article.category}
              </span>
              <span className="font-mono text-xs text-[#8A8175] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
              <span className="font-mono text-xs text-[#8A8175] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8A8175]" />
                {article.date}
              </span>
            </div>

            <h1 className="font-display font-light text-3xl sm:text-5xl lg:text-[3.25rem] text-[#F5EFE6] tracking-tight leading-[1.12]">
              {article.title}
            </h1>

            {/* Author Byline Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-y border-[#2C181B] font-mono text-xs text-[#8A8175]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1B0E10] border border-[#2C181B] flex items-center justify-center text-[#D6334A] font-bold">
                  {article.author.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[#F5EFE6] font-semibold">{article.author}</span>
                  <span className="text-[11px] text-[#8A8175]">{article.authorRole}</span>
                </div>
              </div>
              <span className="text-[#D6334A] uppercase text-[11px] font-semibold">
                WebziFire Engineering Desk
              </span>
            </div>
          </div>

          {/* Feature Image */}
          <div className="aspect-[16/9] sm:aspect-[21/10] w-full rounded-3xl overflow-hidden border border-[#2C181B] shadow-elevated-card bg-[#140A0C]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.imageAlt || article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Body */}
          <div className="space-y-6 pt-2 text-base sm:text-lg text-[#C4B5A5] font-sans leading-relaxed">
            <p className="font-medium text-[#F5EFE6] text-lg sm:text-xl leading-relaxed italic border-l-2 border-[#D6334A] pl-4">
              {linkifyContent(article.summary, usedServiceSlugs)}
            </p>

            {hasStructuredBlocks
              ? article.contentBlocks!.map((block, idx) => {
                  if (block.type === "heading2") {
                    return (
                      <h2
                        key={idx}
                        className="font-display font-light text-2xl sm:text-3xl text-[#F5EFE6] pt-6 tracking-tight leading-snug"
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  if (block.type === "heading3") {
                    return (
                      <h3
                        key={idx}
                        className="font-display font-normal text-xl sm:text-2xl text-[#D8CFC2] pt-3 leading-snug"
                      >
                        {block.text}
                      </h3>
                    );
                  }
                  if (block.type === "list" && Array.isArray(block.items)) {
                    return (
                      <div
                        key={idx}
                        className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] space-y-3"
                      >
                        {block.title && (
                          <div className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                            {block.title}
                          </div>
                        )}
                        <ul className="space-y-2.5 text-sm sm:text-base text-[#D8CFC2]">
                          {block.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] mt-2.5 shrink-0" />
                              <span>{linkifyContent(item, usedServiceSlugs)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  if (block.type === "example" || block.type === "callout") {
                    return (
                      <div
                        key={idx}
                        className="p-6 rounded-2xl bg-[#1B0E10] border-l-4 border-[#D6334A] border-y border-r border-y-[#2C181B] border-r-[#2C181B] space-y-2"
                      >
                        <div className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                          {block.title ||
                            (block.type === "example"
                              ? "Architecture Example"
                              : "Engineering Note")}
                        </div>
                        <p className="text-sm sm:text-base text-[#D8CFC2] leading-relaxed">
                          {linkifyContent(block.text || "", usedServiceSlugs)}
                        </p>
                      </div>
                    );
                  }
                  return <p key={idx}>{linkifyContent(block.text || "", usedServiceSlugs)}</p>;
                })
              : article.content.map((paragraph, idx) => (
                  <p key={idx}>{linkifyContent(paragraph, usedServiceSlugs)}</p>
                ))}

            {/* Related Internal Capabilities & Resources */}
            {article.internalLinks && article.internalLinks.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] mt-8 space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Related WebziFire Capabilities &amp; Resources</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {article.internalLinks.map((lnk, idx) => (
                    <a
                      key={idx}
                      href={lnk.href}
                      className="p-4 rounded-xl bg-[#0B0607] border border-[#2C181B] hover:border-[#D6334A]/60 transition-colors group flex flex-col justify-between gap-2"
                    >
                      <span className="font-sans text-sm font-medium text-[#F5EFE6] group-hover:text-[#D6334A] flex items-center justify-between gap-2">
                        <span>{lnk.anchor}</span>
                        <ArrowUpRight className="w-4 h-4 shrink-0" />
                      </span>
                      {lnk.context && (
                        <span className="font-sans text-xs text-[#8A8175] leading-relaxed">
                          {lnk.context}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Structured FAQ Section (AEO + User Clarity) */}
            {article.faqs && article.faqs.length > 0 && (
              <section className="pt-8 space-y-4">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                  <HelpCircle className="w-4 h-4" />
                  <span>Frequently Asked Questions</span>
                </div>
                <div className="space-y-3">
                  {article.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] space-y-2"
                    >
                      <h3 className="font-display font-normal text-lg sm:text-xl text-[#F5EFE6]">
                        {faq.question}
                      </h3>
                      <p className="font-sans text-sm sm:text-base text-[#C4B5A5]/90 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Architectural Takeaway Callout */}
            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] font-mono text-xs text-[#C4B5A5] mt-8 space-y-2">
              <span className="text-[#D6334A] uppercase tracking-wider font-semibold block">
                Architectural Takeaway
              </span>
              <p className="font-sans text-sm text-[#8A8175] leading-relaxed">
                {article.takeaway ||
                  "Performance and user conversion are not downstream decorations. By integrating strict latency thresholds and Obsidian design discipline from day zero, enterprise portals achieve compounding business momentum."}
              </p>
            </div>

            {/* Relevant WebziFire Engineering Capability Card (Contextual Internal Linking) */}
            {(() => {
              const matchedService =
                services.find((s) => {
                  const p = (article.category || "").toLowerCase();
                  const slug = s.slug.toLowerCase();
                  const title = s.title.toLowerCase();
                  return (
                    p.includes(slug) ||
                    slug.includes(p) ||
                    p.includes(s.category.toLowerCase()) ||
                    title.includes(p)
                  );
                }) || services[0];

              return (
                <div className="mt-8 p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-[#2C181B] bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/services/${matchedService.slug}.jpg`}
                      alt={matchedService.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-[#D6334A] font-semibold">
                      Relevant Engineering Capability
                    </div>
                    <h4 className="font-display text-lg text-[#F5EFE6] font-medium">
                      {matchedService.title}
                    </h4>
                    <p className="font-sans text-xs text-[#A29A8E] line-clamp-2 leading-relaxed">
                      {matchedService.shortDescription}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <Link
                        href={`/services/${matchedService.slug}`}
                        className="font-mono text-xs text-[#D6334A] hover:underline flex items-center gap-1"
                      >
                        <span>View Service Specs</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/book?service=${encodeURIComponent(matchedService.title)}`}
                        className="font-mono text-xs text-[#F5EFE6] hover:text-white underline underline-offset-4"
                      >
                        Scope Project ↗
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer Navigation CTA */}
          <div className="pt-10 border-t border-[#2C181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-display font-light text-xl text-[#F5EFE6]">
                {article.ctaHeading || "Ready to engineer your digital platform?"}
              </span>
              <span className="font-mono text-xs text-[#8A8175]">
                {article.ctaDescription ||
                  "Schedule a consultation with our principal team."}
              </span>
            </div>
            <a
              href="/book"
              className="px-8 py-3.5 rounded-full bg-[#F5EFE6] hover:bg-white text-[#0B0607] font-mono text-xs uppercase font-semibold tracking-wider transition-all shrink-0"
            >
              Start Project Brief
            </a>
          </div>
        </article>
      </main>

      <Footer />
      <WebziFireBot />
    </div>
  );
}
