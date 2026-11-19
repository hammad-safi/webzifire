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
    <section className="w-full py-20 lg:py-28 bg-[#0B0607] border-y border-[#2C181B] relative overflow-hidden" id="faq">
      {/* Ambient Crimson Light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[850px] max-w-[95vw] h-[520px] bg-[radial-gradient(ellipse_at_top_right,rgba(214,51,74,0.20),transparent_65%)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#2C181B]"
        >
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#140A0C] border border-[#2C181B] w-fit">
              <span className="text-[#D6334A] text-[10px]">✦</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#8A8175] font-semibold">
                Transparent Delivery Standards
              </span>
            </div>
            <h2 className="font-display font-light text-3xl sm:text-5xl lg:text-[3.25rem] text-[#F5EFE6] tracking-tight leading-[1.12]">
              Essential answers,<br />
              <span className="display-italic font-normal text-[#C4B5A5]">
                before the initial briefing.
              </span>
            </h2>
          </div>

          {/* Quick FAQ Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#8A8175] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword (e.g. SLA, scope)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#140A0C] border border-[#2C181B] text-xs font-mono text-[#F5EFE6] placeholder:text-[#8A8175] focus:outline-none focus:border-[#D6334A] focus:ring-1 focus:ring-[#D6334A]/40"
            />
          </div>
        </motion.div>

        {/* Accordion List with Motion */}
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-[#8A8175] font-mono text-xs">
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
                      ? "bg-[#1B0E10] border-[#D6334A]/60 shadow-[0_8px_30px_rgba(214,51,74,0.12)]"
                      : "bg-[#140A0C] border border-[#2C181B] hover:border-[#423330]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-[#D6334A] shrink-0">
                        {faq.number}
                      </span>
                      <span className="font-display font-light text-lg sm:text-xl text-[#F5EFE6]">
                        {faq.question}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#D6334A] text-white"
                          : "bg-[#140A0C] text-[#8A8175] hover:text-[#F5EFE6]"
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
                        <div className="px-6 pb-6 pt-0 border-t border-[#2C181B]/60 text-[#C4B5A5] font-sans text-sm sm:text-base leading-relaxed">
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
        <div className="text-center pt-6 font-mono text-xs text-[#8A8175]">
          <span>Have a specific architectural or contractual inquiry? </span>
          <a
            href="/contact"
            className="text-[#D6334A] hover:underline font-medium inline-flex items-center gap-1 ml-1"
          >
            Speak directly with a principal engineer
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
