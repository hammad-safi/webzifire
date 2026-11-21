"use client";

import React, { useState } from "react";
import { faqs } from "@/data/faqs";
import { Plus, Minus, Search, HelpCircle, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="w-full py-20 lg:py-28 bg-[#070405] border-y border-white/[0.08] relative overflow-hidden" id="faq">
      {/* Ambient Crimson Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[850px] max-w-[95vw] h-[520px] bg-[radial-gradient(ellipse_at_top_right,rgba(224,50,75,0.18),transparent_65%)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]"
        >
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] w-fit">
              <span className="text-[#E0324B] text-[10px]">✦</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#D6CEC5] font-semibold">
                Transparent Delivery Standards
              </span>
            </div>
            <h2 className="font-display font-light text-3xl sm:text-5xl lg:text-[3.25rem] text-[#FAF7F2] tracking-tight leading-[1.12]">
              Essential answers,<br />
              <span className="display-italic font-normal text-[#D6CEC5]">
                before the initial briefing.
              </span>
            </h2>
          </div>

          {/* Quick FAQ Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#D6CEC5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword (e.g. SLA, scope)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#FAF7F2] placeholder:text-[#D6CEC5]/60 focus:outline-none focus:border-[#E0324B] focus:ring-1 focus:ring-[#E0324B]/40"
            />
          </div>
        </motion.div>

        {/* Accordion List with Motion */}
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-[#D6CEC5] font-mono text-xs">
              No matching questions found. Try searching for &apos;pricing&apos;, &apos;services&apos;, or &apos;timeline&apos;.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-white/[0.05] border-[#E0324B]/60 shadow-[0_8px_30px_rgba(224,50,75,0.15)]"
                      : "bg-[#0E0608]/90 border border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-[#E0324B] shrink-0">
                        {faq.number}
                      </span>
                      <span className="font-display font-light text-lg sm:text-xl text-[#FAF7F2]">
                        {faq.question}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#E0324B] text-white"
                          : "bg-white/[0.06] text-[#D6CEC5] hover:text-[#FAF7F2]"
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0 border-t border-white/[0.08] text-[#D6CEC5] font-sans text-sm sm:text-base leading-relaxed">
                          <p className="pt-4">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Still have questions prompt */}
        <div className="text-center pt-6 font-mono text-xs text-[#D6CEC5]">
          <span>Have a specific architectural or contractual inquiry? </span>
          <a
            href="/contact"
            className="text-[#E0324B] hover:underline font-medium inline-flex items-center gap-1 ml-1"
          >
            Speak directly with a principal engineer
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
