"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding } from "@/actions/profile";

interface GuideNotificationProps {
  hasSeenTour: boolean;
}

export default function GuideNotification({ hasSeenTour }: GuideNotificationProps) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show if user hasn't seen the tour/guide yet
    if (hasSeenTour === false) {
      // Small delay for better UX
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  if (!mounted) return null;

  const handleDismiss = async () => {
    setShow(false);
    await completeOnboarding();
  };

  const handleOpenGuide = async () => {
    window.open("/web_guide.pdf", "_blank");
    setShow(false);
    await completeOnboarding();
  };

  const modalContent = (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleDismiss}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white border-4 border-black rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg relative z-[100] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center font-sans"
          >
            {/* Icon/Decoration */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight text-black mb-4 leading-tight">
              Chào mừng bạn đến với <br /> Đồng Ngôn!
            </h2>
            
            <p className="text-lg font-medium text-gray-600 mb-8 px-2 leading-relaxed">
              Bạn muốn tự mình khám phá không gian này, <br className="hidden md:block" /> 
              hay cần một bản hướng dẫn nhỏ để bắt đầu?
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleOpenGuide}
                className="flex-[1.5] py-4 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-80 transition-all text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:scale-[0.98]"
              >
                Xem hướng dẫn
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-4 border-4 border-black text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all text-sm active:scale-[0.98]"
              >
                Tự khám phá
              </button>
            </div>
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
