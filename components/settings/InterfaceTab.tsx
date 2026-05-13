"use client";

import Link from "next/link";

export default function InterfaceTab() {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="space-y-4">
        <h2 className="font-ganh text-2xl md:text-3xl uppercase tracking-tight font-black text-black">
          Giao diện & Trải nghiệm
        </h2>
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
          Tùy chỉnh cách bạn tương tác và cảm nhận không gian tại Đồng Ngôn.
        </p>
      </div>

      {/* Help Center Card */}
      <div className="bg-[#f5f5f5] p-10 md:p-12 rounded-[3rem] border-2 border-black flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
          <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shrink-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-ganh text-2xl uppercase tracking-tight text-black font-black">Hướng dẫn sử dụng</h3>
            <p className="text-[11px] text-black/40 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
              Khám phá toàn bộ tính năng và cách vận hành của hệ thống thông qua bộ tài liệu chi tiết.
            </p>
          </div>
        </div>

        <Link
          href="/hdsd"
          className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap z-10"
        >
          Truy cập ngay
        </Link>
      </div>
    </div>
  );
}

