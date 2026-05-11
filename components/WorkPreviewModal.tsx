"use client";

import { useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Work } from "@/stores/work-store";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface WorkPreviewModalProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkPreviewModal({ work, isOpen, onClose }: WorkPreviewModalProps) {
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
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <m.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview of ${work.title}`}
            className="bg-white border-2 border-black p-0 w-full max-w-lg md:max-w-4xl relative z-10 rounded-xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Sidebar: Metadata & Quick Actions */}
            <div className="hidden md:flex md:w-80 border-b-2 md:border-b-0 md:border-r-2 border-black p-8 md:flex-col bg-white">
              <div className="mb-auto space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Phân loại</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                      {work.type}
                    </span>
                    {work.hinh_thuc && (
                      <span className="px-3 py-1 border border-black text-black text-[10px] font-black uppercase tracking-widest">
                        {work.hinh_thuc}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">Thông tin</p>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
                        <span className="text-black/40">Độ tuổi</span>
                        <span>{work.age_rating?.toLowerCase() === 'all' ? 'Mọi độ tuổi' : work.age_rating}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
                        <span className="text-black/40">Quy tắc</span>
                        <span>{work.rule || "N/A"}</span>
                     </div>
                     <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
                        <span className="text-black/40">Trạng thái</span>
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${
                              work.status === "Hoàn thành" ? "bg-green-500" :
                              work.status === "Đang viết" ? "bg-blue-500" :
                              "bg-yellow-500"
                           }`} />
                           <span>{work.status}</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-black/5 flex flex-col gap-3">
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/work/${work.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: work.title,
                        text: work.description || `Xem tác phẩm "${work.title}" trên Đồng ngôn`,
                        url: shareUrl,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Đã sao chép liên kết vào bộ nhớ tạm!");
                    }
                  }}
                  className="w-full py-3 border-2 border-black text-black font-black uppercase tracking-[0.2em] bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-[10px] flex items-center justify-center gap-2"
                >
                  SHARE
                </button>
                <button
                  onClick={() => {
                    router.push(`/work/${work.id}`);
                    onClose();
                  }}
                  className="w-full py-3 bg-black text-white font-black uppercase tracking-[0.2em] border-2 border-black hover:bg-literary-gold hover:border-literary-gold hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-[10px] flex items-center justify-center gap-2"
                >
                  ĐẾN TÁC PHẨM
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex-grow flex flex-col justify-center">
                <div className="mb-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-[2px] bg-black" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">GIỚI THIỆU</span>
                  </div>
                  <h2 className="text-2xl md:text-6xl font-ganh font-bold text-black leading-[1.4] tracking-tight break-words pb-2">
                    {work.title}
                  </h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/60">
                    Bởi {work.author_nickname}
                  </p>
                </div>

                <div className="max-h-[60vh] md:max-h-[300px] overflow-y-auto pr-6 scrollbar-hide">
                  {work.description ? (
                    <p className="text-lg md:text-2xl font-medium text-gray-800 leading-relaxed font-be-vietnam italic">
                      &ldquo;{work.description}&rdquo;
                    </p>
                  ) : (
                    <div className="py-12 border-2 border-dashed border-black/5 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/20">
                        Chưa có lời dẫn cho tác phẩm này.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile actions (visible only on small screens) */}
                <div className="md:hidden mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/work/${work.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: work.title,
                          text: work.description || `Xem tác phẩm "${work.title}" trên Đồng ngôn`,
                          url: shareUrl,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        alert("Đã sao chép liên kết vào bộ nhớ tạm!");
                      }
                    }}
                    className="w-full py-3 border-2 border-black text-black font-black uppercase tracking-[0.2em] bg-white text-[12px]"
                  >
                    SHARE
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/work/${work.id}`);
                      onClose();
                    }}
                    className="w-full py-3 bg-black text-white font-black uppercase tracking-[0.2em] border-2 border-black text-[12px]"
                  >
                    ĐẾN TÁC PHẨM
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
