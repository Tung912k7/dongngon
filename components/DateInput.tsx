"use client";

import React, { useState, useEffect } from "react";

interface DateInputProps {
  value: string; // Expects YYYY-MM-DD
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function DateInput({ value, onChange, disabled, className = "", placeholder = "DD/MM/YYYY" }: DateInputProps) {
  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatForDisplay = (val: string) => {
    if (!val) return "";
    if (val.includes("-")) {
      const parts = val.split("-");
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // only update displayValue if value from outside changes and isn't what we already computed
    const formatted = formatForDisplay(value);
    if (formatted && formatted.length === 10) {
      setDisplayValue(formatted);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-digits
    
    // Auto-insert slashes
    if (input.length >= 3 && input.length <= 4) {
      input = input.substring(0, 2) + "/" + input.substring(2);
    } else if (input.length >= 5) {
      input = input.substring(0, 2) + "/" + input.substring(2, 4) + "/" + input.substring(4, 8);
    }

    setDisplayValue(input);

    // If completely filled (DD/MM/YYYY), send YYYY-MM-DD to parent
    if (input.length === 10) {
      const parts = input.split("/");
      if (parts.length === 3) {
        const dd = parts[0];
        const mm = parts[1];
        const yyyy = parts[2];
        onChange(`${yyyy}-${mm}-${dd}`);
      }
    } else {
      onChange(input); // pass raw text for validation if needed, or update to empty
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      maxLength={10}
    />
  );
}
