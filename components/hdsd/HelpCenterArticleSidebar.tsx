// components/hdsd/HelpCenterArticleSidebar.tsx
// Right sidebar for article page: Table of Contents + Related Articles.

'use client';

import React from 'react';
import Link from 'next/link';
import HelpCenterIconMap from './HelpCenterIconMap';

export interface TOCItem {
  id: string;
  label: string;
}

export interface RelatedArticle {
  title: string;
  href: string;
  sectionIcon?: string;
  sectionLabel: string;
  readingTime: string;
}

interface HelpCenterArticleSidebarProps {
  toc: TOCItem[];
  relatedArticles?: RelatedArticle[];
}

const HelpCenterArticleSidebar: React.FC<HelpCenterArticleSidebarProps> = ({
  toc,
  relatedArticles,
}) => {
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="w-full space-y-6">
      {/* Table of Contents */}
      <div className="border border-neutral-100 rounded-[28px] bg-white p-8">
        <h3 className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase mb-6">
          Nội dung
        </h3>
        <ul className="space-y-4">
          {toc.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleScrollTo(item.id)}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors text-left leading-relaxed cursor-pointer"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="border border-neutral-100 rounded-[28px] bg-white p-8">
          <h3 className="text-[10px] font-bold text-neutral-400 tracking-[0.2em] uppercase mb-6">
            Bài viết liên quan
          </h3>
          <div className="space-y-4">
            {relatedArticles.map((article, idx) => (
              <Link
                key={idx}
                href={article.href}
                className="flex items-start gap-4 p-5 rounded-[20px] border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all group bg-white"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 mt-0.5 border border-neutral-100 flex-shrink-0">
                  <HelpCenterIconMap icon={article.sectionIcon} size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-[#388186] transition-colors leading-snug mb-1">
                    {article.title}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {article.sectionLabel} • {article.readingTime}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default HelpCenterArticleSidebar;

