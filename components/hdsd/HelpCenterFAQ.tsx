// components/hdsd/HelpCenterFAQ.tsx
// Accordion-style FAQ section for Help Center page.
// Each item expands/collapses on click with a chevron indicator.

'use client';

import React, { useState } from 'react';

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
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border-2 border-black rounded bg-white overflow-hidden"
          >
            <button
              id={`faq-item-${idx}`}
              type="button"
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer group hover:bg-neutral-50 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
            >
              <span className="text-lg md:text-xl font-ganh font-bold text-neutral-900 leading-tight pr-4 uppercase tracking-tight">
                {item.question}
              </span>
              {/* Chevron */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`flex-shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path d="M5 7.5l5 5 5-5" />
              </svg>
            </button>

            {/* Answer panel */}
            {isOpen && (
              <div
                id={`faq-answer-${idx}`}
                className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed"
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

