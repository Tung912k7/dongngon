"use client";

import React from "react";

export default function InteractionPlaceholder() {
  return (
    <aside className="hidden lg:block w-[260px] flex-shrink-0">
      <div className="sticky top-28">
        <div className="relative border-2 border-black/15 rounded-[4px] overflow-hidden">
          {/* Blurred content simulation */}
          <div className="p-5 space-y-4 select-none" style={{ filter: "blur(3px)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/10" />
              <div className="space-y-1 flex-1">
                <div className="h-2.5 bg-black/10 rounded-full w-3/4" />
                <div className="h-2 bg-black/8 rounded-full w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-black/8 rounded-full w-full" />
              <div className="h-2 bg-black/8 rounded-full w-5/6" />
              <div className="h-2 bg-black/8 rounded-full w-2/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 bg-black/8 rounded-[4px] flex-1" />
              <div className="h-7 bg-black/8 rounded-[4px] flex-1" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-2 bg-black/6 rounded-full w-full" />
              <div className="h-2 bg-black/6 rounded-full w-4/5" />
            </div>
          </div>

          {/* Overlay message */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] p-6">
            <div className="w-10 h-10 rounded-[4px] bg-black/5 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-black/30"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                />
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40 text-center leading-relaxed">
              Chức năng liên quan
              <br />
              đến tương tác đang
              <br />
              được nghiên cứu
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
