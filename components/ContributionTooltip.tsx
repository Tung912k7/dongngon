"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Contribution } from "@/types/database";

interface ContributionTooltipProps {
  contribution: Contribution;
  children: React.ReactNode;
}

export default function ContributionTooltip({
  contribution,
  children,
}: ContributionTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();

  const isSystem = contribution.author_nickname === "Hệ thống";

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isSystem) return;
      e.stopPropagation();

      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setPosition(rect.top < 160 ? "below" : "above");
      }

      setIsOpen((prev) => !prev);
      setCopied(false);
    },
    [isSystem]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contribution.content);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = contribution.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1200);
  }, [contribution.content]);

  const handleViewProfile = useCallback(() => {
    setIsOpen(false);
    router.push(`/profile?id=${contribution.user_id}`);
  }, [router, contribution.user_id]);

  // Close on outside click or ESC
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  if (isSystem) {
    return <span className="text-gray-400 italic">{children}</span>;
  }

  return (
    <span ref={wrapperRef} className="relative inline">
      {/* Clickable text — gold underline on hover */}
      <span
        onClick={handleClick}
        className={`cursor-pointer transition-all duration-200 ease-out
          underline decoration-transparent decoration-2 underline-offset-[5px]
          hover:decoration-[#D4AF37]/50
          ${isOpen ? "decoration-[#D4AF37] bg-[#D4AF37]/8" : ""}
        `}
        title={`Bởi ${contribution.author_nickname}`}
      >
        {children}
      </span>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 left-1/2 -translate-x-1/2 ${
            position === "above" ? "bottom-full mb-3" : "top-full mt-3"
          }`}
          style={{ animation: "contribution-tooltip-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
        >
          {/* Card */}
          <div
            className="bg-white rounded-2xl overflow-hidden min-w-[220px] max-w-[280px]"
            style={{
              border: "2px solid #171717",
              boxShadow: "3px 3px 0px 0px #171717",
            }}
          >
            {/* Author header */}
            <div
              className="px-3.5 py-2 flex items-center gap-2"
              style={{ backgroundColor: "#171717" }}
            >
              {/* Gold avatar circle */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(212, 175, 55, 0.15)", border: "1.5px solid rgba(212, 175, 55, 0.4)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4AF37" className="w-3 h-3">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-white truncate max-w-[180px]">
                {contribution.author_nickname}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: "2px", backgroundColor: "#171717" }} />

            {/* Action buttons row */}
            <div className="flex">
              {/* Copy */}
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#16a34a" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: "#16a34a" }}>Đã chép!</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    <span>Chép</span>
                  </>
                )}
              </button>

              {/* Vertical divider */}
              <div style={{ width: "2px", backgroundColor: "#171717" }} />

              {/* Profile */}
              <button
                onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                <span>Hồ sơ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
