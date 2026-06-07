"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { m } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// ─── Physics constants ───────────────────────────────────────────────────────
const FRICTION = 0.94; // velocity decay per frame (higher = longer glide)
const MIN_VELOCITY = 0.5; // stop momentum below this px/frame

// ─── Types ───────────────────────────────────────────────────────────────────
type Quote = {
  id: string;
  text: string;
  author: string;
  source: string | null;
  author_profession: string | null;
};

type QuoteState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | { status: "success"; quotes: Quote[] };

// ─── Static data ─────────────────────────────────────────────────────────────
const BG = [
  "bg-[#F4ECE1] text-[#1C1B1A]", // Warm Antique Paper
  "bg-[#E2EAE6] text-[#003633]", // Editorial Sage
  "bg-[#F5EBE7] text-[#1C1B1A]", // Soft Antique Rose
  "bg-[#F2EADF] text-[#1C1B1A]", // Warm Sand
  "bg-[#E4ECF0] text-[#134E4A]", // Soft Mist Blue
];
const SEALS = ["ĐỒNG\nNGÔN", "TĨNH\nTÂM", "CẢM\nHỨNG", "ĐỒNG\nHÀNH", "NGUYÊN\nSƠ"];

const isHeroProfession = (profession?: string | null) => {
  if (!profession) return false;
  const p = profession.toLowerCase().trim();
  return p.includes("cố thủ tướng") || p.includes("liệt sĩ") || p.includes("chính trị gia");
};

