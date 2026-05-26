import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 bg-white font-['Be_Vietnam_Pro']">
      <div className="flex flex-col items-center gap-4">
        {/* Minimalist Neo-brutalist Loading Indicator */}
        <div className="w-12 h-12 border-4 border-black border-t-literary-gold animate-spin rounded-full" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-black/60 animate-pulse">
          Đang tải dữ liệu...
        </span>
      </div>
    </div>
  );
}
