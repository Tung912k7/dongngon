"use client";

import React, { useEffect } from "react";
import { useZenStore } from "@/stores/zen-store";
import { AnimatePresence, m } from "framer-motion";

const ZenModeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isZenMode, setZenMode } = useZenStore();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZenMode) {
        setZenMode(false);
      }
    };
    window.addEventListener("keydown", handleEsc);

    if (isZenMode) {
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("zen-mode-active");
    } else {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("zen-mode-active");
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      document.documentElement.classList.remove("zen-mode-active");
    };
  }, [isZenMode, setZenMode]);

  return (
    <div
      className={`transition-colors duration-1000 ${isZenMode ? "bg-[#F5F5F3] min-h-screen" : ""}`}
    >
      <m.div
        animate={{
          paddingTop: isZenMode ? "12vh" : "0",
          maxWidth: isZenMode ? "800px" : "100%",
        }}
        className="mx-auto transition-all duration-1000 ease-in-out relative z-10"
      >
        {children}
      </m.div>

      <AnimatePresence>
        {isZenMode && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-0 bg-[#F5F5F3]"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.015) 0%, transparent 80%)`,
              }}
            />

            <m.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => setZenMode(false)}
              className="fixed bottom-8 right-8 z-[100] px-6 py-3 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-literary-gold animate-pulse" />
              TẮT CHẾ ĐỘ ĐỌC SÁCH
              <span className="text-white/40 group-hover:text-white transition-colors text-[9px] ml-1">
                (ESC)
              </span>
            </m.button>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZenModeWrapper;
