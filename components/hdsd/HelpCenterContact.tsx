// components/hdsd/HelpCenterContact.tsx
// "Vẫn cần trợ giúp?" section with contact/action cards.
// Each card: circle icon, title, description, CTA button with rounded border.

import React from 'react';

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
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 w-full`}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center text-center p-10 rounded border-2 border-black bg-white"
        >
          {/* Icon in circle */}
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center text-black mb-6">
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="font-ganh font-bold text-xl md:text-2xl text-black mb-2 uppercase tracking-tight">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-sm font-medium text-black/50 mb-8 max-w-[240px] leading-relaxed">
            {card.description}
          </p>

          {/* CTA button */}
          <a
            href={card.ctaHref || '#'}
            target={card.ctaHref?.startsWith('http') ? "_blank" : undefined}
            rel={card.ctaHref?.startsWith('http') ? "noopener noreferrer" : undefined}
            className="
              inline-block px-8 py-3 
              rounded border-2 border-black 
              bg-white text-black text-sm font-ganh font-bold uppercase tracking-widest
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
              hover:-translate-x-1 hover:-translate-y-1 
              hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
              active:translate-x-0 active:translate-y-0
              transition-all duration-200
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

