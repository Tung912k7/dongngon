"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import FooterQuote from "./FooterQuote";
import { PROSE_SUBCATEGORIES } from "@/data/workTypes";

export default function Footer() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isLoveOpen, setIsLoveOpen] = useState(false);

  const proseLinks = PROSE_SUBCATEGORIES;
  const poetryLinks = ["Tự do", "Tứ ngôn", "Ngũ ngôn", "Lục ngôn", "Thất ngôn", "Bát ngôn"];

  const formHref = (form: string) => ({
    pathname: "/kho-tang",
    query: { form },
  });

  const columnHeadingClass =
    "font-ganh font-medium tracking-tight text-[#2C2B29] text-[24px] md:text-[28px]";
  const columnLinkClass =
    "font-be-vietnam font-light text-[#2C2B29]/75 hover:text-black transition-colors duration-300 w-fit text-[16px] md:text-[18px]";

  return (
    <>
      <footer className="w-full mt-auto bg-[#F9F8F4] text-[#2C2B29] pt-20 lg:pt-32 pb-4">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 flex flex-col md:flex-row justify-between items-start gap-16 md:gap-12 pb-16">
          <section className="w-full max-w-sm flex flex-col gap-8 items-start">
            <button
              onClick={() => setIsLoveOpen(true)}
              className="transition-opacity hover:opacity-80"
              aria-label="Mở lời nhắn yêu thương"
            >
              <Image
                src="/webp file/logo.webp"
                alt="Đồng ngôn Logo"
                width={160}
                height={160}
                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-sm"
              />
            </button>

            <FooterQuote />
          </section>

          <div className="flex flex-row flex-wrap sm:flex-nowrap justify-start lg:justify-end gap-12 md:gap-20 lg:gap-24">
            <nav aria-label="Danh mục Văn" className="flex flex-col items-start min-w-[100px] gap-6">
              <h3 className={columnHeadingClass}>Văn</h3>
              <ul className={`flex flex-col items-start gap-4 ${columnLinkClass}`}>
                {proseLinks.map((label) => (
                  <li key={label}>
                    <Link href={formHref(label)} prefetch={false} className="transition-opacity hover:opacity-70">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Danh mục Thơ" className="flex flex-col items-start min-w-[100px] gap-6">
              <h3 className={columnHeadingClass}>Thơ</h3>
              <ul className={`flex flex-col items-start gap-4 ${columnLinkClass}`}>
                {poetryLinks.map((label) => (
                  <li key={label}>
                    <Link href={formHref(label)} prefetch={false} className="transition-opacity hover:opacity-70">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Liên kết Kết nối" className="flex flex-col items-start min-w-[100px] gap-6">
              <h3 className={columnHeadingClass}>Kết nối</h3>
              <ul className={`flex flex-col items-start gap-4 ${columnLinkClass}`}>
                <li>
                  <a
                    href="https://forms.gle/2ENzFe3rdUhkXTP59"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-70"
                  >
                    Góp ý
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => setIsDonateOpen(true)}
                    className="text-left transition-opacity hover:opacity-70"
                  >
                    Giải cứu admin
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="w-full border-t border-black/5 pt-6 pb-2 mt-10 md:mt-20">
          <p className="mx-auto max-w-7xl px-8 text-center font-be-vietnam text-[13px] md:text-[14px] font-light tracking-[0.01em] text-[#2C2B29]/50">
            © 2025 ĐỒNG NGÔN. Một dự án bởi chúng mình <span className="text-[#2C2B29]/60">❤️</span>
          </p>
        </div>
      </footer>

      {/* Love Modal */}
      <AnimatePresence>
        {isLoveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoveOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            
            <m.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-white border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-xs w-full flex flex-col items-center text-center"
            >
              <div className="mb-4 text-4xl animate-bounce">❤️</div>
              <p className="text-2xl font-bold text-black italic">
                &quot;Yêu bé nhiều :33&quot;
              </p>
              <button 
                onClick={() => setIsLoveOpen(false)}
                className="mt-6 px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95"
              >
                Đóng
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <AnimatePresence>
        {isDonateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDonateOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 rounded-lg shadow-xl max-w-sm w-full flex flex-col items-center"
            >
              <button 
                onClick={() => setIsDonateOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <p className="text-center text-xl font-medium text-black mb-4">
                Cảm ơn bạn đã đồng hành cùng Đồng ngôn!
              </p>
              
              <div className="w-64 h-64 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
                <m.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full h-full p-2 relative"
                >
                  <Image
                    src="/webp file/qr.webp"
                    alt="Mã QR Ủng hộ"
                    fill
                    sizes="256px"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </m.div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
