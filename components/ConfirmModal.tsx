"use client";

import { m, AnimatePresence } from "framer-motion";
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
    setMounted(true);
    return () => setMounted(false);
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-sm bg-white border-2 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="text-center">
              
              <h3 className="text-xl font-ganh font-bold mb-3 uppercase tracking-tight text-black">
                {title}
              </h3>
               <p className="text-gray-800 text-sm font-medium leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="w-full py-3 bg-black text-white text-[11px] font-bold font-ganh uppercase tracking-widest rounded-xl hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black"
                >
                  {confirmText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-white text-black text-[11px] font-bold font-ganh uppercase tracking-widest rounded-xl hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all border-2 border-black"
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
