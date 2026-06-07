"use client";

import React from "react";

export const Checkbox = ({
  label,
  checked,
  onChange,
  name,
  error,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
}) => (
  <div className="flex items-center gap-3.5 mb-4 group cursor-pointer">
    <div className="relative flex items-center">
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={`peer h-4.5 w-4.5 cursor-pointer appearance-none rounded-md border ${error ? "border-red-500 bg-red-50/10" : "border-mist-grey hover:border-ink-charcoal/30"} checked:bg-[#134E4A] checked:border-[#134E4A] focus-visible:ring-1 focus-visible:ring-[#134E4A] focus-visible:outline-none transition-all`}
      />
      <svg
        className="absolute h-3 w-3 pointer-events-none hidden peer-checked:block text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <div className="text-ink-charcoal/80 select-none">
      <label
        htmlFor={name}
        className="cursor-pointer font-semibold uppercase tracking-wide text-[10.5px] font-sans"
      >
        {label}
      </label>
      {error && (
        <p className="text-red-600 text-[10px] font-semibold mt-1 uppercase tracking-wide font-sans">
          {error}
        </p>
      )}
    </div>
  </div>
);
