import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { services } from "@/data/services";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: "WebziFire | Igniting Ideas Through Technology — Enterprise Digital Agency",
  description:
    "WebziFire designs high-converting websites, scalable enterprise software, mobile platforms, and AI growth systems for ambitious businesses worldwide.",
  keywords: [
    "WebziFire",
    "WebziFire Agency",
    "Igniting Ideas Through Technology",
    "Enterprise Software",
    "Next.js Development",
    "AI Automation",
    "Custom Web Design",
    "Mobile App Development",
    "SEO Growth Systems",
    "Digital Practice",
  ],
  icons: {
    icon: "/webzifire-icon.png",
    apple: "/webzifire-icon.png",
  },
  openGraph: {
    title: "WebziFire | Igniting Ideas Through Technology",
    description:
      "Web Design & Software that Attracts. Converts. Compounds. Senior-led engineering combining positioning, web design, custom platform engineering, ecommerce, search, and AI automation.",
    url: "https://webzifire.com",
    siteName: "WebziFire",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://webzifire.com/#organization",
        name: "WebziFire",
        alternateName: "WebziFire Digital Agency — Igniting Ideas Through Technology",
        url: "https://webzifire.com/",
        logo: "https://webzifire.com/webzifire-logo.png",
        description:
          "WebziFire designs high-converting websites, ecommerce experiences, enterprise SaaS, and SEO growth systems for ambitious businesses worldwide.",
        foundingDate: "2023",
        areaServed: [
          { "@type": "Country", name: "United States" },
          { "@type": "Country", name: "United Arab Emirates" },
          { "@type": "Country", name: "United Kingdom" },
        ],
        award: [
          "TechBehemoths Global Excellence Awards 2025 - Web Development",
          "TechBehemoths Global Excellence Awards 2025 - UX/UI Design",
          "TechBehemoths Global Excellence Awards 2025 - Enterprise Platforms",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Enterprise Digital Services",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: s.title,
              description: s.shortDescription,
              url: `https://webzifire.com/services/${s.slug}`,
            },
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.answer,
          },
        })),
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/webzifire-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0B0607] text-[#F5EFE6] font-sans antialiased selection:bg-[#D6334A] selection:text-white relative min-h-screen">
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="webzifire-ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
        {/* Ambient Global Top Crimson Halo matching screenshot */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] max-w-[100vw] h-[700px] bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(214,51,74,0.26),rgba(160,20,38,0.08)_50%,transparent_75%)]" />
          <div className="absolute top-[30%] right-0 w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(214,51,74,0.06),transparent_70%)] blur-[120px]" />
        </div>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
