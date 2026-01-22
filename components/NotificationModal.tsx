"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: "error" | "success" | "info";
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: NotificationModalProps) {
  const bgColor = type === "error" ? "bg-red-50" : type === "success" ? "bg-green-50" : "bg-white";
  const borderColor = type === "error" ? "border-red-500" : type === "success" ? "border-green-500" : "border-black";
  const iconColor = type === "error" ? "text-red-500" : type === "success" ? "text-green-500" : "text-black";
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative z-10 w-full max-w-sm ${bgColor} border-2 ${borderColor} rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}
          >
            <div className="text-center">
              {type === "error" && (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {type === "success" && (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              <h3 className={`text-xl font-bold mb-2 uppercase tracking-tight font-montserrat ${iconColor}`}>
                {title || (type === "error" ? "Lỗi" : type === "success" ? "Thành công" : "Thông báo")}
              </h3>
              <p className="text-gray-700 text-sm font-medium leading-relaxed font-montserrat whitespace-pre-line">
                {message}
              </p>
              
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-80 transition-all border-2 border-black"
              >
                ĐÃ HIỂU
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
