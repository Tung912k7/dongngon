"use client";

import { useState } from "react";

import Link from "next/link";

export const PrimaryButton = ({ 
  children, 
  onClick, 
  type = "button", 
  disabled = false, 
  className = "" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  type?: "button" | "submit" | "reset"; 
  disabled?: boolean;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`px-10 py-2.5 border-[3px] border-black text-2xl rounded-xl transition-all font-bold disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center gap-2 ${className}`}
      style={{
        backgroundColor: (isHovered && !disabled) ? "black" : (disabled ? "#f3f4f6" : "white"),
        color: (isHovered && !disabled) ? "white" : (disabled ? "#9ca3af" : "black"),
      }}
    >
      {children}
    </button>
  );
};

export const LinkedButton = ({ 
  children, 
  href,
  className = "" 
}: { 
  children: React.ReactNode; 
  href: string;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`px-6 py-2 border-[3px] border-black text-center transition-all font-bold flex items-center justify-center gap-2 ${className}`}
      style={{
        backgroundColor: isHovered ? "black" : "white",
        color: isHovered ? "white" : "black",
      }}
    >
      {children}
    </Link>
  );
};
