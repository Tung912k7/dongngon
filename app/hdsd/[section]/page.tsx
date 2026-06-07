// app/hdsd/[section]/page.tsx
// Section listing page — shows articles in a given Help Center section.
// Now dynamically fetching from help_center_articles table.

import React from "react";
import Link from "next/link";
import { HELP_CENTER_SECTIONS } from "@/data/helpCenter";
import { getPublishedHDSDArticles } from "@/actions/hdsd";
import HelpCenterBreadcrumb from "@/components/hdsd/HelpCenterBreadcrumb";
import HelpCenterIconMap from "@/components/hdsd/HelpCenterIconMap";
import type { HelpCenterArticleRecord } from "@/types/helpCenter";
import { Metadata } from "next";

interface HelpCenterSectionPageProps {
  params: Promise<{
    section: string;
  }>;
}

export async function generateMetadata({ params }: HelpCenterSectionPageProps): Promise<Metadata> {
  const { section: sectionId } = await params;
  const section = HELP_CENTER_SECTIONS.find((s) => s.id === sectionId);

  if (!section) return { title: "Không tìm thấy danh mục" };

  return {
    title: `${section.title} | Hướng dẫn sử dụng`,
    description: section.description,
    openGraph: {
      title: `${section.title} | Hướng dẫn sử dụng Đồng ngôn`,
      description: section.description,
    },
    alternates: {
      canonical: `/hdsd/${sectionId}`,
    },
  };
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-ink-charcoal/50 font-medium">Không tìm thấy danh mục này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Breadcrumb */}
      <div className="w-full bg-white/60 backdrop-blur-sm border-b border-[#eae6e1]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <HelpCenterBreadcrumb
            items={[
              {
                label: "Hướng dẫn sử dụng",
                href: "/hdsd",
                className:
                  "text-deep-teal font-bold underline decoration-dotted underline-offset-4",
              },
              { label: section.title },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-3">
          <HelpCenterIconMap
            icon={section.icon ?? "question"}
            size={36}
            className="text-deep-teal"
          />
          <h1 className="text-3xl md:text-4xl font-ganh font-bold text-deep-teal tracking-tight lowercase">
            {section.title}
          </h1>
        </div>
        <p className="text-ink-charcoal/60 text-base ml-0 md:ml-[52px] leading-relaxed max-w-2xl">
          {section.description}
        </p>
        <p className="text-[10px] font-bold text-ink-charcoal/30 mt-2 ml-0 md:ml-[52px] uppercase tracking-wider font-mono">
          {articles.length} bài viết
        </p>
      </div>

      {/* Article list */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/hdsd/${sectionId}/${article.slug}`}
                className="block p-7 bg-[#fcfaf8] border border-[#eae6e1] rounded-2xl hover:bg-[#faf8f5] hover:border-deep-teal/20 transition-all duration-300 shadow-sm group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <h3 className="text-lg md:text-xl font-ganh font-bold text-ink-charcoal group-hover:text-deep-teal mb-2 transition-colors duration-200 lowercase">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-ink-charcoal/60 text-sm line-clamp-2 leading-relaxed mb-4 max-w-[75ch]">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center text-xs font-bold text-deep-teal uppercase tracking-wider group-hover:gap-2 transition-all">
                    Đọc thêm
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#eae6e1]">
            <p className="text-ink-charcoal/40 font-bold uppercase text-xs tracking-widest">
              Chưa có bài viết nào trong danh mục này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
