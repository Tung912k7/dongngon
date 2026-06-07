// components/hdsd/HelpCenterArticleSidebar.tsx
// Right sidebar for article page: Table of Contents + Related Articles.

"use client";

import React from "react";
import Link from "next/link";
import HelpCenterIconMap from "./HelpCenterIconMap";

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
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="w-full space-y-6">
      {/* Table of Contents */}
      <div className="border border-[#eae6e1] rounded-2xl bg-[#fcfaf8] p-8 shadow-sm">
        <h3 className="text-[10px] font-bold text-ink-charcoal/30 tracking-[0.2em] uppercase mb-6 font-mono">
          Nội dung
        </h3>
        <ul className="space-y-4">
          {toc.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleScrollTo(item.id)}
                className="text-sm font-medium text-ink-charcoal/60 hover:text-deep-teal transition-all text-left leading-relaxed cursor-pointer focus:outline-none"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div className="border border-[#eae6e1] rounded-2xl bg-[#fcfaf8] p-8 shadow-sm">
          <h3 className="text-[10px] font-bold text-ink-charcoal/30 tracking-[0.2em] uppercase mb-6 font-mono">
            Bài viết liên quan
          </h3>
          <div className="space-y-4">
            {relatedArticles.map((article, idx) => (
              <Link
                key={idx}
                href={article.href}
                className="flex items-start gap-4 p-5 rounded-xl border border-[#eae6e1] bg-white hover:border-deep-teal/20 hover:bg-[#faf8f5] transition-all duration-300 shadow-sm group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#faf8f5] flex items-center justify-center text-deep-teal mt-0.5 border border-[#eae6e1] flex-shrink-0 shadow-sm transition-colors group-hover:bg-white group-hover:border-deep-teal/20">
                  <HelpCenterIconMap icon={article.sectionIcon} size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-charcoal group-hover:text-deep-teal transition-colors leading-snug mb-1 font-ganh lowercase">
                    {article.title}
                  </p>
                  <p className="text-[10px] font-bold text-ink-charcoal/30 uppercase tracking-wider font-mono">
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
