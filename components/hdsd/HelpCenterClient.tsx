'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { HelpCenterSection, HelpCenterArticleRecord } from '@/types/helpCenter';
import HelpCenterSearch from '@/components/hdsd/HelpCenterSearch';
import HelpCenterSectionList from '@/components/hdsd/HelpCenterSectionList';
import HelpCenterFAQ, { FAQItem } from '@/components/hdsd/HelpCenterFAQ';
import HelpCenterContact, { ContactCard } from '@/components/hdsd/HelpCenterContact';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Compute article count per section dynamically based on database articles
  const sectionsWithCount = useMemo(() => {
    return sections.map((section) => ({
      ...section,
      articleCount: articles.filter(
        (a) => a.section_slug === section.id
      ).length,
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
    <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e3e3e3_1px,transparent_1px)] [background-size:20px_20px]">
      {/* ─── Hero Section ─── */}
      <section className="w-full py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-ganh font-bold tracking-tight text-black mb-4 uppercase">
            Sổ tay hướng dẫn
          </h1>

          <p className="text-xs sm:text-sm text-black/40 tracking-[0.4em] uppercase mb-12 font-bold">
            Kiến thức và giải đáp thắc mắc
          </p>

          <HelpCenterSearch
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </section>

      {searchQuery.trim() !== '' ? (
        /* ─── Search Results View ─── */
        <section className="w-full min-h-[400px]">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-10 flex flex-col items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-ganh font-bold text-black uppercase tracking-tight">
                Kết quả tìm kiếm
              </h2>
              <p className="text-[10px] md:text-xs text-black/40 tracking-[0.2em] uppercase font-bold">
                Cho "{searchQuery}" — {searchResults.length} bài viết
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    href={`/hdsd/${article.section_slug}/${article.slug}`}
                    className="block p-6 bg-white border-2 border-black rounded hover:bg-neutral-50 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-sm">
                         {sections.find(s => s.id === article.section_slug)?.title || 'Chủ đề'}
                       </span>
                    </div>
                    <h3 className="text-xl font-ganh font-bold text-black group-hover:underline transition-all uppercase">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-neutral-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded border-2 border-black border-dashed">
                <p className="text-neutral-400 font-bold italic uppercase text-sm tracking-widest">Không tìm thấy bài viết nào phù hợp.</p>
              </div>
            )}
            
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-12 text-xs font-black text-black/60 hover:text-black uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
                <h2 className="text-2xl md:text-3xl font-ganh font-bold text-black mb-2 uppercase tracking-tight">
                  Danh mục hướng dẫn
                </h2>
                <div className="w-12 h-1 bg-black mb-4" />
                <p className="text-[10px] text-black/40 tracking-[0.3em] uppercase font-bold">
                  Chọn chủ đề bạn muốn tìm hiểu
                </p>
              </div>

              <HelpCenterSectionList
                sections={sectionsWithCount}
              />
            </div>
          </section>

          {/* ─── FAQ Section ─── */}
          <section className="w-full">
            <div className="max-w-4xl mx-auto px-4 pb-24">
              <div className="mb-12 flex flex-col items-center text-center">
                <h2 className="text-2xl md:text-3xl font-ganh font-bold text-black mb-2 uppercase tracking-tight">
                  Câu hỏi thường gặp
                </h2>
                <div className="w-12 h-1 bg-black mb-4" />
                <p className="text-[10px] text-black/40 tracking-[0.3em] uppercase font-bold">
                  Giải đáp thắc mắc phổ biến
                </p>
              </div>

              <HelpCenterFAQ items={faqItems} />
            </div>
          </section>
        </>
      )}

      {/* ─── Contact / Still Need Help Section ─── */}
      <section className="w-full py-24 px-4 border-t-2 border-black bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
             <h2 className="text-3xl md:text-4xl font-ganh font-bold text-black mb-3 uppercase tracking-tight">
               Vẫn cần hỗ trợ?
             </h2>
             <p className="text-[10px] text-black/40 tracking-[0.4em] uppercase font-bold">
               Liên hệ với đội ngũ Đồng Ngôn
             </p>
          </div>

          <HelpCenterContact cards={contactCards} />
        </div>
      </section>
    </div>
  );
}

