"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { m, AnimatePresence } from "framer-motion";
import { Contribution } from "@/types/database";
import { useZenStore } from "@/stores/zen-store";
import { reportContribution } from "@/actions/notification";
import { useContributionSelection } from "./WorkPageLayout";

const REPORT_REASONS = [
  "Spam, quảng cáo rác",
  "Nội dung phản cảm, độc hại",
  "Đả kích, gây hấn cá nhân",
  "Nội dung sai sự thật",
  "Lý do vi phạm khác",
];

interface FeedContribution extends Contribution {
  user_profile?: {
    pen_name?: string;
    hashtag?: string;
    custom_id?: string;
  };
}

import SaveWorkButton from "./SaveWorkButton";

interface ContributionSidebarProps {
  selectedContribution: FeedContribution | null;
  workId?: string;
  initialSaved?: boolean;
}

export default function ContributionSidebar({
  selectedContribution,
  workId,
  initialSaved = false,
}: ContributionSidebarProps) {
  const { isZenMode, toggleZenMode } = useZenStore();
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [customReason, setCustomReason] = useState("");

  const contribution = selectedContribution;
  const isSystem = contribution?.author_nickname === "Hệ thống";

  const resetStates = useCallback(() => {
    setCopied(false);
    setLinkCopied(false);
    setReported(false);
    setShowReportMenu(false);
    setShowCustomReason(false);
    setCustomReason("");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!contribution) return;
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
    setTimeout(() => setCopied(false), 1500);
  }, [contribution]);

  const handleCopyLink = useCallback(async () => {
    if (!contribution) return;
    const url = `${window.location.origin}/work/${contribution.work_id}?c=${contribution.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }, [contribution]);

  const handleDownloadCard = useCallback(() => {
    if (!contribution) return;
    const ogUrl = `/api/og?text=${encodeURIComponent(contribution.content)}&author=${encodeURIComponent(contribution.author_nickname)}&type=contribution`;
    window.open(ogUrl, "_blank");
  }, [contribution]);

  const handleViewProfile = useCallback(() => {
    if (!contribution) return;
    router.push(`/profile?id=${contribution.user_id}`);
  }, [router, contribution]);

  const handleReport = useCallback(
    async (reason: string) => {
      if (!contribution || isReporting || reported) return;
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
            resetStates();
          }, 1500);
        } else {
          toast.error("Lỗi: " + res.error);
        }
      } catch {
        toast.error("Đã xảy ra sự cố gửi báo cáo.");
      } finally {
        setIsReporting(false);
      }
    },
    [contribution, isReporting, reported, resetStates]
  );

  return (
    <aside className="hidden lg:block w-[220px] flex-shrink-0">
      <div className="sticky top-32 space-y-6">
        <div className="border-2 border-black rounded-l-[12px] overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Header Section */}
          <div className="bg-black px-4 py-4 min-h-[64px] flex items-center justify-between gap-2.5">
            <AnimatePresence mode="wait">
              {contribution && !isSystem ? (
                <m.div
                  key="author"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col min-w-0"
                >
                  <span className="text-[12px] font-bold text-white truncate max-w-[140px]">
                    {contribution.author_nickname}
                  </span>
                  <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider">
                    {new Date(contribution.created_at).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </m.div>
              ) : (
                <m.div
                  key="empty-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col"
                >
                  <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.1em]">
                    Bảng điều khiển
                  </span>
                </m.div>
              )}
            </AnimatePresence>

            {contribution && !isSystem && (
              <button
                onClick={handleViewProfile}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-90 transition-colors group"
                title="Thăm nhà"
                aria-label="Thăm nhà"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-literary-gold group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
                </svg>
              </button>
            )}
          </div>

          {/* Content / Placeholder Section */}
          <div className="px-4 py-5 bg-[#fafaf8] border-b-2 border-black min-h-[100px] flex items-center">
            <AnimatePresence mode="wait">
              {contribution && !isSystem ? (
                <m.p
                  key={contribution.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] text-black/80 italic leading-relaxed font-serif line-clamp-4"
                >
                  &ldquo;{contribution.content}&rdquo;
                </m.p>
              ) : (
                <m.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center w-full gap-2 text-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-black/20"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"
                    />
                  </svg>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/30">
                    Chọn một câu để thao tác
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Persistent Action Menu */}
          <div className="bg-white divide-y-2 divide-black">
            {/* Save Work Button (Heart) */}
            {workId && (
              <SaveWorkButton 
                workId={workId} 
                initialSaved={initialSaved} 
                variant="full"
              />
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={!contribution}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group
                ${!contribution ? "opacity-30 cursor-not-allowed bg-gray-50" : "hover:bg-black hover:text-white active:bg-black/90 cursor-pointer"}
              `}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#16a34a" className="w-3.5 h-3.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600">Đã chép…</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  <span>Sao chép câu</span>
                </>
              )}
            </button>

            {/* Reading Mode Toggle (Always Enabled) */}
            <button
              onClick={toggleZenMode}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black hover:text-white transition-colors duration-200 group"
            >
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                  {isZenMode ? "Chế độ đọc" : "Chế độ đọc sách"}
                </span>
              </div>
              <div role="switch" aria-checked={isZenMode} className={`w-9 h-5 rounded-full border-2 border-black transition-colors duration-200 relative flex items-center px-[3px] ${isZenMode ? "bg-black" : "bg-white"} group-hover:border-white`}>
                <m.div className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${isZenMode ? "bg-white" : "bg-black"}`} animate={{ x: isZenMode ? 16 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </div>
            </button>

            {/* Link Copy */}
            <button
              onClick={handleCopyLink}
              disabled={!contribution}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group
                ${!contribution ? "opacity-30 cursor-not-allowed bg-gray-50" : "hover:bg-black hover:text-white active:bg-black/90 cursor-pointer"}
              `}
            >
              {linkCopied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#16a34a" className="w-3.5 h-3.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600">Đã chép…</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                  <span>Chép liên kết</span>
                </>
              )}
            </button>

            {/* Download Card */}
            <button
              onClick={handleDownloadCard}
              disabled={!contribution}
              className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group
                ${!contribution ? "opacity-30 cursor-not-allowed bg-gray-50" : "hover:bg-black hover:text-white active:bg-black/90 cursor-pointer"}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span>Tải ảnh thẻ</span>
            </button>

            {/* Report Section */}
            <div className="flex flex-col">
              {!showReportMenu ? (
                <button
                  onClick={() => setShowReportMenu(true)}
                  disabled={!contribution}
                  className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group
                    ${!contribution ? "opacity-30 cursor-not-allowed bg-gray-50" : "text-black/60 hover:text-white hover:bg-red-600 cursor-pointer"}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                  </svg>
                  <span>Báo cáo</span>
                </button>
              ) : (
                <div className="p-3 space-y-2">
                   {showCustomReason ? (
                     <>
                        <button onClick={() => setShowCustomReason(false)} className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 hover:text-black flex items-center gap-1 transition-colors" aria-label="Quay lại">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                          Quay lại
                        </button>
                        {isReporting ? (
                          <div className="py-4 text-center text-[10px] font-bold text-black/40 uppercase tracking-widest">Đang gửi…</div>
                        ) : reported ? (
                          <div className="py-4 text-center text-green-600 text-[10px] font-bold uppercase tracking-widest">✓ Đã ghi nhận</div>
                        ) : (
                          <>
                            <div className="relative">
                              <textarea aria-label="Mô tả vi phạm chi tiết" maxLength={150} value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Mô tả vi phạm…" className="w-full h-16 text-[11px] p-2 border-2 border-black/20 rounded-[4px] resize-none focus:outline-none focus:border-black transition-colors" />
                              <div className="absolute bottom-1 right-2 text-[8px] text-black/30">{customReason.length}/150</div>
                            </div>
                            <button onClick={() => { if (customReason.trim()) handleReport(`Khác: ${customReason.trim()}`); }} disabled={!customReason.trim()} className="w-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-[4px] disabled:opacity-40 hover:bg-red-700 transition-colors">Gửi báo cáo</button>
                          </>
                        )}
                     </>
                   ) : (
                     <div className="flex flex-col">
                        <button onClick={() => setShowReportMenu(false)} className="px-1 py-1 mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 hover:text-black flex items-center gap-1 transition-colors" aria-label="Huỷ bỏ">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                          Huỷ bỏ
                        </button>
                        {isReporting ? (
                          <div className="py-4 text-center text-[10px] font-bold text-black/40 uppercase tracking-widest">Đang gửi…</div>
                        ) : reported ? (
                          <div className="py-4 text-center text-green-600 text-[10px] font-bold uppercase tracking-widest">✓ Đã ghi nhận</div>
                        ) : (
                          REPORT_REASONS.map((reason, idx) => (
                            <button key={idx} onClick={() => { if (reason === "Lý do vi phạm khác") setShowCustomReason(true); else handleReport(reason); }} className="w-full text-left px-2 py-2 text-[10px] font-semibold text-black/70 hover:bg-red-50 hover:text-red-700 transition-colors border-t border-black/10">
                              {reason}
                            </button>
                          ))
                        )}
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Help text below the main panel */}
        {!contribution && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 text-center"
          >
          </m.div>
        )}
      </div>
    </aside>
  );
}

