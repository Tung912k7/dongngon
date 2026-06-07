"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useZenStore } from "@/stores/zen-store";
import { PROSE_SUBCATEGORIES } from "@/data/workTypes";

export default function Footer() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isLoveOpen, setIsLoveOpen] = useState(false);
  const isZenMode = useZenStore((state) => state.isZenMode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLoveOpen(false);
        setIsDonateOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const proseLinks = PROSE_SUBCATEGORIES;
  const poetryLinks = ["Tự do", "Tứ ngôn", "Ngũ ngôn", "Lục ngôn", "Thất ngôn", "Bát ngôn"];

  const formHref = (form: string) => ({
    pathname: "/kho-tang",
    query: { form },
  });

  return (
    <>
      <AnimatePresence>
        {!isZenMode && (
          <m.footer
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="bg-surface-dim pt-16 md:pt-20 pb-12 md:pb-16 mt-12 md:mt-16 border-t border-mist-grey/50"
          >
            <div className="max-w-[1440px] mx-auto px-6 md:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12 md:mb-16">
              <div className="sm:col-span-2 lg:col-span-2">
                <button
                  onClick={() => setIsLoveOpen(true)}
                  className="font-ganh text-[36px] sm:text-[44px] text-deep-teal tracking-wide block mb-3 hover:tracking-[0.1em] hover:text-accent-gold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] text-left focus:outline-none cursor-pointer"
                  aria-label="Mở lời nhắn yêu thương"
                >
                  Đồng Ngôn
                </button>
                <p className="font-sans text-[14px] leading-relaxed text-on-surface-variant max-w-[360px]">
                  Sáng Tạo - Ngẫu Hứng - Bất Định
                </p>
              </div>

              <div>
                <h4 className="font-sans text-[12px] font-semibold text-ink-charcoal mb-4 uppercase tracking-[0.15em] opacity-80">
                  Văn
                </h4>
                <ul className="space-y-2.5 flex flex-col items-start">
                  {proseLinks.map((label) => (
                    <li key={label}>
                      <Link
                        href={formHref(label)}
                        prefetch={false}
                        className="font-sans text-[14px] text-on-surface-variant/80 hover:text-deep-teal inline-block transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-1"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-sans text-[12px] font-semibold text-ink-charcoal mb-4 uppercase tracking-[0.15em] opacity-80">
                  Thơ
                </h4>
                <ul className="space-y-2.5 flex flex-col items-start">
                  {poetryLinks.map((label) => (
                    <li key={label}>
                      <Link
                        href={formHref(label)}
                        prefetch={false}
                        className="font-sans text-[14px] text-on-surface-variant/80 hover:text-deep-teal inline-block transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-1"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-sans text-[12px] font-semibold text-ink-charcoal mb-4 uppercase tracking-[0.15em] opacity-80">
                  Kết nối
                </h4>
                <ul className="space-y-2.5 flex flex-col items-start">
                  <li>
                    <a
                      href="https://forms.gle/2ENzFe3rdUhkXTP59"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-[14px] text-on-surface-variant/80 hover:text-deep-teal inline-block transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-1"
                    >
                      Góp ý
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/ve-chung-toi"
                      className="font-sans text-[14px] text-on-surface-variant/80 hover:text-deep-teal inline-block transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-1"
                    >
                      Về chúng mình
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsDonateOpen(true)}
                      className="text-left font-sans text-[14px] text-on-surface-variant/80 hover:text-deep-teal inline-block transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-1 focus:outline-none cursor-pointer"
                    >
                      Giải cứu admin
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-16 border-t border-mist-grey/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-sans text-[13px] text-on-surface-variant/65">
                © 2025 ĐỒNG NGÔN. Một dự án bởi chúng mình{" "}
                <span className="text-red-500/80">❤️</span>
              </p>
            </div>
          </m.footer>
        )}
      </AnimatePresence>

      {/* Love Modal */}
      <AnimatePresence>
        {isLoveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsLoveOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-[4px]"
            />

            <m.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
              }}
              exit={{
                scale: 0.96,
                opacity: 0,
                transition: { duration: 0.15, ease: [0.32, 0.72, 0, 1] },
              }}
              className="relative bg-surface-dim/40 backdrop-blur-xl border border-mist-grey/50 p-2 rounded-[32px] max-w-xs w-full shadow-[0_24px_64px_rgba(28,27,26,0.12)] z-10 overflow-hidden"
            >
              <div className="bg-white rounded-[calc(32px-8px)] p-8 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                <div className="mb-4 text-4xl animate-bounce">❤️</div>
                <p className="text-xl font-serif font-bold text-ink-charcoal italic">
                  &quot;Yêu bé nhiều :33&quot;
                </p>
                <button
                  onClick={() => setIsLoveOpen(false)}
                  className="mt-6 px-8 py-2.5 bg-ink-charcoal hover:bg-deep-teal text-white font-sans font-medium text-[13px] rounded-full transition-[transform,background-color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] shadow-sm cursor-pointer focus:outline-none"
                >
                  Đóng
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donation Modal — "Giải cứu admin" */}
      <AnimatePresence>
        {isDonateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsDonateOpen(false)}
              className="absolute inset-0 bg-ink-charcoal/40 backdrop-blur-[6px]"
            />

            {/* Modal Shell — glassmorphism with edge refraction */}
            <m.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
              }}
              exit={{
                scale: 0.96,
                opacity: 0,
                transition: { duration: 0.15, ease: [0.32, 0.72, 0, 1] },
              }}
              className="relative z-10 w-full max-w-sm"
            >
              {/* Outer glass ring */}
              <div className="relative bg-[#FAF8F5]/80 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_32px_80px_rgba(19,78,74,0.18),inset_0_1px_1px_rgba(255,255,255,0.9)] overflow-hidden">
                {/* Ambient teal glow — top-right */}
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 bg-deep-teal/10 rounded-full blur-2xl pointer-events-none"
                  aria-hidden="true"
                />
                {/* Ambient gold glow — bottom-left */}
                <div
                  className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent-gold/8 rounded-full blur-2xl pointer-events-none"
                  aria-hidden="true"
                />

                {/* Close button */}
                <button
                  onClick={() => setIsDonateOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-ink-charcoal/10 bg-white/70 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:bg-white hover:text-ink-charcoal transition-[transform,background-color,color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] cursor-pointer focus:outline-none"
                  aria-label="Đóng"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Header */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
                  className="px-8 pt-8 pb-6 text-center border-b border-ink-charcoal/[0.06]"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-deep-teal/[0.08] border border-deep-teal/12 mb-4">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-deep-teal"
                    >
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  </div>
                  <h2 className="font-ganh text-[22px] font-bold text-ink-charcoal tracking-tight leading-snug mb-2">
                    Giải cứu admin
                  </h2>
                  <p className="font-sans text-[13px] text-on-surface-variant/80 leading-relaxed">
                    Một ly cà phê giúp admin tiếp tục
                    <br />
                    xây dựng Đồng ngôn mỗi ngày.
                  </p>
                </m.div>

                {/* QR Code */}
                <m.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.12 }}
                  className="px-8 py-6 flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="absolute inset-[-6px] rounded-[20px] border border-ink-charcoal/[0.06] bg-ink-charcoal/[0.02]" />
                    <div className="relative w-[220px] h-[220px] rounded-[16px] overflow-hidden border border-ink-charcoal/[0.08] bg-white shadow-[0_4px_16px_rgba(19,78,74,0.08)]">
                      <Image
                        src="/webp/qr.webp"
                        alt="Mã QR chuyển khoản ủng hộ Đồng ngôn"
                        fill
                        sizes="220px"
                        className="object-contain p-2"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </m.div>

                {/* Footer caption */}
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                  className="px-8 pb-7 text-center"
                ></m.div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
