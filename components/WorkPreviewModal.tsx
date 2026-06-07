"use client";

import { logger } from "@/lib/logger";
import { useEffect } from "react";
import { AnimatePresence, m } from "framer-motion";
import { toast } from "sonner";
import { Work } from "@/stores/work-store";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import SaveWorkButton from "./SaveWorkButton";

interface WorkPreviewModalProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
  initialSaved?: boolean;
}

export default function WorkPreviewModal({
  work,
  isOpen,
  onClose,
  initialSaved,
}: WorkPreviewModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container — center-anchored, keep transformOrigin: center */}
          <m.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={{
              scale: 0.96,
              opacity: 0,
              transition: { duration: 0.15, ease: [0.32, 0.72, 0, 1] },
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of ${work.title}`}
            className="bg-[#faf8f5] border border-[#eae6e1] p-0 w-full max-w-lg md:max-w-4xl relative z-10 rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] shadow-lg"
          >
            {/* Sidebar: Metadata & Quick Actions */}
            <div className="hidden md:flex md:w-80 border-b md:border-b-0 md:border-r border-[#eae6e1] p-8 md:flex-col bg-[#fcfaf8]">
              <div className="mb-auto space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-medium text-black/60 tracking-wider lowercase">
                    phân loại
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-deep-teal/[0.06] text-deep-teal text-[10px] font-bold lowercase tracking-wider rounded-full border border-deep-teal/10">
                      {work.type.toLowerCase()}
                    </span>
                    {work.hinh_thuc && (
                      <span className="px-3 py-1 bg-literary-gold/[0.08] text-literary-gold text-[10px] font-bold lowercase tracking-wider rounded-full border border-literary-gold/20">
                        {work.hinh_thuc.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-medium text-black/60 tracking-wider lowercase">
                    thông tin
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium tracking-wide text-black/80 lowercase">
                      <span className="text-black/40">độ tuổi</span>
                      <span>
                        {work.age_rating?.toLowerCase() === "all" ? "mọi độ tuổi" : work.age_rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium tracking-wide text-black/80 lowercase">
                      <span className="text-black/40">quy tắc</span>
                      <span>{work.rule?.toLowerCase() || "n/a"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium tracking-wide text-black/80 lowercase">
                      <span className="text-black/40">trạng thái</span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            work.status === "Hoàn thành"
                              ? "bg-green-500"
                              : work.status === "Đang viết"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        <span>{work.status.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-black/5 flex flex-col gap-3">
                <SaveWorkButton
                  workId={work.id.toString()}
                  initialSaved={initialSaved}
                  variant="full"
                  className="w-full py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider rounded-full hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm bg-white flex items-center justify-center gap-2 cursor-pointer"
                />
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/work/${work.id}`;
                    if (navigator.share) {
                      navigator
                        .share({
                          title: work.title,
                          text: work.description || `Xem tác phẩm "${work.title}" trên Đồng ngôn`,
                          url: shareUrl,
                        })
                        .catch((error) => logger.error("Share failed", error as Error));
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Đã sao chép liên kết!");
                    }
                  }}
                  className="w-full py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider bg-white hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm flex items-center justify-center gap-2 rounded-full cursor-pointer"
                >
                  chia sẻ
                </button>
                <button
                  onClick={() => {
                    router.push(`/work/${work.id}`);
                    onClose();
                  }}
                  className="w-full py-3 bg-[#134e4a] text-[#faf8f5] font-ganh font-bold lowercase tracking-wider border border-deep-teal/10 hover:bg-[#003633] active:scale-[0.98] transition-all duration-200 text-sm flex items-center justify-center gap-2 rounded-full cursor-pointer"
                >
                  đến tác phẩm
                </button>
              </div>
            </div>

            {/* Main Content: Title & Text */}
            <div className="flex-1 p-6 md:p-14 flex flex-col relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-black/40 hover:text-black transition-colors p-2 rounded-full"
                title="Đóng"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex-grow flex flex-col justify-center">
                <div className="mb-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-[1px] bg-[#134e4a]/30" />
                    <span className="text-xs font-medium text-black/60 tracking-wider lowercase">
                      giới thiệu
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-6xl font-ganh font-bold text-black leading-[1.4] tracking-tight break-words pb-2">
                    {work.title}
                  </h2>
                  <p className="text-xs font-medium text-black/60 tracking-wider lowercase">
                    bởi {work.author_nickname}
                  </p>
                </div>

                <div className="max-h-[60vh] md:max-h-[300px] overflow-y-auto overscroll-contain pr-6 scrollbar-hide">
                  {work.description ? (
                    <p className="text-lg md:text-2xl font-medium text-gray-800 leading-relaxed font-be-vietnam italic">
                      &ldquo;{work.description}&rdquo;
                    </p>
                  ) : (
                    <div className="py-12 border border-dashed border-[#eae6e1] rounded-xl flex flex-col items-center justify-center text-center">
                      <p className="text-xs font-medium text-black/40 lowercase">
                        chưa có lời dẫn cho tác phẩm này.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile actions (visible only on small screens) */}
                <div className="md:hidden mt-6 flex flex-col gap-3">
                  <SaveWorkButton
                    workId={work.id.toString()}
                    initialSaved={initialSaved}
                    variant="full"
                    className="w-full py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider rounded-full hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm bg-white flex items-center justify-center gap-2 cursor-pointer"
                  />
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/work/${work.id}`;
                      if (navigator.share) {
                        navigator
                          .share({
                            title: work.title,
                            text: work.description || `Xem tác phẩm "${work.title}" trên Đồng ngôn`,
                            url: shareUrl,
                          })
                          .catch((error) => logger.error("Share failed", error as Error));
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Đã sao chép liên kết!");
                      }
                    }}
                    className="w-full py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider bg-white hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm flex items-center justify-center gap-2 rounded-full cursor-pointer"
                  >
                    chia sẻ
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/work/${work.id}`);
                      onClose();
                    }}
                    className="w-full py-3 bg-[#134e4a] text-[#faf8f5] font-ganh font-bold lowercase tracking-wider border border-deep-teal/10 hover:bg-[#003633] active:scale-[0.98] transition-all duration-200 text-sm flex items-center justify-center gap-2 rounded-full cursor-pointer"
                  >
                    đến tác phẩm
                  </button>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
