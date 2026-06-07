import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#faf8f5] py-16 md:py-24 px-6 md:px-16 animate-pulse">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Skeleton */}
        <div className="mb-12 border-b border-black/[0.06] pb-6">
          <div className="h-3.5 w-24 bg-black/10 rounded-sm mb-4" />
          <div className="h-10 w-64 bg-black/10 rounded-md mb-4" />
          <div className="h-4 w-full max-w-xl bg-black/10 rounded-sm mt-3" />
        </div>

        {/* Action Bar Skeleton */}
        <div className="flex justify-between items-center py-4 border-y border-black/5 mb-12 gap-4">
          <div className="h-6 w-32 bg-black/10 rounded-md" />
          <div className="h-10 w-28 bg-black/10 rounded-md" />
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-full min-h-[300px] bg-[#fcfaf8] border border-black/[0.08] rounded-[12px] p-6 flex flex-col justify-between"
            >
              <div>
                {/* Category Badge Placeholder */}
                <div className="flex justify-between items-center mb-6">
                  <div className="h-4 w-16 bg-black/10 rounded-md" />
                  <div className="h-4 w-4 bg-black/10 rounded-full" />
                </div>

                {/* Title Placeholder */}
                <div className="mb-4 space-y-2">
                  <div className="h-5 w-3/4 bg-black/10 rounded-sm" />
                  <div className="h-5 w-1/2 bg-black/10 rounded-sm" />
                </div>

                {/* Description Placeholder */}
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-black/10 rounded-sm" />
                  <div className="h-3.5 w-full bg-black/10 rounded-sm" />
                  <div className="h-3.5 w-4/5 bg-black/10 rounded-sm" />
                </div>
              </div>

              {/* Footer Placeholder */}
              <div className="pt-5 border-t border-black/5 flex justify-between items-center mt-6">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-black/10 rounded-md" />
                  <div className="h-3.5 w-24 bg-black/10 rounded-sm" />
                </div>
                <div className="h-3.5 w-12 bg-black/10 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
