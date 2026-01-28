"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminWelcome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [arrowPos, setArrowPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams.get("welcome") === "true") {
      setShow(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (show && mounted) {
      const updatePosition = () => {
        const btn = document.getElementById("admin-moderation-btn");
        if (btn) {
          const rect = btn.getBoundingClientRect();
          // Point to the left side of the button
          setArrowPos({
            top: rect.top + rect.height / 2,
            left: rect.left - 20
          });
        }
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [show, mounted]);

  const handleClose = () => {
    setShow(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("welcome");
    const newPath = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/admin${newPath}`);
  };

  if (!show || !mounted) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Semi-transparent Dim Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 pointer-events-auto backdrop-blur-[2px]"
          onClick={handleClose}
        />

        {/* Floating Welcome Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] w-full max-w-md p-6 pointer-events-auto"
        >
          <div className="bg-white border-[4px] border-black p-8 rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
             {/* Decorative Background Element */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
             
             <div className="inline-block p-4 bg-yellow-400 border-2 border-black rounded-2xl mb-6 -rotate-2">
                <span className="text-3xl">👋</span>
             </div>
             
             <h2 className="text-3xl font-bold mb-4 tracking-tighter uppercase italic">
                Chào mừng Quản trị viên!
             </h2>
             
             <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                Hệ thống đã sẵn sàng. Thao tác quan trọng nhất lúc này là <span className="font-bold text-black border-b-2 border-yellow-400">kiểm duyệt các nội dung mới</span> từ cộng đồng.
             </p>
             
             <button 
                onClick={handleClose}
                className="w-full py-4 bg-black text-white font-bold text-lg rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 group"
             >
                <span>BẮT ĐẦU NGAY</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
             </button>
          </div>
        </motion.div>

        {/* Animated Arrow pointing to the specific button */}
        {arrowPos.top !== 0 && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: 1, 
              x: [0, -20, 0], // Bouncing effect
            }}
            transition={{ 
                x: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                opacity: { duration: 0.5 }
            }}
            style={{ 
              position: "fixed",
              top: arrowPos.top,
              left: arrowPos.left,
              transform: "translateY(-50%)",
            }}
            className="flex items-center gap-4 hidden lg:flex"
          >
              <div className="bg-yellow-400 text-black px-4 py-2 rounded-xl border-2 border-black font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
                BẮT ĐẦU TẠI ĐÂY!
             </div>
             <svg 
                width="60" height="40" viewBox="0 0 60 40" fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
             >
                <path d="M0 20H45M45 20L35 10M45 20L35 30" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
