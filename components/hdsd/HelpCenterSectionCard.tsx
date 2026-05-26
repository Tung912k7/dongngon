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
      className="group flex flex-col items-start p-6 rounded border-2 border-black bg-white w-full min-h-[200px] text-left cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 focus:outline-none focus:bg-neutral-50"
      aria-label={`Xem chủ đề ${section.title}`}
    >
      {/* Icon */}
      <div className="mb-5 text-neutral-700">
        <HelpCenterIconMap icon={section.icon} size={36} />
      </div>

      {/* Title */}
      <h3 className="font-ganh font-bold text-lg md:text-xl text-neutral-900 mb-1.5 leading-snug uppercase tracking-tight">
        {section.title}
      </h3>

      {/* Description */}
      {section.description && (
        <p className="text-neutral-500 text-sm leading-relaxed mb-4">{section.description}</p>
      )}

      {/* Article count */}
      {typeof section.articleCount === "number" && (
        <span className="mt-auto text-sm text-neutral-400">{section.articleCount} bài viết</span>
      )}
    </Link>
  );
};

export default HelpCenterSectionCard;
