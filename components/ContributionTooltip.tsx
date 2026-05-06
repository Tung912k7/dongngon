"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Contribution } from "@/types/database";
import { reportContribution } from "@/actions/notification";

const REPORT_REASONS = [
  "Spam, quảng cáo rác",
  "Nội dung phản cảm, độc hại",
  "Đả kích, gây hấn cá nhân",
  "Nội dung sai sự thật",
  "Lý do vi phạm khác"
];

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
  const [reported, setReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const [view, setView] = useState<"main" | "report" | "custom_reason">("main");
  const [customReason, setCustomReason] = useState("");
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

        const tooltipWidth = 240; // max width estimate
        const screenWidth = window.innerWidth;
        const center = rect.left + rect.width / 2;

        if (center - tooltipWidth / 2 < 16) {
          setAlign("left");
        } else if (center + tooltipWidth / 2 > screenWidth - 16) {
          setAlign("right");
        } else {
          setAlign("center");
        }
      }

      setIsOpen((prev) => !prev);
      setCopied(false);
      setReported(false);
      setView("main");
      setCustomReason("");
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

  const handleReport = useCallback(async (reason: string) => {
    if (isReporting || reported) return;
    setIsReporting(true);
    try {
      const res = await reportContribution(
        contribution.id,
        contribution.content,
        contribution.author_nickname,
        contribution.work_id,
        reason
      );
      if (res.success) {
        setReported(true);
        setTimeout(() => {
          setReported(false);
          setIsOpen(false);
          setView("main");
          setCustomReason("");
        }, 1200);
      } else {
        alert("Lỗi: " + res.error);
      }
    } catch {
      alert("Đã xảy ra sự cố gửi báo cáo.");
    } finally {
      setIsReporting(false);
    }
  }, [contribution, isReporting, reported]);

  // Close on outside click or ESC
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
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
          role="dialog"
          aria-modal="true"
          className={`absolute z-50 ${
            align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
          } ${position === "above" ? "bottom-full mb-3" : "top-full mt-3"}`}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden min-w-[160px] max-w-[220px]"
            style={{
              animation: "contribution-tooltip-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              border: "2px solid #171717",
              boxShadow: "3px 3px 0px 0px #171717",
            }}
          >
            {view === "main" ? (
              <>
                {/* Author header */}
                <div
                  className="px-3.5 py-2.5 flex items-center gap-2"
                  style={{ backgroundColor: "#171717" }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(212, 175, 55, 0.15)", border: "1.5px solid rgba(212, 175, 55, 0.4)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4AF37" className="w-3 h-3">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[11.5px] font-semibold text-white truncate max-w-[160px]">
                    {contribution.author_nickname}
                  </span>
                </div>

                <div style={{ height: "2px", backgroundColor: "#171717" }} />

                {/* Action buttons stack */}
                <div className="flex flex-col">
                  {/* Copy */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className="w-full flex items-center justify-start gap-2.5 px-3.5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
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
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>

                  <div style={{ height: "2px", backgroundColor: "#171717" }} />

                  {/* Profile */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}
                    className="w-full flex items-center justify-start gap-2.5 px-3.5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span>Thăm nhà</span>
                  </button>

                  <div style={{ height: "2px", backgroundColor: "#171717" }} />

                  {/* Open Report Reasons Submenu */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setView("report"); }}
                    className="w-full flex items-center justify-between gap-2.5 px-3.5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-red-50 active:bg-red-100 cursor-pointer text-gray-800 hover:text-red-700 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                      </svg>
                      <span>Báo cáo</span>
                    </div>
                    {/* Tiny arrow pointing right to indicate submenu */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-gray-400 group-hover:text-red-400 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              </>
            ) : view === "report" ? (
              // Report Submenu View
              <>
                <div
                  className="px-3.5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
                  style={{ backgroundColor: "#171717", cursor: reported || isReporting ? "default" : "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!reported && !isReporting) setView("main");
                  }}
                >
                  {(!reported && !isReporting) && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3 hover:text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  )}
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">
                    Lý do báo cáo
                  </span>
                </div>

                <div style={{ height: "2px", backgroundColor: "#171717" }} />

                <div className="flex flex-col">
                  {isReporting ? (
                    <div className="px-3.5 py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Đang gửi thư...</div>
                  ) : reported ? (
                    <div className="px-3.5 py-6 flex flex-col items-center justify-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Đã Ghi Nhận
                    </div>
                  ) : (
                    REPORT_REASONS.map((reason, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (reason === "Lý do vi phạm khác") setView("custom_reason");
                          else handleReport(reason);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-[11px] font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors ${idx !== REPORT_REASONS.length - 1 ? 'border-b-2 border-gray-100' : ''}`}
                      >
                        {reason}
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : view === "custom_reason" ? (
              // Custom Reason View
              <>
                <div
                  className="px-3.5 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
                  style={{ backgroundColor: "#171717", cursor: reported || isReporting ? "default" : "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!reported && !isReporting) setView("report");
                  }}
                >
                  {(!reported && !isReporting) && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3 hover:text-gray-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  )}
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest pl-1">
                    Nhập lý do
                  </span>
                </div>

                <div style={{ height: "2px", backgroundColor: "#171717" }} />

                <div className="flex flex-col p-3.5 gap-3">
                  {isReporting ? (
                    <div className="py-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Đang gửi thư...</div>
                  ) : reported ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Đã Ghi Nhận
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <textarea
                          autoFocus
                          maxLength={150}
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Mô tả vi phạm..."
                          className="w-full h-20 text-[11px] p-2.5 pb-5 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-red-500 transition-colors"
                        />
                        <div className="absolute bottom-2 right-2 text-[9px] font-medium text-gray-400 pointer-events-none">
                          {customReason.length}/150
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (customReason.trim()) handleReport(`Khác: ${customReason.trim()}`); }}
                        disabled={!customReason.trim()}
                        className="w-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest py-2.5 rounded-lg disabled:opacity-50 hover:bg-red-700 transition-colors mt-1"
                      >
                        Gửi báo cáo
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </span>
  );
}