// ─── Custom hook: drag-to-scroll with momentum ────────────────────────────────
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);

  // All drag state in refs — no re-renders needed
  const isDragging = useRef(false);
  const originX = useRef(0);
  const originScrollLeft = useRef(0);
  const velX = useRef(0); // px/ms
  const prevX = useRef(0);
  const prevT = useRef(0);
  const rafId = useRef<number | null>(null);

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
    cancelMomentum();

    // Capture pointer so we keep receiving events even outside the element
    el.setPointerCapture(e.pointerId);

    isDragging.current = true;
    originX.current = e.clientX;
    originScrollLeft.current = el.scrollLeft;
    prevX.current = e.clientX;
    prevT.current = performance.now();
    velX.current = 0;

    // Disable CSS scroll-snap during drag so the browser doesn't fight us
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

    // Track instantaneous velocity with EMA smoothing
    if (dt > 0) {
      const rawVel = dx / dt; // px/ms
      velX.current = velX.current * 0.4 + rawVel * 0.6;
    }
    prevX.current = e.clientX;
    prevT.current = now;

    // Directly set scrollLeft — 1:1 with finger movement, no multiplier
    el.scrollLeft = originScrollLeft.current - (e.clientX - originX.current);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const el = ref.current;
    isDragging.current = false;
    if (el) {
      el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
      // Restore snap after momentum settles (or immediately if almost stopped)
      const restoreSnap = () => {
        if (el) el.style.scrollSnapType = "";
      };
      if (Math.abs(velX.current) < 0.1) {
        restoreSnap();
      } else {
        // scale px/ms → px/frame (assume ~60fps = 16ms)
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

  return { ref, onPointerDown, onPointerMove, onPointerUp };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InspirationFlow() {
  const supabase = useMemo(() => createClient(), []);
  const [quoteState, setQuoteState] = useState<QuoteState>({ status: "loading" });
  const [shouldLoad, setShouldLoad] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const {
    ref: containerRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  } = useDragScroll();

  // ── Lazy-load trigger ──
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Fetch from Supabase ──
  useEffect(() => {
    if (!shouldLoad) return;
    let alive = true;
    (async () => {
      const [response] = await Promise.all([
        supabase
          .from("quotes")
          .select("id, text, author, source, author_profession")
          .eq("is_active", true),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      const { data, error } = response;
      if (!alive) return;
      if (error || !data?.length) {
        setQuoteState({ status: error ? "error" : "empty" });
        return;
      }
      const quotes = data.filter((q): q is Quote => Boolean(q?.id && q?.text && q?.author));
      const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5);
      setQuoteState(
        shuffledQuotes.length ? { status: "success", quotes: shuffledQuotes } : { status: "empty" }
      );
    })();
    return () => {
      alive = false;
    };
  }, [shouldLoad, supabase]);

  // ── Button scroll ──
  const scrollBy = (dir: "left" | "right") => {
    containerRef.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  const quotes = quoteState.status === "success" ? quoteState.quotes : [];

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-[#FAF8F5] overflow-hidden relative border-t border-ink-charcoal/[0.04]"
    >
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: `url('/webp/pattern1.webp')`, backgroundSize: "cover" }}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-ink-charcoal/[0.08] pb-6">
          <div>
            {/* Crisp rectangle badge — no rounded-full */}
            <div className="inline-flex items-center rounded px-2.5 py-1 bg-deep-teal/[0.05] border border-deep-teal/12 text-[10px] uppercase tracking-[0.2em] font-medium text-deep-teal mb-3">
              Nguồn cảm hứng bất tận
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink-charcoal tracking-tight">
              Những câu nói hay
            </h2>
          </div>
          {quotes.length > 0 && (
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {/* Crisp square-ish arrow buttons — rounded-md, not rounded-full */}
              {(["left", "right"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => scrollBy(dir)}
                  aria-label={dir === "left" ? "Cuộn trái" : "Cuộn phải"}
                  className="w-11 h-11 rounded-md border border-ink-charcoal/[0.10] bg-white text-ink-charcoal/80 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-ink-charcoal hover:text-white hover:border-transparent active:scale-[0.95] min-touch"
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
        </div>

        {/* ── Loading skeleton — crisp rounded-xl ── */}
        {quoteState.status === "loading" && (
          <div className="flex gap-6 pb-8 pt-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[290px] sm:w-[320px] h-[380px] rounded-xl bg-ink-charcoal/[0.03] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ── Maintenance — crisp rounded-xl ── */}
        {(quoteState.status === "empty" || quoteState.status === "error") && (
          <div className="w-full h-[220px] rounded-xl p-8 flex flex-col justify-center items-center bg-white border border-ink-charcoal/[0.06] text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            <h3 className="font-serif font-bold text-2xl tracking-tight text-ink-charcoal mb-2">
              Đang Bảo Trì
            </h3>
            <p className="font-sans text-on-surface-variant/80 italic">
              Hệ thống đang được cập nhật, vui lòng quay lại sau.
            </p>
          </div>
        )}

        {/* ── Scrollable strip ── */}
        {quotes.length > 0 && (
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
              {quotes.map((item, idx) => {
                const isHero = isHeroProfession(item.author_profession);
                const isLongQuote = item.text.length > 100;
                return (
                  /* Double-Bezel Outer Shell — crisp rounded-xl */
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: idx * 0.06 }}
                    className={`flex-shrink-0 w-[80vw] ${idx % 2 === 0 ? "sm:w-[310px]" : "sm:w-[350px]"
                      } h-[380px] p-1.5 bg-surface-bright border ${isHero ? "border-[#DA251D]/15 hover:border-[#DA251D]/30" : "border-ink-charcoal/[0.06] hover:border-ink-charcoal/[0.10]"} rounded-xl snap-start relative overflow-hidden select-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.008] active:scale-[0.99] active:opacity-95`}
                  >
                    {/* Inner Core — crisp rounded-xl */}
                    <div
                      className={`w-full h-full rounded-xl p-6 flex flex-col justify-between border ${isHero ? "bg-[#DA251D] text-white border-white/5" : `border-ink-charcoal/[0.06] ${BG[idx % BG.length]}`}`}
                    >
                      <div
                        className={`absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(${isHero ? "#fff" : "#000"}_1px,transparent_1px)] [background-size:16px_16px]`}
                      />

                      {/* Seal */}
                      <div className="flex justify-end relative z-10">
                        <div
                          className={`border-[1.5px] p-1 rounded-sm font-serif font-black text-[9px] tracking-widest leading-none uppercase scale-90 origin-top-right ${isHero ? "border-yellow-400 text-yellow-400 bg-yellow-400/10" : "border-red-700/80 text-red-700/80 bg-red-50/50"}`}
                        >
                          <span className="whitespace-pre text-center block leading-tight px-0.5">
                            {SEALS[idx % SEALS.length]}
                          </span>
                        </div>
                      </div>

                      {/* Quote */}
                      <div className="relative z-10 flex-grow flex items-center my-3">
                        <p
                          className={`font-serif italic ${isLongQuote ? "text-[13px] sm:text-[15px]" : "text-[15px] sm:text-[17px]"} leading-relaxed ${idx % 2 === 0 ? "text-left" : "text-center mx-auto"
                            }`}
                        >
                          &ldquo;{item.text}&rdquo;
                        </p>
                      </div>

                      {/* Author */}
                      <div
                        className={`relative z-10 border-t ${isHero ? "border-white/10" : "border-ink-charcoal/5"} pt-3.5 text-center`}
                      >
                        <span
                          className={`text-[11px] sm:text-[12px] font-serif italic ${isHero ? "text-yellow-300/85" : "text-on-surface-variant/65"} block mb-1 leading-relaxed`}
                        >
                          {item.author_profession || "Tác giả"}
                        </span>
                        <span className="font-serif text-base font-bold">— {item.author}</span>
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </div>

            <p className="text-center text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold mt-2 select-none">
              Kéo để khám phá thêm →
            </p>
          </>
        )}
      </div>
    </section>
  );
}
