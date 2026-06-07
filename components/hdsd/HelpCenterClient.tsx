"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { HelpCenterArticleRecord, HelpCenterSection } from "@/types/helpCenter";
import HelpCenterSearch from "@/components/hdsd/HelpCenterSearch";
import HelpCenterSectionList from "@/components/hdsd/HelpCenterSectionList";
import HelpCenterFAQ, { FAQItem } from "@/components/hdsd/HelpCenterFAQ";
import HelpCenterContact, { ContactCard } from "@/components/hdsd/HelpCenterContact";

interface HelpCenterClientProps {
  sections: HelpCenterSection[];
  articles: HelpCenterArticleRecord[];
  faqItems: FAQItem[];
  contactCards: ContactCard[];
}

export default function HelpCenterClient({
  sections,
  articles,
  faqItems,
  contactCards,
}: HelpCenterClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Compute article count per section dynamically based on database articles
  const sectionsWithCount = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      articleCount: articles.filter((a) => a.section_slug === section.id).length,
    }));
  }, [sections, articles]);

  // Search articles across all sections
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        (a.summary && a.summary.toLowerCase().includes(query)) ||
        a.content_markdown.toLowerCase().includes(query)
    );
  }, [searchQuery, articles]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ─── Hero Section ─── */}
      <section className="w-full py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-ganh font-bold tracking-tight text-deep-teal mb-4 lowercase">
            sổ tay hướng dẫn
          </h1>

          <p className="text-[10px] sm:text-xs text-ink-charcoal/40 tracking-[0.25em] uppercase mb-12 font-bold">
            Kiến thức và giải đáp thắc mắc
          </p>

          <HelpCenterSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
      </section>

      {searchQuery.trim() !== "" ? (
        /* ─── Search Results View ─── */
        <section className="w-full min-h-[400px]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-10 flex flex-col items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-ganh font-bold text-deep-teal lowercase tracking-tight">
                kết quả tìm kiếm
              </h2>
              <p className="text-[10px] md:text-xs text-ink-charcoal/40 tracking-[0.15em] uppercase font-bold">
                Cho &quot;{searchQuery}&quot; — {searchResults.length} bài viết
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    href={`/hdsd/${article.section_slug}/${article.slug}`}
                    className="block p-6 bg-[#fcfaf8] border border-[#eae6e1] rounded-2xl hover:bg-[#faf8f5] hover:border-deep-teal/20 transition-all duration-300 shadow-sm group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-deep-teal/5 text-deep-teal border border-deep-teal/10 px-2.5 py-1 rounded-lg">
                        {sections.find((s) => s.id === article.section_slug)?.title || "Chủ đề"}
                      </span>
                    </div>
                    <h3 className="text-xl font-ganh font-bold text-ink-charcoal group-hover:text-deep-teal transition-all lowercase">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-ink-charcoal/60 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#eae6e1]">
                <p className="text-ink-charcoal/40 font-bold uppercase text-xs tracking-widest">
                  Không tìm thấy bài viết nào phù hợp.
                </p>
              </div>
            )}

            <button
              onClick={() => setSearchQuery("")}
              className="mt-12 text-xs font-bold text-ink-charcoal/60 hover:text-deep-teal uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
              </svg>
              Quay lại danh mục
            </button>
          </div>
        </section>
      ) : (
        <>
          {/* ─── Category Section ─── */}
          <section className="w-full">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <div className="mb-12 flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-ganh font-bold text-deep-teal mb-2 lowercase tracking-tight">
                  danh mục hướng dẫn
                </h2>
                <p className="text-[10px] text-ink-charcoal/40 tracking-[0.2em] uppercase font-bold">
                  Chọn chủ đề bạn muốn tìm hiểu
                </p>
              </div>

              <HelpCenterSectionList sections={sectionsWithCount} />
            </div>
          </section>

          {/* ─── FAQ Section ─── */}
          <section className="w-full">
            <div className="max-w-4xl mx-auto px-4 pb-24">
              <div className="mb-12 flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-ganh font-bold text-deep-teal mb-2 lowercase tracking-tight">
                  câu hỏi thường gặp
                </h2>
                <p className="text-[10px] text-ink-charcoal/40 tracking-[0.2em] uppercase font-bold">
                  Giải đáp thắc mắc phổ biến
                </p>
              </div>

              <HelpCenterFAQ items={faqItems} />
            </div>
          </section>
        </>
      )}

      {/* ─── Contact / Still Need Help Section ─── */}
      <section className="w-full py-24 px-4 border-t border-[#eae6e1] bg-white/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-ganh font-bold text-deep-teal mb-3 lowercase tracking-tight">
              vẫn cần hỗ trợ?
            </h2>
            <p className="text-[10px] text-ink-charcoal/40 tracking-[0.2em] uppercase font-bold">
              Liên hệ với đội ngũ Đồng Ngôn
            </p>
          </div>

          <HelpCenterContact cards={contactCards} />
        </div>
      </section>
    </div>
  );
}
