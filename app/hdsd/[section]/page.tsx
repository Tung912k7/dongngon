// app/hdsd/[section]/page.tsx
// Section listing page — shows articles in a given Help Center section.
// Now dynamically fetching from help_center_articles table.

import React from 'react';
import Link from 'next/link';
import { HELP_CENTER_SECTIONS } from '@/data/helpCenter';
import { getPublishedHDSDArticles } from '@/actions/hdsd';
import HelpCenterBreadcrumb from '@/components/hdsd/HelpCenterBreadcrumb';
import HelpCenterIconMap from '@/components/hdsd/HelpCenterIconMap';
import type { HelpCenterArticleRecord } from '@/types/helpCenter';

interface HelpCenterSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export default async function HelpCenterSectionPage({ params }: HelpCenterSectionPageProps) {
  const { section: sectionId } = await params;

  // Find the section from static metadata (icons, titles)
  const section = HELP_CENTER_SECTIONS.find((s) => s.id === sectionId);
  
  // Fetch only published articles belonging to this section from database
  const result = await getPublishedHDSDArticles();
  const allArticles = result.success ? result.data || [] : [];
  const articles = allArticles.filter((a: HelpCenterArticleRecord) => a.section_slug === sectionId);

  if (!section) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 font-medium">Không tìm thấy danh mục này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="w-full bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <HelpCenterBreadcrumb
            items={[
              { label: 'Hướng dẫn sử dụng', href: '/hdsd', className: 'text-[#388186] font-bold underline decoration-dotted underline-offset-4' },
              { label: section.title },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <HelpCenterIconMap icon={section.icon ?? 'question'} size={40} className="text-neutral-800" />
          <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">{section.title}</h1>
        </div>
        <p className="text-neutral-500 text-lg ml-[56px] leading-relaxed max-w-2xl">{section.description}</p>
        <p className="text-sm font-semibold text-neutral-400 mt-2 ml-[56px] uppercase tracking-wider">{articles.length} bài viết</p>
      </div>

      {/* Article list */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/hdsd/${sectionId}/${article.slug}`}
                className="block p-7 bg-white border border-neutral-200 rounded-[24px] hover:border-neutral-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-neutral-800 group-hover:text-teal-600 mb-2 transition-colors duration-200">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-neutral-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center text-xs font-bold text-teal-600 uppercase tracking-widest group-hover:gap-2 transition-all">
                    Đọc thêm
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-neutral-200">
            <p className="text-neutral-400">Chưa có bài viết nào trong danh mục này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
