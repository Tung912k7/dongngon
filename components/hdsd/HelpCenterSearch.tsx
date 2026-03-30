// components/hdsd/HelpCenterSearch.tsx
// Search bar for Help Center — rounded pill shape, icon right, centered layout.

'use client';

import React from 'react';

interface HelpCenterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const HelpCenterSearch: React.FC<HelpCenterSearchProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id="help-center-search"
        className="
          w-full px-6 py-3.5 pl-12 pr-6
          rounded-full
          border border-neutral-300
          bg-white text-neutral-800
          text-base
          placeholder:text-neutral-400
          focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-400
          transition-all duration-200
        "
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Tìm kiếm câu hỏi...'}
        aria-label="Tìm kiếm trong Hướng dẫn sử dụng"
      />
    </div>
  );
};

export default HelpCenterSearch;
