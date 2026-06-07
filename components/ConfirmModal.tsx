"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Hài lòng",
  cancelText = "Nghĩ lại",
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
          />
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.15, ease: [0.32, 0.72, 0, 1] },
            }}
            className="relative z-10 w-full max-w-sm bg-white border border-black/[0.06] rounded-[12px] p-6 shadow-xl"
          >
            <div className="text-center">
              <h3 className="text-xl font-ganh font-bold mb-3 uppercase tracking-tight text-black">
                {title}
              </h3>
              <p className="text-gray-800 text-sm font-medium leading-relaxed mb-8">{message}</p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="w-full py-3 bg-ink-charcoal text-white text-[11px] font-bold font-ganh uppercase tracking-widest rounded-[6px] hover:bg-deep-teal transition-all duration-300 border border-ink-charcoal/[0.12] active:scale-[0.98]"
                >
                  {confirmText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-white text-ink-charcoal text-[11px] font-bold font-ganh uppercase tracking-widest rounded-[6px] hover:bg-black/5 transition-all duration-300 border border-black/10 active:scale-[0.98]"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
