import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebziFireBot from "@/components/WebziFireBot";
import { ShieldAlert, ShieldCheck, Lock, Terminal, Cpu, Server, CheckCircle2, Mail, Phone, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security & Compliance | WebziFire Enterprise Digital Agency",
  description:
    "Enterprise security architecture, SOC 2 and ISO 27001 alignment, automated DevSecOps, TLS 1.3 / AES-256 encryption, zero-trust RBAC, and incident response SLAs.",
};

export default function SecurityPage() {
  const sections = [
    {
      id: "philosophy",
      title: "1. Enterprise Security Philosophy & Defense-in-Depth",
      content: [
        "At WebziFire, security is not an afterthought or an add-on layer; it is fundamentally engineered into every line of code, cloud architecture diagram, and operational workflow. We adopt a rigorous Defense-in-Depth strategy ensuring that if any single security perimeter is breached, multiple subsequent controls prevent unauthorized exposure or lateral movement.",
        "Our engineering teams operate under a strict Zero-Trust Architecture: we verify explicitly, enforce least-privilege access across all environments, and continuously assume breach to validate fail-safe recovery mechanisms.",
      ],
    },
    {
      id: "encryption",
      title: "2. Cryptography & Data Protection Standards",
      content: [
        "Encryption In-Transit: All external and inter-service communications enforce modern TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS) headers, PFS (Perfect Forward Secrecy), and automated zero-downtime certificate renewal.",
        "Encryption At-Rest: All persistent storage tiers, including dedicated MongoDB Atlas clusters, Redis cache nodes, and cloud object stores (AWS S3 / Google Cloud Storage), are encrypted at-rest using industry-standard AES-256 cryptographic ciphers with automated customer-managed key rotation.",
        "Secrets & Credentials Management: WebziFire strictly prohibits the storage of API keys, database credentials, or secret tokens in source code repositories. Secrets are injected at runtime exclusively via encrypted environment variable managers (AWS Secrets Manager, Vercel Vault, Doppler) with automated auditing.",
      ],
    },
    {
      id: "devsecops",
      title: "3. Secure Software Development Lifecycle (SSDLC) & DevSecOps",
      content: [
        "Continuous Automated Scanning: Every code commit and pull request triggers automated Static Application Security Testing (SAST), software composition analysis (SCA) via Snyk and GitHub Dependabot, and container vulnerability scanning before merge approval.",
        "OWASP Top 10 Mitigation: Custom web applications, REST APIs, and microservices are engineered to proactively defeat SQL/NoSQL injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Broken Object-Level Authorization (BOLA).",
        "Mandatory Peer Code Review: Production code requires approval from at least two senior engineers, including verification of input sanitization, rate-limiting thresholds, and authorization guards.",
      ],
    },
    {
      id: "iam",
      title: "4. Identity, Authentication & Access Control (IAM)",
      content: [
        "Hardware-Backed MFA: Multi-Factor Authentication (FIDO2/WebAuthn or TOTP) is strictly mandatory across all internal developer workstations, GitHub organization memberships, and cloud hosting consoles.",
        "Least-Privilege Role-Based Access Control (RBAC): Engineers and system processes are granted strictly the minimum permissions necessary to execute assigned sprint tasks. Production database access is tightly restricted, logged, and requires ephemeral Just-In-Time (JIT) approvals.",
        "Rapid Offboarding: Automated Single Sign-On (SSO) deprovisioning revokes all repository access, cloud credentials, and internal communication channels within 15 minutes of engineer reallocation or departure.",
      ],
    },
    {
      id: "infrastructure",
      title: "5. Cloud Infrastructure & Edge Perimeter Defense",
      content: [
        "Virtual Private Cloud (VPC) Isolation: Production databases, caching layers, and internal microservices reside in private cloud subnets with no public IPv4 addresses, accessible only through hardened API gateways or secure VPN tunnels.",
        "Edge DDoS Protection & WAF: Global applications are routed through enterprise edge networks (Vercel Edge Network / Cloudflare) equipped with automated Layer 3/4/7 DDoS mitigation, behavioral rate limiting, and Web Application Firewall (WAF) filtering.",
        "Immutable Deployment Artifacts: Serverless build bundles and container images are generated immutably, ensuring that runtime code cannot be modified or injected in live production environments.",
      ],
    },
    {
      id: "backups",
      title: "6. Business Continuity, Backups & Disaster Recovery",
      content: [
        "Point-in-Time Recovery (PITR): Managed PostgreSQL, MySQL, and MongoDB Atlas databases maintain continuous operational logging, enabling millisecond-accurate point-in-time rollbacks in the event of logical corruption or human error.",
        "Geographic Redundancy: Encrypted database snapshots are replicated cross-region across independent availability zones with a verified Recovery Point Objective (RPO) under 15 minutes and Recovery Time Objective (RTO) under 60 minutes.",
        "Quarterly Disaster Recovery Drills: WebziFire conducts simulated production failover and restoration drills on a quarterly cadence to validate backup integrity and verify operational recovery runbooks.",
      ],
    },
    {
      id: "incident-response",
      title: "7. 24/7 Incident Response SLA & Vulnerability Disclosure",
      content: [
        "Continuous Telemetry: Centralized logging, distributed tracing, and real-time anomaly alerts detect anomalous spikes in API errors, authentication failures, or latency deviations instantly.",
        "Emergency Incident SLA: For critical Severity-1 incidents (e.g., active vulnerability exploit or catastrophic outage), WebziFire guarantees formal incident acknowledgment within 15 minutes and deployment of active mitigation pods within 1 hour.",
        "Responsible Vulnerability Disclosure: We welcome security researchers to inspect our public endpoints. If you discover a potential vulnerability, report it immediately to inquire@webzifire.com. We pledge not to pursue legal action against researchers acting in good faith who follow responsible disclosure practices.",
      ],
    },
    {
      id: "compliance",
      title: "8. Regulatory Compliance & Industry Certifications",
      content: [
        "SOC 2 Type II Alignment: Our operational processes, change management frameworks, and access controls are structured around the AICPA Trust Services Criteria for Security, Availability, and Confidentiality.",
        "ISO/IEC 27001:2022 Controls: WebziFire adheres to ISO 27001 information security management guidelines across personnel security, cryptography, supplier relationships, and vulnerability management.",
        "GDPR & CCPA/CPRA Compliance: As a data processor, we enter into standard Data Processing Addendums (DPA) with enterprise clients, guaranteeing strict adherence to international consumer privacy regulations.",
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
                Security Posture &amp; Compliance // Rev. 2026
              </span>
            </div>

            <h1 className="font-display font-light text-4xl sm:text-6xl lg:text-[3.75rem] text-[#F5EFE6] tracking-tight leading-[1.08]">
              Enterprise security posture &amp;<br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                architectural safeguards.
              </span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-[#C4B5A5]/80 leading-relaxed max-w-3xl">
              WebziFire engineers digital products with enterprise defense-in-depth: zero-trust network access, end-to-end data encryption, automated DevSecOps vulnerability scanning, and proactive disaster recovery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 font-mono text-xs text-[#8A8175]">
              <span>Standard: SOC 2 &amp; ISO 27001 Aligned</span>
              <span>·</span>
              <span>Audit Period: 2026</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero Critical Vulnerabilities
              </span>
            </div>
          </div>

          {/* Core Security Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                SOC 2 &amp; ISO Alignment
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Zero-trust access policies, continuous compliance audits, hardware-enforced MFA, and strict operational controls.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                TLS 1.3 &amp; AES-256
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Modern cryptographic standards safeguarding all data in-transit and at-rest across dedicated PostgreSQL, MySQL, and MongoDB Atlas clusters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] flex flex-col gap-3 shadow-elevated-card">
              <div className="w-9 h-9 rounded-xl bg-[#1B0E10] flex items-center justify-center text-[#D6334A] border border-[#2C181B]">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="font-display font-light text-lg text-[#F5EFE6]">
                Automated DevSecOps
              </h3>
              <p className="font-sans text-xs text-[#8A8175] leading-relaxed">
                Automated static analysis, Snyk dependency audits, OWASP Top 10 mitigation, and peer review for every pull request.
              </p>
            </div>
          </div>

          {/* Legal / Security Document Body */}
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

              {/* Inquiry & Security Desk Box */}
              <div className="p-8 rounded-2xl bg-[#1B0E10] border border-[#2C181B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#D6334A] font-semibold">
                    Security Operations Desk
                  </span>
                  <h3 className="font-display font-light text-xl font-bold text-[#F5EFE6]">
                    Have a security questionnaire or need an NDA / DPA?
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
                  <span>Request Security Packet</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Sticky Sidebar Navigation */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-2xl bg-[#140A0C] border border-[#2C181B] sticky top-28 flex flex-col gap-4 shadow-elevated-card">
                <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold pb-2 border-b border-[#2C181B]">
                  Security Navigation
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
                    href="/terms"
                    className="font-mono text-xs text-[#F5EFE6] hover:text-[#D6334A] transition-colors flex items-center justify-between"
                  >
                    <span>Terms of Service</span>
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
