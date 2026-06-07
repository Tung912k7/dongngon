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
        px-8 py-3 
        min-h-[44px]
        border border-ink-charcoal/[0.12]
        bg-ink-charcoal text-white
        rounded-md
        font-sans font-medium text-[14px] tracking-wide
        transition-[transform,background-color,border-color,box-shadow]
        duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]
        hover:bg-deep-teal hover:border-deep-teal/30
        active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100
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
        min-h-[44px]
        border
        ${
          inverse
            ? "bg-white text-ink-charcoal border-ink-charcoal/[0.10] hover:bg-ink-charcoal/[0.03] hover:border-ink-charcoal/20"
            : "bg-ink-charcoal text-white border-ink-charcoal/[0.12] hover:bg-deep-teal hover:border-deep-teal/30"
        } 
        rounded-md
        font-sans font-medium text-[14px] tracking-wide
        transition-[transform,background-color,border-color,color]
        duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)]
        active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-charcoal focus-visible:ring-offset-2
        flex items-center justify-center gap-2 whitespace-nowrap
        ${className}
      `}
    >
      {children}
    </Link>
  );
};
