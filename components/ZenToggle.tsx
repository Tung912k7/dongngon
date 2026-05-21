"use client";

import React from "react";
import { useZenStore } from "@/stores/zen-store";
import { AnimatePresence, m } from "framer-motion";

const ZenToggle = () => {
  const { isZenMode, toggleZenMode } = useZenStore();

  return (
    <button
      onClick={toggleZenMode}
      className={`
        fixed bottom-8 right-8 z-[100]
        flex items-center gap-3 px-4 py-3
        bg-white border-2 border-black
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        rounded-[4px]
        font-ganh font-bold text-xs uppercase tracking-[0.2em]
        transition-all duration-300
        hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        active:translate-x-0 active:translate-y-0 active:shadow-none
        group
      `}
      title={isZenMode ? "Thoát chế độ trầm tư" : "Chế độ trầm tư"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isZenMode ? (
            <m.svg
              key="zen"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
            >
              <path d="M12 3v3m0 12v3M5.31 5.31l2.12 2.12m9.14 9.14l2.12 2.12M3 12h3m12 0h3M5.31 18.69l2.12-2.12m9.14-9.14l2.12-2.12" />
              <circle cx="12" cy="12" r="4" />
            </m.svg>
          ) : (
            <m.svg
              key="normal"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
            >
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </m.svg>
          )}
        </AnimatePresence>
      </div>
      <span className="hidden sm:inline-block">{isZenMode ? "Bình thường" : "Trầm tư"}</span>
    </button>
  );
};

export default ZenToggle;
