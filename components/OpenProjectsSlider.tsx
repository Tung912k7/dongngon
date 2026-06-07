"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import SaveWorkButton from "./SaveWorkButton";
import dynamic from "next/dynamic";

const WorkPreviewModal = dynamic(() => import("@/components/WorkPreviewModal"), { ssr: false });

interface WorkItem {
  id: string;
  title: string;
  category_type: string;
  sub_category: string;
  author_nickname: string;
  created_by: string;
  created_at: string;
  description?: string;
  contributors: string[];
  contributorCount: number;
  sentenceCount: number;
  isSavedByUser: boolean;
  // Mapped fields for WorkPreviewModal compatibility
  type: string;
  hinh_thuc: string;
  rule: string;
  age_rating?: string;
  status: string;
  date: string;
  rawDate: Date;
  is_author_private?: boolean;
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins || 1}m trước`;
  } else if (diffHours < 24) {
    return `${diffHours}h trước`;
  } else {
    return `${diffDays}n trước`;
  }
}

function getCategoryColor(categoryType: string) {
  const isPoetry = categoryType === "Thơ";
  const isProse = categoryType === "Văn xuôi" || categoryType === "Văn";

  return isProse
    ? "bg-[#EDF3EC] text-[#346538] border border-[#D4E5D5]/40"
    : isPoetry
      ? "bg-[#E1F3FE] text-[#1F6C9F] border border-[#C7E3F7]/40"
      : "bg-[#FBF3DB] text-[#956400] border border-[#F0E4C0]/40";
}

const FRICTION = 0.94;
const MIN_VELOCITY = 0.5;

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const originX = useRef(0);
  const originScrollLeft = useRef(0);
  const velX = useRef(0);
  const prevX = useRef(0);
  const prevT = useRef(0);
  const rafId = useRef<number | null>(null);
  const totalDragDistance = useRef(0);
  const hasCaptured = useRef(false);

  const cancelMomentum = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Disable drag scroll for touch or pen inputs; let native browser scroll take over
    if (e.pointerType !== "mouse") return;

    const el = ref.current;
    if (!el) return;

    // Ignore interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }

    cancelMomentum();
    isDragging.current = true;
    originX.current = e.clientX;
    originScrollLeft.current = el.scrollLeft;
    prevX.current = e.clientX;
    prevT.current = performance.now();
    velX.current = 0;
    totalDragDistance.current = 0;
    hasCaptured.current = false;
    el.style.scrollSnapType = "none";
    el.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = ref.current;
    if (!el) return;
    const now = performance.now();
    const dt = now - prevT.current;
    const dx = e.clientX - prevX.current;
    if (dt > 0) {
      const rawVel = dx / dt;
      velX.current = velX.current * 0.4 + rawVel * 0.6;
    }

    totalDragDistance.current += Math.abs(e.clientX - prevX.current);

    // Capture pointer only when they move a bit (drag starts)
    if (totalDragDistance.current > 4 && !hasCaptured.current) {
      try {
        el.setPointerCapture(e.pointerId);
        hasCaptured.current = true;
      } catch { }
    }

    prevX.current = e.clientX;
    prevT.current = now;
    el.scrollLeft = originScrollLeft.current - (e.clientX - originX.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = ref.current;
    isDragging.current = false;
    if (el) {
      if (hasCaptured.current) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch { }
      }
      el.style.cursor = "grab";
      const restoreSnap = () => {
        if (el) el.style.scrollSnapType = "";
      };
      if (Math.abs(velX.current) < 0.1) {
        restoreSnap();
      } else {
        velX.current *= 16;
        rafId.current = requestAnimationFrame(function loop() {
          if (!ref.current) return;
          velX.current *= FRICTION;
          ref.current.scrollLeft -= velX.current;
          if (Math.abs(velX.current) > MIN_VELOCITY) {
            rafId.current = requestAnimationFrame(loop);
          } else {
            rafId.current = null;
            restoreSnap();
          }
        });
      }
    }
  };

  const isDragActive = () => totalDragDistance.current > 10;

  return { ref, onPointerDown, onPointerMove, onPointerUp, isDragActive };
}

export default function OpenProjectsSlider({
  works,
  userId,
}: {
  works: WorkItem[];
  userId: string | null;
}) {
  const {
    ref: containerRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    isDragActive,
  } = useDragScroll();
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const scrollBy = (dir: "left" | "right") => {
    containerRef.current?.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" });
  };

  const handleCardClick = (e: React.MouseEvent, work: WorkItem) => {
    if (isDragActive()) {
      e.preventDefault();
      return;
    }
    setSelectedWork(work);
    setIsPreviewOpen(true);
  };

  return (
    <section className="py-16 md:py-24 overflow-hidden relative border-t border-ink-charcoal/[0.04]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Eyebrow & Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-ink-charcoal/[0.08] pb-6">
          <div>
            {/* Crisp rectangle badge — no rounded-full */}
            <div className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 bg-deep-teal/[0.05] border border-deep-teal/12 text-[10px] uppercase tracking-[0.2em] font-medium text-deep-teal mb-3">
              Đang được chú ý
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-charcoal tracking-tight font-bold">
              Đang chạy
            </h2>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
            {works.length > 0 && (
              <div className="flex items-center gap-3">
                {/* Crisp square-ish arrow buttons — rounded-md, not rounded-full */}
                {(["left", "right"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => scrollBy(dir)}
                    aria-label={dir === "left" ? "Cuộn trái" : "Cuộn phải"}
                    className="w-11 h-11 rounded-md border border-ink-charcoal/[0.10] bg-white text-ink-charcoal/80 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink-charcoal hover:text-white hover:border-transparent active:scale-[0.95] min-touch cursor-pointer"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform"
                    >
                      <path d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* CTA — crisp rounded-md, no rounded-full pill */}
            <Link
              href="/kho-tang"
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-ink-charcoal hover:bg-deep-teal text-white rounded-md font-sans font-medium text-[13px] tracking-wide transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] border border-ink-charcoal/[0.12] hover:border-deep-teal/30 min-touch"
            >
              <span>Xem tất cả</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
        {works.length === 0 ? (
          <div className="text-center text-on-surface-variant/80 py-16 font-sans text-[15px] bg-ink-charcoal/[0.02] rounded-xl border border-dashed border-ink-charcoal/15">
            Hiện tại không có tác phẩm nào. Hãy tạo một tác phẩm mới!
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="flex overflow-x-auto gap-6 pb-8 pt-2 no-scrollbar snap-x snap-mandatory"
              style={{
                cursor: "grab",
                WebkitOverflowScrolling: "touch",
                willChange: "scroll-position",
              }}
            >
              {works.map((work, idx) => (
                <m.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: idx * 0.06 }}
                  onClick={(e) => handleCardClick(e, work)}
                  className="group flex-shrink-0 w-[85vw] sm:w-[350px] h-[380px] bg-[#fcfaf8] border border-ink-charcoal/[0.10] rounded-xl p-6 flex flex-col justify-between snap-start relative overflow-hidden select-none cursor-pointer shadow-[0_4px_20px_rgba(19,78,74,0.02)] transition-[transform,border-color,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-ink-charcoal/25 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)] active:scale-[0.99] active:shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                >
                  <div className="flex flex-col justify-between h-full w-full">
                    <div>
                      {/* Category Tag & Bookmark */}
                      <div className="flex justify-between items-center mb-5">
                        <span
                          className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-md ${getCategoryColor(work.category_type || work.type)}`}
                        >
                          {work.sub_category || work.category_type}
                        </span>

                        <SaveWorkButton
                          workId={work.id}
                          initialSaved={work.isSavedByUser}
                          variant="icon"
                          className="scale-95 hover:scale-105 active:scale-95 transition-transform"
                        />
                      </div>

                      {/* Title */}
                      <div className="block mb-3">
                        <h3 className="font-serif font-semibold text-lg sm:text-xl text-ink-charcoal line-clamp-2 leading-snug group-hover:text-literary-gold underline decoration-transparent group-hover:decoration-literary-gold/35 decoration-[1.5px] underline-offset-4 transition-all duration-300">
                          {work.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="font-sans text-[13px] leading-relaxed text-on-surface-variant/90 line-clamp-3 mb-6">
                        {work.description || "Chưa có mô tả cho tác phẩm này."}
                      </p>
                    </div>

                    {/* Footer Stats & Avatars */}
                    <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-ink-charcoal/[0.06] mt-auto">
                      <div className="flex items-center gap-2.5">
                        {/* Contributors Avatars */}
                        <div className="flex items-center gap-1.5">
                          {(work.contributors || [work.author_nickname])
                            .slice(0, 3)
                            .map((name: string, i: number) => (
                              <div key={i} className="relative group/avatar">
                                <div className="w-6 h-6 rounded-md border border-ink-charcoal/[0.08] bg-ink-charcoal/[0.03] text-ink-charcoal/80 flex items-center justify-center font-bold text-[10px] tracking-wide uppercase select-none transition-colors duration-200 hover:bg-ink-charcoal/[0.06] hover:text-ink-charcoal">
                                  {name.substring(0, 1).toUpperCase()}
                                </div>
                                {/* CSS Tooltip */}
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#fcfaf8] text-ink-charcoal border border-ink-charcoal/10 text-[9px] uppercase tracking-widest font-semibold rounded-md opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-sm before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#fcfaf8]">
                                  {name}
                                </span>
                              </div>
                            ))}
                          {(work.contributors || [work.author_nickname]).length > 3 && (
                            <div className="relative group/avatar">
                              <div className="w-6 h-6 rounded-md border border-ink-charcoal/[0.08] bg-ink-charcoal/[0.03] text-ink-charcoal/50 flex items-center justify-center font-bold text-[9px] select-none">
                                +{(work.contributors || [work.author_nickname]).length - 3}
                              </div>
                              {/* Tooltip listing remaining contributors */}
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-[#fcfaf8] text-ink-charcoal border border-ink-charcoal/10 text-[9px] uppercase tracking-widest font-semibold rounded-md opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-sm before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#fcfaf8]">
                                {(work.contributors || [work.author_nickname]).slice(3).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {work.contributorCount} người viết • {work.sentenceCount} câu
                        </span>
                      </div>

                      {/* Time Badge */}
                      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium bg-ink-charcoal/[0.03] px-2.5 py-1 rounded-md border border-ink-charcoal/[0.06]">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{formatTimeAgo(work.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>

            <p className="text-center text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold mt-2 select-none">
              Kéo để khám phá thêm →
            </p>
          </>
        )}
      </div>

      {selectedWork && (
        <WorkPreviewModal
          work={selectedWork}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          isOwner={userId === selectedWork.created_by}
          initialSaved={selectedWork.isSavedByUser}
        />
      )}
    </section>
  );
}
