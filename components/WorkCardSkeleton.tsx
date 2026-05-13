"use client";

import { m } from "framer-motion";

export function WorkCardSkeleton() {
  return (
    <div 
        className="w-full h-[360px] p-5 flex flex-col items-start gap-4 bg-white border-2 border-black rounded relative overflow-hidden"
    >
      {/* Animated Shine Effect */}
      <m.div
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.5
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.03] to-transparent z-10"
      />

      {/* Title Placeholder */}
      <div className="flex flex-col gap-3 w-full">
        <div className="h-8 w-11/12 bg-black/5 rounded-md" />
        <div className="h-8 w-3/4 bg-black/5 rounded-md" />
      </div>

      {/* Metadata Placeholder */}
      <div className="flex flex-col gap-2 mt-2 w-full">
        <div className="h-4 w-1/2 bg-black/5 rounded-md" />
        <div className="h-4 w-1/3 bg-black/5 rounded-md" />
      </div>

      {/* Tags Placeholder */}
      <div className="mt-auto flex gap-2 pt-4 w-full">
        <div className="h-6 w-20 bg-black/5 rounded-md" />
        <div className="h-6 w-16 bg-black/5 rounded-md" />
        <div className="h-6 w-24 bg-black/5 rounded-md" />
      </div>
    </div>
  );
}

export function WorkGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-center sm:justify-start">
            <WorkCardSkeleton />
        </div>
      ))}
    </div>
  );
}

