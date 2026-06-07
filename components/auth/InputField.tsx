"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
const DateInput = dynamic(() => import("@/components/DateInput"), { ssr: false });

export const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  name,
  maxLength,
  error,
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  name: string;
  maxLength?: number;
  error?: string;
  autoComplete?: string;
  required?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-5 group">
      <label className="block text-[11px] font-semibold text-ink-charcoal/60 uppercase tracking-wider mb-1.5 font-sans">
        {label}
      </label>
      <div className="relative">
        {type === "date" ? (
          <DateInput
            value={value}
            onChange={(val) => {
              // Creating a synthetic event-like object to trigger the parent's generic handleChange
              onChange({ target: { name, value: val } } as React.ChangeEvent<HTMLInputElement>);
            }}
            className={`w-full px-5 py-3 border ${error ? "border-red-500 bg-red-50/10" : "border-mist-grey focus:border-deep-teal focus:ring-1 focus:ring-deep-teal"} bg-[#fcfaf8] text-ink-charcoal text-base focus:outline-none focus:bg-[#fcfaf8] transition-all rounded-xl`}
          />
        ) : (
          <input
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            autoComplete={autoComplete}
            required={required}
            className={`w-full px-5 py-3 border ${error ? "border-red-500 bg-red-50/10" : "border-mist-grey focus:border-deep-teal focus:ring-1 focus:ring-deep-teal"} bg-[#fcfaf8] text-ink-charcoal text-base focus:outline-none focus:bg-[#fcfaf8] transition-all rounded-xl ${isPassword ? "pr-12" : ""}`}
          />
        )}
        {error && (
          <p className="text-red-600 text-xs font-semibold mt-1.5 uppercase tracking-wide font-sans">
            {error}
          </p>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-charcoal/50 hover:text-ink-charcoal transition-colors p-1"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
