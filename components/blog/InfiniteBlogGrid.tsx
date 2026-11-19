"use client";

import React, { useState, useEffect, useRef } from "react";
import { UnifiedJournalArticle } from "@/lib/automation/types";
import { Clock, ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InfiniteBlogGridProps {
  articles: UnifiedJournalArticle[];
  batchSize?: number;
}

export default function InfiniteBlogGrid({
  articles,
  batchSize = 4,
}: InfiniteBlogGridProps) {
  // Start with an initial batch of articles
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          setIsLoadingMore(true);
          // Smooth micro-delay so the user perceives the progressive reveal
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + batchSize, articles.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      {
        rootMargin: "250px", // Pre-fetch slightly before hitting the bottom
        threshold: 0.1,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, batchSize, articles.length]);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {visibleArticles.map((art, index) => (
            <motion.a
              key={art.id || art.slug}
              href={`/blog/${art.slug}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: (index % batchSize) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-[#140A0C] rounded-2xl border border-[#2C181B] overflow-hidden hover:border-[#D6334A]/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer"
            >
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#0B0607] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={art.image}
                    alt={art.imageAlt || art.title}
                    loading={index < 2 ? "eager" : "lazy"}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.2,0.75,0.2,1)] opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140A0C] via-transparent to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-wider text-[#D6334A] px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 font-semibold">
                    {art.category}
                  </span>
                </div>

                <div className="p-7 flex flex-col gap-3">
                  <div className="flex items-center justify-between font-mono text-xs text-[#8A8175]">
                    <span>{art.date}</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D6334A]" />
                      {art.readTime}
                    </span>
                  </div>

                  <h2 className="font-display font-light text-2xl text-[#F5EFE6] group-hover:text-white transition-colors leading-snug">
                    {art.title}
                  </h2>

                  <p className="font-sans text-xs sm:text-sm text-[#C4B5A5]/80 leading-relaxed line-clamp-2">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="p-7 pt-4 flex items-center justify-between border-t border-[#2C181B] font-mono text-xs text-[#8A8175]">
                <span>By {art.author}</span>
                <span className="text-[#F5EFE6] group-hover:text-[#D6334A] flex items-center gap-1 transition-colors">
                  <span>Read article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll Trigger Sentinel & Loading Feedback */}
      {hasMore && (
        <div ref={sentinelRef} className="py-8 flex justify-center items-center">
          {isLoadingMore ? (
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#140A0C] border border-[#D6334A]/40 text-[#F5EFE6] font-mono text-xs shadow-lg animate-pulse">
              <Loader2 className="w-3.5 h-3.5 text-[#D6334A] animate-spin" />
              <span>Loading more articles...</span>
            </div>
          ) : (
            <div className="h-6 w-full opacity-0" />
          )}
        </div>
      )}

      {/* End of Stream Indicator */}
      {!hasMore && articles.length > 0 && (
        <div className="pt-6 pb-2 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#140A0C] border border-[#2C181B] text-[#8A8175] font-mono text-xs">
            <Sparkles className="w-3 h-3 text-[#D6334A]" />
            <span>You have viewed all {articles.length} articles · New guides published 3x weekly</span>
          </div>
        </div>
      )}
    </div>
  );
}
