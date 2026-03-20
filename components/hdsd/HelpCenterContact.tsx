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
          className="flex flex-col items-center text-center p-8 rounded-2xl border border-neutral-200 bg-white"
        >
          {/* Icon in circle */}
          <div className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 mb-4">
            {card.icon}
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-neutral-900 mb-1">
            {card.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-neutral-500 mb-5">
            {card.description}
          </p>

          {/* CTA button */}
          <a
            href={card.ctaHref || '#'}
            target={card.ctaHref?.startsWith('http') ? "_blank" : undefined}
            rel={card.ctaHref?.startsWith('http') ? "noopener noreferrer" : undefined}
            className="inline-block px-5 py-2.5 rounded-full border-2 border-neutral-800 text-neutral-900 text-sm font-semibold hover:bg-neutral-800 hover:text-white transition-colors duration-200"
          >
            {card.ctaLabel}
          </a>
        </div>
      ))}
    </div>
  );
};

export default HelpCenterContact;
