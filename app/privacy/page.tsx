import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import { ShieldCheck, Lock, Eye, Database, FileText, CheckCircle2, Mail, Phone, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | WebziFire Enterprise Digital Agency",
  description:
    "Comprehensive privacy policy, client data sovereignty standards, and regulatory compliance protocols for WebziFire Enterprise Software & Cloud Data Engineering.",
};

export default function PrivacyPage() {
  const sections = [
    {
      id: "scope",
      title: "1. Scope & Applicability",
      content: [
        "This Privacy Policy describes how WebziFire Digital Agency (\"WebziFire\", \"we\", \"us\", or \"our\") collects, processes, secures, and safeguards personal data and technical telemetry when you interact with our websites, portals, digital applications, or engage our senior engineering pods under Master Services Agreements (MSA) and Statements of Work (SOW).",
        "WebziFire delivers digital engineering and software services globally to enterprise clients across North America, the GCC, and Europe. We comply with applicable international data privacy standards, including the General Data Protection Regulation (GDPR - Regulation (EU) 2016/679), the California Consumer Privacy Act as amended by the CPRA (CCPA/CPRA), and the DIFC Data Protection Law No. 5 of 2020.",
      ],
    },
    {
      id: "collection",
      title: "2. Information We Collect",
      content: [
        "Direct Inquiries & Project Briefs: When you submit project briefs, request architecture estimates, or communicate via our contact desk or AI scoping widget, we collect your full name, corporate email address, phone number (+923145660928 direct channel), company name, estimated budget, timeline requirements, and project specifications.",
        "Commercial & Billing Data: In connection with contracted engineering engagements, we collect corporate invoicing addresses, tax identification numbers, and authorized billing representative credentials. Payment gateway transactions are processed directly through Tier-1 PCI-DSS compliant providers (e.g., Stripe); WebziFire does not store raw credit card numbers or banking secrets.",
        "Technical Telemetry & Analytics: We automatically collect non-identifying technical metadata, including browser type, operating system, referrer URLs, IP address (truncated for anonymity), session duration, and Core Web Vitals telemetry to ensure sub-second page performance across global regions.",
      ],
    },
    {
      id: "processing",
      title: "3. Processing & Lawful Basis",
      content: [
        "Contractual Necessity: To evaluate scoping requests, draft formal Statements of Work, conduct architectural feasibility studies, and deliver contracted custom software engineering services.",
        "Legitimate Commercial Interests: To optimize portal security, prevent unauthorized intrusion attempts, monitor real-time API latency, and maintain SLA compliance across our client applications.",
        "Consent & Direct Communication: To respond to your direct inquiries, deliver technical architecture whitepapers upon request, and schedule executive scoping sessions with senior directors.",
      ],
    },
    {
      id: "code-isolation",
      title: "4. Client Codebase & Confidential Data Isolation",
      content: [
        "Zero Model Training Guarantee: WebziFire enforces an irrevocable policy regarding client intellectual property: We NEVER feed, train, fine-tune, or expose client proprietary source code, internal schemas, commercial database dumps, or private operational data to public AI or Large Language Models (LLMs).",
        "Private Vector & Tenant Isolation: Enterprise AI workflows, embeddings, and Retrieval-Augmented Generation (RAG) pipelines engineered by WebziFire run exclusively inside isolated client virtual private clouds (VPC) with role-based access control (RBAC), end-to-end payload encryption, and strict token audit logging.",
        "Non-Disclosure Agreement (NDA) Primacy: All client discussions, architectural diagrams, repository access, and commercial projections are strictly protected under mutual non-disclosure covenants that supersede general web terms.",
      ],
    },
    {
      id: "subprocessors",
      title: "5. Sub-Processors & Infrastructure Partners",
      content: [
        "WebziFire engages vetted enterprise infrastructure providers who maintain SOC 2 Type II, ISO 27001, and HIPAA compliance accreditations:",
        "• Vercel Inc. (Edge CDN hosting, SSL termination, and serverless compute)",
        "• Enterprise Cloud Database Providers (Dedicated PostgreSQL, MySQL, Supabase & MongoDB Atlas clusters with encryption at-rest)",
        "• Amazon Web Services / Google Cloud (Compute infrastructure, VPC networks, and encrypted S3/GCS backups)",
        "• Stripe Payments (PCI-DSS Level 1 payment gateway processing)",
      ],
    },
    {
      id: "sovereignty",
      title: "6. International Transfers & Data Sovereignty",
      content: [
        "Because WebziFire operates global engineering pods collaborating with enterprise clients across North America, the GCC, and Europe, cross-border technical collaboration is governed by standard contractual clauses (SCCs) and rigorous cross-border data transfer impact assessments.",
        "Client production codebases and production databases are deployed strictly within client-designated sovereign cloud regions (e.g., AWS us-east-1, eu-central-1, or me-central-1) to ensure full jurisdictional regulatory compliance.",
      ],
    },
    {
      id: "rights",
      title: "7. Your Statutory Privacy Rights",
      content: [
        "Under GDPR, CCPA/CPRA, and relevant privacy statutes, you possess explicit rights regarding your personal information:",
        "• Right of Access: You may request a verified machine-readable copy of any personal data we hold about you.",
        "• Right to Rectification & Erasure: You may instruct us to correct inaccurate records or permanently delete your contact data.",
        "• Right to Restrict & Object: You may object to particular processing operations or withdraw previously granted consent at any time.",
        "• Non-Discrimination: We will never deny services, adjust pricing, or degrade engineering quality if you choose to exercise your statutory privacy rights.",
      ],
    },
    {
      id: "retention",
      title: "8. Retention, Security & Contact Desk",
      content: [
        "Data Retention: Project scoping briefs and prospective communications are retained for 24 months to facilitate multi-phase commercial discussions, after which they are securely purged unless active contractual covenants require extended preservation.",
        "Security Standards: All transport channels enforce TLS 1.3 encryption with strict HSTS headers. Internal repository access mandates hardware-backed Multi-Factor Authentication (MFA) and least-privilege RBAC.",
        "Contacting the Data Protection Desk: To submit data inquiries, exercise privacy rights, or request an signed DPA (Data Processing Addendum), contact us directly:",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <Navbar />

      <main className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-4 max-w-4xl pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
              <span className="text-[#D6334A] text-[10px]">✦</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                Legal &amp; Compliance Protocol // Rev. 2026
              </span>
            </div>

            <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-[3.75rem] text-[#F5EFE6] tracking-tight leading-[1.08]">
              Privacy Policy &amp;<br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                data sovereignty protocol.
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#C4B5A5]/80 leading-relaxed max-w-3xl">
              WebziFire is committed to uncompromising client confidentiality, zero training on private codebases, and rigorous compliance across GDPR, CCPA, and international enterprise data protection frameworks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-[#8A8175]">
              <span>Effective Date: January 1, 2026</span>
              <span>·</span>
              <span>Last Audited: November 2026</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">Enterprise Verified</span>
            </div>
          </div>

          {/* Core Guarantees Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                Zero AI Training on Client Code
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Your proprietary software, algorithms, and database schemas are never indexed or utilized to train external language models.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                Dedicated Tenant Isolation
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Client workloads and vector retrieval stores operate inside isolated cloud VPCs with AES-256 encryption at-rest and in-transit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                Mutual NDA Enforced
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                All prospective briefs, architectural diagrams, and commercial discussions are safeguarded under mutual non-disclosure agreements.
              </p>
            </div>
          </div>

          {/* Legal Document Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
            {/* Main Sections */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              {sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="p-8 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-4 shadow-elevated-card scroll-mt-28"
                >
                  <h2 className="font-display font-light text-2xl font-bold text-[#F5EFE6] pb-2 border-b border-[#2C181B]">
                    {section.title}
                  </h2>
                  <div className="space-y-3 font-sans text-sm text-[#C4B5A5] leading-relaxed">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}

              {/* Contact Box */}
              <div className="p-8 rounded-2xl bg-[#1B0E10] border border-[#2C181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                    Direct Privacy Desk
                  </span>
                  <h3 className="font-display font-light text-xl font-bold text-[#F5EFE6]">
                    Questions regarding your data or security covenants?
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1 font-mono text-xs">
                    <a
                      href="mailto:inquire@webzifire.com"
                      className="text-[#D6334A] hover:underline flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>inquire@webzifire.com</span>
                    </a>
                    <a
                      href="tel:+923145660928"
                      className="text-[#8A8175] hover:text-[#F5EFE6] flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>+923145660928</span>
                    </a>
                  </div>
                </div>

                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#F5EFE6] bg-primary-container hover:bg-[#ff3b3b] px-6 py-3 rounded-full shadow-coral-sm transition-all shrink-0"
                >
                  <span>Contact Desk</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sticky Sidebar Navigation */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] sticky top-28 flex flex-col gap-4 shadow-elevated-card">
                <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold pb-2 border-b border-[#2C181B]">
                  Document Navigation
                </span>
                <nav className="flex flex-col gap-2 font-mono text-xs text-[#C4B5A5]">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="hover:text-[#D6334A] transition-colors py-1 truncate"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>

                <div className="pt-4 border-t border-[#2C181B] flex flex-col gap-2">
                  <span className="font-mono text-[11px] text-[#8A8175] block">Related Documents</span>
                  <a
                    href="/terms"
                    className="font-mono text-xs text-[#F5EFE6] hover:text-[#D6334A] transition-colors flex items-center justify-between"
                  >
                    <span>Terms of Service</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D6334A]" />
                  </a>
                  <a
                    href="/security"
                    className="font-mono text-xs text-[#F5EFE6] hover:text-[#D6334A] transition-colors flex items-center justify-between"
                  >
                    <span>Security &amp; Compliance</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#D6334A]" />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <WebziFireBot />
    </div>
  );
}
