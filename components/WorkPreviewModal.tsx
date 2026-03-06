"use client";

import { m, AnimatePresence } from "framer-motion";
import { Work } from "@/stores/work-store";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface WorkPreviewModalProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkPreviewModal({ work, isOpen, onClose }: WorkPreviewModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <m.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white border-4 border-black rounded-[2.5rem] p-8 md:p-12 w-full max-w-2xl relative z-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gray-50 rounded-full -z-10 opacity-50" />

            <div className="flex flex-col gap-8">
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    {work.type || work.category_type}
                  </span>
                  {work.hinh_thuc && (
                    <span className="px-3 py-1 border-2 border-black text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                      {work.hinh_thuc}
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black leading-tight uppercase tracking-tight italic">
                  {work.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[11px]">
                  <span>Bởi {work.author_nickname}</span>
                  <span>•</span>
                  <span>{work.age_rating === 'all' ? 'Mọi độ tuổi' : work.age_rating}</span>
                </div>
              </div>

              {/* Description Content */}
              <div className="min-h-[120px] max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                {work.description ? (
                  <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed font-be-vietnam italic">
                    &ldquo;{work.description}&rdquo;
                  </p>
                ) : (
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-sm text-center py-8 border-2 border-dashed border-gray-100 rounded-3xl">
                    Tác phẩm này chưa có lời dẫn.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 border-2 border-black text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-all active:scale-95 text-xs sm:text-sm"
                >
                  QUAY LẠI
                </button>
                <button
                  onClick={() => {
                    router.push(`/work/${work.id}`);
                    onClose();
                  }}
                  className="flex-1 py-4 bg-black text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-all active:scale-95 text-xs sm:text-sm"
                >
                  VIẾT TIẾP
                </button>
              </div>
            </div>

            {/* Close Icon (Mobile) */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-300 hover:text-black sm:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
