"use client";

import React, { useState, useEffect, useRef } from "react";

interface DateInputProps {
  value: string; // Expects YYYY-MM-DD
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export default function DateInput({ value, onChange, disabled, className = "", placeholder = "DD/MM/YYYY", name, required }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  useEffect(() => {
    if (value && value.includes("-")) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        // Basic check to ensure we have numbers
        if (y && m && d) {
          setDisplayValue(`${d}/${m}/${y}`);
          return;
        }
      }
    }
    setDisplayValue(value || "");
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Only allow digits and slashes
    input = input.replace(/[^\d/]/g, "");
    
    // Auto-formatting DD/MM/YYYY
    const digits = input.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length >= 3 && digits.length <= 4) {
      formatted = digits.substring(0, 2) + "/" + digits.substring(2);
    } else if (digits.length >= 5) {
      formatted = digits.substring(0, 2) + "/" + digits.substring(2, 4) + "/" + digits.substring(4, 8);
    }

    setDisplayValue(formatted);

    // If completely filled (DD/MM/YYYY), send YYYY-MM-DD to parent
    if (formatted.length === 10) {
      const parts = formatted.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        onChange(`${yyyy}-${mm}-${dd}`);
      }
    } else {
      // Still update parent with raw value to clear it if needed
      onChange(formatted);
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // Native input returns YYYY-MM-DD
    if (val) {
      onChange(val);
    }
  };

  return (
    <div className="relative w-full group">
      {/* 
        Native Date Picker - Fully hidden but functional.
        Using visibility: hidden or display: none often breaks showPicker().
        Using zero dimensions and absolute positioning is safer.
      */}
      <input
        type="date"
        ref={dateInputRef}
        value={value && value.includes("-") ? value : ""}
        onChange={handleNativeChange}
        disabled={disabled}
        className="absolute w-0 h-0 opacity-0 pointer-events-none border-none p-0 overflow-hidden"
        style={{ top: '50%', left: '50%' }}
        tabIndex={-1}
      />
      
      {/* Visible Text Input with DD/MM/YYYY Formatting */}
      <div className="relative flex items-center">
        <input
          type="text"
          name={name}
          value={displayValue}
          onChange={handleTextChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          maxLength={10}
          className={`${className} flex-grow font-be-vietnam relative z-10 bg-transparent`}
        />
        
        {/* Calendar Icon to trigger native picker */}
        {!disabled && (
          <button
            type="button"
            onClick={() => {
              try {
                // Modern browsers supporting showPicker
                if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
                  dateInputRef.current.showPicker();
                } else {
                  // Fallback: focus/click doesn't always open the picker, but it's the best we can do
                  dateInputRef.current?.focus();
                  dateInputRef.current?.click();
                }
              } catch (err) {
                console.error("Failed to open date picker:", err);
              }
            }}
            className="absolute right-4 p-2 text-black hover:opacity-70 transition-opacity z-20"
            title="Chọn từ lịch"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
