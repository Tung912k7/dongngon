"use client";

import Link from "next/link";

export const PrimaryButton = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) => {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-10 py-3 
        border-2 border-black 
        bg-white text-black 
        rounded-[4px] 
        font-ganh font-bold text-xl uppercase tracking-widest
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        transition-all duration-200
        hover:-translate-x-1 hover:-translate-y-1 
        hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        active:translate-x-0 active:translate-y-0 
        active:shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:translate-0
        inline-flex items-center justify-center gap-2 whitespace-nowrap
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export const LinkedButton = ({
  children,
  href,
  className = "",
  inverse = false,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  inverse?: boolean;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) => {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`
        px-8 py-3 
        border-2 border-black 
        ${inverse ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-gray-50"} 
        rounded-[4px] 
        font-ganh font-bold text-lg uppercase tracking-widest
        ${inverse ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}
        transition-all duration-200
        hover:-translate-x-1 hover:-translate-y-1 
        ${inverse ? "hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]" : "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"}
        active:translate-x-0 active:translate-y-0 
        active:shadow-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
        flex items-center justify-center gap-2 whitespace-nowrap
        ${className}
      `}
    >
      {children}
    </Link>
  );
};
