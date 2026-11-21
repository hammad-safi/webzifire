import React from "react";
import Link from "next/link";

export interface ServiceKeywordMapping {
  slug: string;
  title: string;
  pattern: RegExp;
}

export const SERVICE_KEYWORD_MAPPINGS: ServiceKeywordMapping[] = [
  {
    slug: "mobile-application-development",
    title: "Mobile Application Development",
    pattern: /\b(mobile (?:app|application) development|cross-platform mobile apps?|react native mobile apps?)\b/i,
  },
  {
    slug: "website-web-application-development",
    title: "Website & Web Application Development",
    pattern: /\b(web application development|custom web applications?|next\.js development|enterprise web portals?)\b/i,
  },
  {
    slug: "erp-enterprise-software",
    title: "ERP & Enterprise Software",
    pattern: /\b(custom erp(?: software)?|enterprise resource planning|bespoke erp systems?)\b/i,
  },
  {
    slug: "pos-retail-management-systems",
    title: "POS & Retail Management Systems",
    pattern: /\b(pos systems?|point of sale systems?|retail management systems?)\b/i,
  },
  {
    slug: "saas-product-development",
    title: "SaaS Product Development",
    pattern: /\b(saas product development|multi-tenant saas|saas platforms?|b2b saas architecture)\b/i,
  },
  {
    slug: "crm-business-applications",
    title: "CRM & Business Applications",
    pattern: /\b(custom crm|crm business applications?|bespoke crm systems?)\b/i,
  },
  {
    slug: "ecommerce-development",
    title: "E-Commerce Development",
    pattern: /\b(e-?commerce development|headless e-?commerce|custom online stores?)\b/i,
  },
  {
    slug: "backend-api-development",
    title: "Backend & API Development",
    pattern: /\b(backend (?:api )?development|microservices architecture|restful apis?)\b/i,
  },
  {
    slug: "desktop-application-development",
    title: "Desktop Application Development",
    pattern: /\b(desktop application development|electron applications?)\b/i,
  },
  {
    slug: "ai-powered-application-development",
    title: "AI-Powered Application Development",
    pattern: /\b(ai-powered applications?|custom ai agents?|rag pipelines?|ai business automation)\b/i,
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    pattern: /\b(ui\/ux design|user experience design|product design systems?)\b/i,
  },
  {
    slug: "software-maintenance-optimization",
    title: "Software Maintenance & Optimization",
    pattern: /\b(software maintenance|application optimization|speed tune-ups?)\b/i,
  },
];

/**
 * Recursively scans text and turns the first occurrence of each service keyword into a
 * natural contextual internal link to /services/[slug], enforcing max 1 link per service.
 */
export function linkifyContent(text: string, usedSlugs: Set<string>): React.ReactNode {
  if (!text || typeof text !== "string") return text;

  for (const item of SERVICE_KEYWORD_MAPPINGS) {
    if (usedSlugs.has(item.slug)) continue;

    const regex = new RegExp(item.pattern.source, "i");
    const match = regex.exec(text);

    if (match && match.index !== undefined) {
      usedSlugs.add(item.slug);
      const matchIndex = match.index;
      const matchedStr = match[0];
      const before = text.slice(0, matchIndex);
      const after = text.slice(matchIndex + matchedStr.length);

      return (
        <>
          {before}
          <Link
            href={`/services/${item.slug}`}
            title={`WebziFire ${item.title}`}
            className="text-[#D6334A] hover:underline underline-offset-4 font-medium transition-colors"
          >
            {matchedStr}
          </Link>
          {linkifyContent(after, usedSlugs)}
        </>
      );
    }
  }

  return text;
}
