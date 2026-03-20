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
    <div className="min-h-screen bg-neutral-50">
      {/* ─── Hero Section ─── */}
      <section className="w-full bg-white border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#388186] mb-3 font-ganh uppercase">
            Hướng dẫn sử dụng
          </h1>

          <p className="text-sm sm:text-base text-neutral-500 tracking-widest uppercase mb-10">
            Tất cả hướng dẫn và câu hỏi thường gặp
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
          <div className="max-w-4xl mx-auto px-4 py-14">
            <div className="mb-8 flex items-baseline gap-3">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                Kết quả tìm kiếm
              </h2>
              <p className="text-sm text-neutral-500 tracking-widest uppercase">
                Cho "{searchQuery}" — {searchResults.length} bài viết
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.map((article) => (
                  <Link
                    key={article.id}
                    href={`/hdsd/${article.section_slug}/${article.slug}`}
                    className="block p-6 bg-white border border-neutral-200 rounded-[20px] hover:border-neutral-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                         {sections.find(s => s.id === article.section_slug)?.title || 'Chủ đề'}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-800 group-hover:text-teal-600 transition-colors">
                      {article.title}
                    </h3>
                    {article.summary && (
                      <p className="text-neutral-500 text-sm mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-neutral-200">
                <p className="text-neutral-400 font-medium italic">Không tìm thấy bài viết nào phù hợp.</p>
              </div>
            )}
            
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-8 text-sm font-bold text-teal-600 hover:underline flex items-center gap-1 mx-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
            <div className="max-w-5xl mx-auto px-4 py-14">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Danh mục hướng dẫn
                </h2>
                <p className="text-sm text-neutral-500 tracking-widest uppercase">
                  Chọn chủ đề bạn muốn tìm hiểu
                </p>
              </div>

              <HelpCenterSectionList
                sections={sectionsWithCount}
              />
            </div>
          </section>

          {/* ─── FAQ Section ─── */}
          <section className="w-full bg-neutral-50">
            <div className="max-w-3xl mx-auto px-4 pb-20">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                  Câu hỏi thường gặp
                </h2>
                <p className="text-sm text-neutral-500 tracking-widest uppercase">
                  Các câu hỏi được hỏi nhiều nhất
                </p>
              </div>

              <HelpCenterFAQ items={faqItems} />
            </div>
          </section>
        </>
      )}

      {/* ─── Contact / Still Need Help Section ─── */}
      <section className="w-full bg-white border-t border-neutral-100">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              Vẫn cần hỗ trợ?
            </h2>
            <p className="text-sm text-neutral-500 tracking-widest uppercase">
              Liên hệ với đội ngũ Đồng Ngôn
            </p>
          </div>

          <HelpCenterContact cards={contactCards} />
        </div>
      </section>
    </div>
  );
}
