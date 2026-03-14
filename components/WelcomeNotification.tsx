"use client";

import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { acknowledgeWelcomeMessage } from "@/actions/profile";

type WelcomeNotificationProps = {
  onOnboardingSeen?: () => void;
  onDeferred?: () => void;
};

export default function WelcomeNotification({ onOnboardingSeen, onDeferred }: WelcomeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Spring animations for smooth eye movement
  const mouseX = useSpring(0, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center, capped at 4px range for subtle movement
      const moveX = Math.max(-4, Math.min(4, (e.clientX - centerX) / 20));
      const moveY = Math.max(-4, Math.min(4, (e.clientY - centerY) / 20));
      
      mouseX.set(moveX);
      mouseY.set(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleStart = async () => {
    setIsVisible(false);
    const result = await acknowledgeWelcomeMessage();
    if (result.success) {
      onOnboardingSeen?.();
    } else {
      onDeferred?.();
    }
    router.push("/kho-tang");
  };

  const handleOpenWiki = async () => {
    setIsVisible(false);
    const result = await acknowledgeWelcomeMessage();
    if (result.success) {
      onOnboardingSeen?.();
    } else {
      onDeferred?.();
    }
    router.push("/wiki");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <m.div
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-[40px] p-10 max-w-[480px] w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Top Illustration/Icon Container */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gray-50 rounded-[28px] flex items-center justify-center border border-gray-100 flex-shrink-0">
              <div className="w-12 h-12 rounded-[14px] border-[2.5px] border-black flex items-center justify-center relative">
                <div className="w-6 h-[2.5px] bg-black rounded-full relative">
                  {/* Left Eye */}
                  <m.div 
                    style={{ x: mouseX, y: mouseY }}
                    className="absolute -top-3 left-0 w-[5px] h-[5px] bg-black rounded-full" 
                  />
                  {/* Right Eye */}
                  <m.div 
                    style={{ x: mouseX, y: mouseY }}
                    className="absolute -top-3 right-0 w-[5px] h-[5px] bg-black rounded-full shadow-[0px_0_0_black]" 
                  />
                  {/* Smile */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-4 h-[6px] border-b-[2.5px] border-black rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-[28px] font-bold tracking-tight mb-4 uppercase leading-tight">
            Chào mừng bạn đến với<br />Đồng Ngôn!
          </h2>

          <div className="space-y-2 mb-10">
            <p className="text-[#64748b] text-base leading-relaxed">
               Tận hưởng những trải nghiệm tuyệt vời tại đây nhé!!!
            </p>
            <p className="text-[#64748b] text-base leading-relaxed">
              Bạn có thể bắt đầu ngay hoặc mở wiki để tìm hiểu thêm thông tin. Wiki có thể truy cập nhanh từ cài đặt.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <m.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              aria-label="Bắt đầu"
              className="w-full bg-black text-white py-4 rounded-2xl hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="sr-only">Bắt đầu</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-white">
                <path d="M7.5 6.4v11.2c0 .5.5.8.9.6l9-5.6c.4-.2.4-.8 0-1.1l-9-5.6c-.4-.2-.9.1-.9.5z" />
              </svg>
            </m.button>
            <m.button
              whileHover={{ scale: 1.01, backgroundColor: "#f1f5f9", borderColor: "#0f172a" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenWiki}
              className="w-full bg-slate-50 text-slate-900 border-2 border-slate-800 py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
              </svg>
              Hướng dẫn sử dụng
            </m.button>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}


