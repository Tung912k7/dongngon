"use client";

/**
 * WorkCardSkeleton — CSS-only shimmer animation.
 *
 * WHY CSS over Framer Motion here:
 * - CSS animations run off the main thread → stays smooth during page loads.
 * - Framer Motion uses rAF (main thread) which drops frames while content loads.
 * - Skeleton is a decorative repeating animation — Emil's rule: use CSS for
 *   predetermined animations, JS only for dynamic/interruptible ones.
 *
 * The `.skeleton` class and `@keyframes shimmer` are defined in globals.css.
 */
export function WorkCardSkeleton() {
  return (
    <div className="w-full h-[360px] p-6 flex flex-col gap-4 bg-white border border-black/[0.08] rounded-[12px] relative overflow-hidden">
      {/* Top row: badge + bookmark */}
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-4 w-4 rounded-sm" />
      </div>

      {/* Title lines */}
      <div className="flex flex-col gap-2.5 flex-grow">
        <div className="skeleton h-7 w-11/12 rounded-md" />
        <div className="skeleton h-7 w-3/4 rounded-md" />
      </div>

      {/* Description lines */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-5/6 rounded-md" />
        <div className="skeleton h-4 w-2/3 rounded-md" />
      </div>

      {/* Footer row */}
      <div className="mt-auto pt-5 border-t border-black/5 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className="skeleton h-6 w-6 rounded-md" />
          <div className="skeleton h-6 w-6 rounded-md" />
          <div className="skeleton h-6 w-6 rounded-md" />
        </div>
        <div className="skeleton h-4 w-16 rounded-md" />
      </div>
    </div>
  );
}

export function WorkGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <WorkCardSkeleton key={i} />
      ))}
    </div>
  );
}
