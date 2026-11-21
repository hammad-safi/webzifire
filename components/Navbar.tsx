"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowUpRight,
  Phone,
  Mail,
  ChevronDown,
  Globe,
  Smartphone,
  Database,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
  }, [pathname]);

  // Handle escape key and lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileMenuOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  const handleMouseEnterServices = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesMenuOpen(true);
  };

  const handleMouseLeaveServices = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesMenuOpen(false);
    }, 180);
  };

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services", hasMega: true },
    { label: "Work", href: "/work" },
    { label: "Journal", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const serviceClusters = [
    {
      title: "Web & Cloud SaaS",
      icon: Globe,
      color: "text-blue-400",
      services: [
        { name: "Website & Web Apps", href: "/services/website-web-application-development", tag: "Next.js" },
        { name: "SaaS Product Dev", href: "/services/saas-product-development", tag: "Multi-Tenant" },
        { name: "Backend & APIs", href: "/services/backend-api-development", tag: "Microservices" },
        { name: "E-Commerce", href: "/services/ecommerce-development", tag: "Headless" },
      ],
    },
    {
      title: "Mobile & Apps",
      icon: Smartphone,
      color: "text-emerald-400",
      services: [
        { name: "Mobile App Dev", href: "/services/mobile-application-development", tag: "iOS & Android" },
        { name: "Desktop Apps", href: "/services/desktop-application-development", tag: "Electron" },
      ],
    },
    {
      title: "Enterprise & ERP",
      icon: Database,
      color: "text-[#D6334A]",
      services: [
        { name: "Enterprise ERP", href: "/services/erp-enterprise-software", tag: "ACID Ledger" },
        { name: "POS & Retail Systems", href: "/services/pos-retail-management-systems", tag: "Offline-First" },
        { name: "CRM Business Apps", href: "/services/crm-business-applications", tag: "Custom Pipelines" },
        { name: "Maintenance & Tuning", href: "/services/software-maintenance-optimization", tag: "SLA Support" },
      ],
    },
    {
      title: "AI & Experience",
      icon: Cpu,
      color: "text-purple-400",
      services: [
        { name: "AI-Powered Apps", href: "/services/ai-powered-application-development", tag: "RAG & Agents" },
        { name: "UI/UX Design Systems", href: "/services/ui-ux-design", tag: "Figma to Code" },
      ],
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0B0607]/90 backdrop-blur-md border-b border-[#2C181B] ${
          scrolled
            ? "shadow-[0_12px_36px_rgba(0,0,0,0.95)]"
            : "shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 h-20 flex items-center justify-between gap-4">
          {/* WebziFire Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group shrink-0"
            aria-label="WebziFire Home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/webzifire-logo.png"
                alt="WebziFire — Igniting Ideas Through Technology"
                className="h-7 sm:h-8 md:h-9 w-auto object-contain filter group-hover:brightness-110 group-hover:drop-shadow-[0_0_16px_rgba(214,51,74,0.4)] transition-all duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="site-header__nav hidden lg:flex items-center"
            id="desktop-nav"
            role="navigation"
            aria-label="Primary Menu"
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              if (link.hasMega) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={handleMouseEnterServices}
                    onMouseLeave={handleMouseLeaveServices}
                  >
                    <Link
                      href={link.href}
                      className={`inline-flex items-center gap-1.5 transition-colors ${
                        isActive ? "is-active text-[#F5EFE6]" : "text-[#C4B5A5] hover:text-[#F5EFE6]"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 text-[#8A8175] ${
                          servicesMenuOpen ? "rotate-180 text-[#D6334A]" : ""
                        }`}
                      />
                    </Link>

                    {/* Services Frosted Mega-Dropdown */}
                    {servicesMenuOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-[820px] pt-3 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto"
                        onMouseEnter={handleMouseEnterServices}
                        onMouseLeave={handleMouseLeaveServices}
                      >
                        <div className="bg-[#140A0C]/98 backdrop-blur-2xl border border-[#2C181B] rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-6">
                          {/* 4 Pillar Columns */}
                          <div className="grid grid-cols-4 gap-5">
                            {serviceClusters.map((cluster, idx) => {
                              const Icon = cluster.icon;
                              return (
                                <div key={idx} className="flex flex-col gap-3">
                                  <div className="flex items-center gap-2 pb-2 border-b border-[#2C181B]">
                                    <Icon className={`w-3.5 h-3.5 ${cluster.color}`} />
                                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[#F5EFE6]">
                                      {cluster.title}
                                    </span>
                                  </div>
                                  <ul className="space-y-1.5 list-none">
                                    {cluster.services.map((svc, i) => (
                                      <li key={i}>
                                        <Link
                                          href={svc.href}
                                          className="group flex flex-col p-2 rounded-xl hover:bg-[#1B0E10] transition-colors"
                                        >
                                          <span className="font-sans text-xs text-[#C4B5A5] group-hover:text-[#F5EFE6] group-hover:translate-x-0.5 transition-all flex items-center justify-between">
                                            <span>{svc.name}</span>
                                            <ArrowUpRight className="w-3 h-3 text-[#D6334A] opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </span>
                                          <span className="font-mono text-[9px] text-[#8A8175]">
                                            {svc.tag}
                                          </span>
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>

                          {/* Dropdown Bottom Banner */}
                          <div className="pt-3 border-t border-[#2C181B] flex items-center justify-between text-xs font-mono">
                            <span className="text-[#8A8175] flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#D6334A]" />
                              <span>12 Core Disciplines · Fixed-Bid Delivery</span>
                            </span>
                            <Link
                              href="/services"
                              className="text-[#D6334A] hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>Explore Full Capabilities Catalog</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive ? "is-active" : ""}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Elements */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Desktop Start a Project CTA Button */}
            <Link
              href="/book"
              className="hidden md:inline-flex items-center gap-3 bg-[#F5EFE6] hover:bg-white text-[#0A0707] font-sans font-medium text-xs tracking-wider uppercase pl-5 pr-2 py-2 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.08)] transition-all duration-300 hover:scale-[1.02] group"
            >
              <span>Start a Project</span>
              <span className="w-7 h-7 rounded-full bg-[#D6334A] text-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Direct WhatsApp Channel Button (Visible on wide screens) */}
            <a
              href="https://wa.me/923145660928?text=Hello%20WebziFire!%20I%20would%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#140A0C] hover:bg-[#1B0E10] border border-[#25D366]/40 hover:border-[#25D366] font-mono text-xs text-[#F5EFE6] transition-all duration-200 shadow-[0_0_14px_rgba(37,211,102,0.15)] hover:shadow-[0_0_22px_rgba(37,211,102,0.35)] group"
              aria-label="Chat on WhatsApp"
            >
              <span className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <svg
                  className="w-3 h-3 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </span>
              <span className="text-[#25D366] font-semibold tracking-wider uppercase">WhatsApp</span>
            </a>

            {/* Mobile / Tablet Menu Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-[#140A0C] border border-[#2C181B] text-[#F5EFE6] hover:bg-[#1B0E10] hover:border-[#D6334A]/50 active:scale-95 transition-all shadow-sm"
              aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#D6334A]" />
              ) : (
                <Menu className="w-5 h-5 text-[#F5EFE6]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 top-20 bg-black/80 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Navigation Panel */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed top-20 left-0 right-0 z-50 bg-[#0B0607] border-b border-[#2C181B] max-h-[calc(100vh-5rem)] overflow-y-auto px-5 sm:px-8 py-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] lg:hidden"
        >
          <div className="flex flex-col gap-5 max-w-lg mx-auto">
            {/* Drawer Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2C181B] text-xs font-mono text-[#8A8175]">
              <span className="tracking-widest uppercase">STUDIO DIRECTORY</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE SPRINT
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-1.5" aria-label="Mobile Primary Menu">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-display text-lg px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                      isActive
                        ? "bg-[#1B0E10] text-[#F5EFE6] border border-[#2C181B] font-medium"
                        : "text-[#C4B5A5] hover:text-[#F5EFE6] hover:bg-[#140A0C]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D6334A] shrink-0" />
                      )}
                      <span>{link.label}</span>
                    </div>
                    <ArrowUpRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? "text-[#D6334A]"
                          : "text-[#8A8175] opacity-60"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-[#2C181B] flex flex-col gap-3">
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center font-sans font-medium text-xs uppercase tracking-wider text-[#0A0707] bg-[#F5EFE6] hover:bg-white py-3.5 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2"
              >
                <span>Start a Project</span>
                <span className="w-5 h-5 rounded-full bg-[#D6334A] text-white flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </Link>

              <a
                href="https://wa.me/923145660928?text=Hello%20WebziFire!%20I%20would%20like%20to%20discuss%20a%20project."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center font-mono font-medium text-xs uppercase tracking-wider text-emerald-400 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 py-3 rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp (+92 314 5660928)</span>
              </a>

              {/* Contact Footer Line */}
              <div className="pt-2 flex items-center justify-between text-mono text-[11px] text-[#8A8175]">
                <a
                  href="mailto:inquire@webzifire.com"
                  className="hover:text-[#F5EFE6] transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3 h-3 text-[#D6334A]" />
                  <span>inquire@webzifire.com</span>
                </a>
                <span>Global Remote Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
