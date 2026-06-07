// components/hdsd/HelpCenterContact.tsx
// "Vẫn cần trợ giúp?" section with contact/action cards.
// Each card: circle icon, title, description, CTA button with rounded border.

import React from "react";

export interface ContactCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
}

interface HelpCenterContactProps {
  cards: ContactCard[];
}

const HelpCenterContact: React.FC<HelpCenterContactProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center text-center p-10 rounded-2xl border border-[#eae6e1] bg-[#fcfaf8] hover:border-deep-teal/20 transition-all duration-300 shadow-sm"
        >
          {/* Icon in squircle */}
          <div className="w-14 h-14 rounded-xl border border-[#eae6e1] flex items-center justify-center text-deep-teal mb-6 bg-white shadow-sm">
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="font-ganh font-bold text-xl md:text-2xl text-ink-charcoal mb-2 lowercase tracking-tight">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-sm font-medium text-ink-charcoal/50 mb-8 max-w-[260px] leading-relaxed">
            {card.description}
          </p>

          {/* CTA button */}
          <a
            href={card.ctaHref || "#"}
            target={card.ctaHref?.startsWith("http") ? "_blank" : undefined}
            rel={card.ctaHref?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="
              inline-flex items-center justify-center px-8 py-3 
              rounded-full border border-[#eae6e1] bg-white text-ink-charcoal text-xs font-bold uppercase tracking-wider
              transition-all duration-300 hover:bg-[#faf8f5] hover:border-deep-teal/20 hover:text-deep-teal active:scale-[0.98] shadow-sm cursor-pointer
            "
          >
            {card.ctaLabel}
          </a>
        </div>
      ))}
    </div>
  );
};

export default HelpCenterContact;
