// components/hdsd/HelpCenterSectionCard.tsx
// Card UI for a single Help Center section.
// Design: rounded card with border, icon top-left, title bold,
// description below, article count at bottom — matching reference screenshot.

"use client";

import React from "react";
import Link from "next/link";
import { HelpCenterSection } from "@/types/helpCenter";
import HelpCenterIconMap from "./HelpCenterIconMap";

interface HelpCenterSectionCardProps {
  section: HelpCenterSection & { articleCount?: number };
  onClick?: () => void;
}

const HelpCenterSectionCard: React.FC<HelpCenterSectionCardProps> = ({ section, onClick }) => {
  return (
    <Link
      href={`/hdsd/${section.id}`}
      id={`help-section-${section.id}`}
      onClick={onClick}
      className="group flex flex-col items-start p-6 rounded-2xl border border-[#eae6e1] bg-[#fcfaf8] w-full min-h-[215px] text-left cursor-pointer transition-all duration-300 ease-out hover:bg-[#faf8f5] hover:border-deep-teal/20 focus:outline-none focus:ring-1 focus:ring-deep-teal shadow-sm"
      aria-label={`Xem chủ đề ${section.title}`}
    >
      {/* Icon */}
      <div className="mb-5 text-deep-teal">
        <HelpCenterIconMap icon={section.icon} size={36} />
      </div>

      {/* Title */}
      <h3 className="font-ganh font-bold text-lg md:text-xl text-ink-charcoal mb-1.5 leading-snug lowercase tracking-tight group-hover:text-deep-teal transition-colors">
        {section.title}
      </h3>

      {/* Description */}
      {section.description && (
        <p className="text-ink-charcoal/60 text-sm leading-relaxed mb-4">{section.description}</p>
      )}

      {/* Article count */}
      {typeof section.articleCount === "number" && (
        <span className="mt-auto text-[10px] font-bold text-ink-charcoal/30 uppercase tracking-wider font-mono">
          {section.articleCount} bài viết
        </span>
      )}
    </Link>
  );
};

export default HelpCenterSectionCard;
