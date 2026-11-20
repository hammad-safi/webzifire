import React from "react";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import { FileCheck, Shield, Award, Clock, ArrowUpRight, Mail, Phone, Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | WebziFire Enterprise Digital Agency",
  description:
    "Master services agreement terms, intellectual property assignment policies, milestone billing, and commercial warranty covenants for WebziFire software engineering.",
};

export default function TermsPage() {
  const sections = [
    {
      id: "framework",
      title: "1. Engagement Framework & Statements of Work",
      content: [
        "These Terms of Service (\"Terms\") govern all commercial software development, architectural consulting, digital product engineering, and design services provided by WebziFire Digital Agency (\"WebziFire\", \"we\", or \"us\") to clients (\"Client\", \"you\").",
        "Each specific project engagement is formalized through a Statement of Work (\"SOW\") or Project Scope Charter referencing these Terms. SOWs define specific sprint deliverables, milestone timetables, commercial fee structures, and technical acceptance criteria. In the event of any direct conflict between these Terms and an executed SOW, the specific terms of the SOW shall govern.",
      ],
    },
    {
      id: "ip-rights",
      title: "2. Intellectual Property Rights & 100% IP Assignment",
      content: [
        "Full Client Ownership: Subject to final settlement of contracted milestone fees, WebziFire unconditionally assigns and transfers to Client 100% of all right, title, and interest in and to all custom codebases, Next.js components, database schemas, API connectors, UI/UX design tokens, and Figma files developed specifically for Client under the applicable SOW (\"Custom Work Product\").",
        "Pre-Existing Agency Frameworks: WebziFire retains ownership of general open-source boilerplate scaffolds, developer tooling, and reusable utility scripts (\"Pre-Existing Core\"). WebziFire grants Client a perpetual, irrevocable, worldwide, royalty-free, transferable license to use, modify, and deploy any Pre-Existing Core embedded within the delivered Work Product.",
        "Zero Vendor Lock-In: WebziFire delivers all compiled assets, Git repository transfer, and deployment documentation directly to Client's designated accounts (GitHub/GitLab, Vercel, Supabase, PostgreSQL, MySQL, MongoDB Atlas, AWS) upon project completion.",
      ],
    },
    {
      id: "collaboration",
      title: "3. Client Responsibilities & Feedback Windows",
      content: [
        "To maintain sub-second sprint momentum, Client agrees to provide timely feedback, required third-party API credentials, domain access, and design approvals.",
        "Formal Review Period: Client shall have fourteen (14) calendar days following milestone delivery to review deliverables against the technical acceptance criteria defined in the SOW. If no written notice of defect or change request is received within 14 days, the milestone is deemed formally accepted.",
      ],
    },
    {
      id: "billing",
      title: "4. Milestone Billing, Invoicing & Change Requests",
      content: [
        "Milestone Structure: Engagements are billed against verified technical milestones (e.g., Sprint 1: Architecture & Design System; Sprint 2: Core Platform Engine & Database Architecture; Sprint 3: Production QA & Launch). Invoices are payable within fourteen (14) days of issuance.",
        "Change Orders: Any requests for features, integrations, or workflows outside the agreed SOW scope are documented via formal Change Order, outlining incremental sprint timeline adjustments and fee revisions. No out-of-scope work proceeds without Client's written authorization.",
      ],
    },
    {
      id: "warranty",
      title: "5. 30-Day Post-Launch Warranty & Engineering SLAs",
      content: [
        "Defect Remediation: WebziFire provides an unconditional thirty (30) day warranty starting on official production deployment date. During this warranty window, WebziFire shall triage and remediate any reproducible bugs, broken API connectors, or regressions free of charge.",
        "SLA Standard: Critical production severity incidents (e.g., payment gateway failure or complete platform outage) are acknowledged within two (2) hours and actively resolved under emergency protocol.",
      ],
    },
    {
      id: "confidentiality",
      title: "6. Mutual Confidentiality & NDA Protection",
      content: [
        "Both parties agree that all proprietary business plans, financial models, customer databases, technical architectures, and software source code exchanged during pre-sales or active delivery are strictly Confidential Information.",
        "Neither party shall disclose, reproduce, or leverage Confidential Information for any purpose outside project execution without prior written consent. This confidentiality covenant endures for five (5) years following project completion or indefinitely for proprietary source code.",
      ],
    },
    {
      id: "liability",
      title: "7. Warranties, Disclaimers & Limitation of Liability",
      content: [
        "Professional Standards: WebziFire warrants that all services will be executed in a professional, workmanlike manner adhering to modern software engineering best practices, WCAG accessibility benchmarks, and strict security standards.",
        "Liability Cap: To the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, punitive, or consequential damages (including loss of profits or commercial interruption). Each party's aggregate monetary liability under an SOW shall not exceed the total fees paid by Client to WebziFire under that specific SOW during the preceding six (6) months.",
      ],
    },
    {
      id: "governing-law",
      title: "8. Governing Law & Dispute Resolution",
      content: [
        "These Terms shall be construed and governed in accordance with international commercial law. Dispute resolution shall be conducted via good-faith executive escalation followed by binding international commercial arbitration under the rules of the International Chamber of Commerce (ICC).",
        "Good-Faith Negotiation: Prior to initiating legal proceedings, both parties commit to a thirty (30) day good-faith executive escalation negotiation between designated corporate officers.",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0607] text-[#F5EFE6]">
      <main className="w-full pt-28 pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-4 max-w-4xl pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
              <span className="text-[#D6334A] text-[10px]">✦</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                Commercial Standards // Rev. 2026
              </span>
            </div>

            <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-[3.75rem] text-[#F5EFE6] tracking-tight leading-[1.08]">
              Terms of Service &amp;<br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                master service agreement.
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#C4B5A5]/80 leading-relaxed max-w-3xl">
              Transparent, founder-friendly commercial terms. WebziFire guarantees 100% intellectual property assignment, milestone-based predictability, and a 30-day post-launch warranty on every engagement.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-[#8A8175]">
              <span>Standard Form: MSA-2026</span>
              <span>·</span>
              <span>Last Updated: November 2026</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">100% Client IP Guarantee</span>
            </div>
          </div>

          {/* Core Commercial Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                100% Client IP Ownership
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Full legal assignment of all code, design tokens, schemas, and assets upon milestone settlement with zero vendor lock-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                30-Day Launch Warranty
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Every release includes 30 days of comprehensive defect remediation, performance checks, and critical SLA support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                Milestone Predictability
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Fixed-scope sprint deliverables, transparent acceptance criteria, and zero unexpected fee revisions.
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

              {/* Inquiry & SOW Consultation Box */}
              <div className="p-8 rounded-2xl bg-[#1B0E10] border border-[#2C181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                    Legal &amp; Commercial Desk
                  </span>
                  <h3 className="font-display font-light text-xl font-bold text-[#F5EFE6]">
                    Need a custom Master Services Agreement or enterprise SOW?
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
                  href="/book"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[#F5EFE6] bg-primary-container hover:bg-[#ff3b3b] px-6 py-3 rounded-full shadow-coral-sm transition-all shrink-0"
                >
                  <span>Start SOW Scoping</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sticky Sidebar Navigation */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] sticky top-28 flex flex-col gap-4 shadow-elevated-card">
                <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold pb-2 border-b border-[#2C181B]">
                  Terms Navigation
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
                    href="/privacy"
                    className="font-mono text-xs text-[#F5EFE6] hover:text-[#D6334A] transition-colors flex items-center justify-between"
                  >
                    <span>Privacy Policy</span>
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
