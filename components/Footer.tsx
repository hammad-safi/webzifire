"use client";

import React from "react";
import { Mail, Phone, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0607] border-t border-[#2C181B] relative overflow-hidden">
      {/* Subtle ambient bottom-left coral glow */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(214,51,74,0.12),transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-16 lg:py-24 relative z-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-[#2C181B]">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/webzifire-logo.png"
                alt="WebziFire Logo"
                className="h-9 w-auto object-contain filter hover:brightness-110 transition-all duration-300"
              />
            </div>

            <p className="font-sans text-sm text-[#C4B5A5]/80 leading-relaxed max-w-md">
              <strong className="text-[#F5EFE6] font-medium">Igniting ideas through technology.</strong> Engineering high-conviction digital products, scalable enterprise web engines, and transformative brand identities for visionary leaders globally.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175]">
                Direct Inquiries
              </span>
              <a
                href="mailto:inquire@webzifire.com"
                className="font-mono text-sm text-[#F5EFE6] hover:text-[#D6334A] transition-colors flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#D6334A]" />
                <span>inquire@webzifire.com</span>
              </a>
              <div className="font-mono text-xs text-[#C4B5A5] flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-[#D6334A]" />
                <a href="tel:+923145660928" className="hover:text-[#D6334A] transition-colors">
                  +923145660928
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Core Disciplines */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold">
              Core Disciplines
            </span>
            <ul className="flex flex-col gap-2 pt-1 font-sans text-sm text-[#C4B5A5]/80">
              <li className="hover:text-[#F5EFE6] transition-colors">
                <a href="/services/website-web-application-development">Website &amp; Web App Development</a>
              </li>
              <li className="hover:text-[#F5EFE6] transition-colors">
                <a href="/services/mobile-application-development">Mobile Application Development</a>
              </li>
              <li className="hover:text-[#F5EFE6] transition-colors">
                <a href="/services/erp-enterprise-software">ERP &amp; Enterprise Software</a>
              </li>
              <li className="hover:text-[#F5EFE6] transition-colors">
                <a href="/services/ai-powered-application-development">AI-Powered Applications</a>
              </li>
              <li className="hover:text-[#F5EFE6] transition-colors">
                <a href="/services/ui-ux-design">UI/UX &amp; Design Systems</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio Navigation */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#8A8175] font-semibold">
              Studio Navigation
            </span>
            <ul className="flex flex-col gap-2 pt-1 font-mono text-xs text-[#8A8175]">
              <li>
                <a href="/about" className="hover:text-[#F5EFE6] transition-colors">
                  About Studio
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-[#F5EFE6] transition-colors">
                  Our Capabilities
                </a>
              </li>
              <li>
                <a href="/work" className="hover:text-[#F5EFE6] transition-colors">
                  Digital Products
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-[#F5EFE6] transition-colors">
                  Engineering Journal
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-[#F5EFE6] transition-colors">
                  Contact Desk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-[#8A8175]">
          <p>© 2023-2026 WebziFire Digital Agency. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="hover:text-[#F5EFE6] transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-[#F5EFE6] transition-colors">
              Terms of Service
            </a>
            <a href="/security" className="hover:text-[#F5EFE6] transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6334A]" />
              <span>Security &amp; Compliance</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
