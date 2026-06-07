// components/hdsd/HelpCenterFAQ.tsx
// Accordion-style FAQ section for Help Center page.
// Each item expands/collapses on click with a chevron indicator.

"use client";

import React, { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCenterFAQProps {
  items: FAQItem[];
}

const HelpCenterFAQ: React.FC<HelpCenterFAQProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col border-t border-[#eae6e1]">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border-b border-[#eae6e1] bg-transparent overflow-hidden">
            <button
              id={`faq-item-${idx}`}
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between py-6 text-left cursor-pointer group transition-colors focus:outline-none"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
            >
              <span className="text-base md:text-lg font-be-vietnam font-semibold text-ink-charcoal group-hover:text-deep-teal transition-colors leading-snug pr-8">
                {item.question}
              </span>
              {/* Plus/Minus Toggle */}
              <span className="text-xl font-mono text-ink-charcoal/40 group-hover:text-deep-teal transition-colors shrink-0 select-none w-4 text-center">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {/* Answer panel */}
            {isOpen && (
              <div
                id={`faq-answer-${idx}`}
                className="pb-6 text-sm text-ink-charcoal/60 leading-relaxed max-w-[75ch]"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HelpCenterFAQ;
