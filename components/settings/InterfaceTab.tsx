"use client";

import Link from "next/link";

export default function InterfaceTab() {
  return (
    <div className="space-y-12 font-be-vietnam">
      {/* Header Section */}
      <div className="space-y-4">
        <h2 className="font-ganh text-2xl md:text-3xl tracking-tight font-bold text-deep-teal lowercase">
          giao diện & trải nghiệm
        </h2>
        <p className="text-[11px] text-ink-charcoal/50 font-medium tracking-wide leading-relaxed">
          Tùy chỉnh cách bạn tương tác và cảm nhận không gian tại Đồng Ngôn.
        </p>
      </div>

      {/* Help Center Card */}
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-[#eae6e1] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-sm">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
          <div className="w-14 h-14 bg-[#134e4a] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-7 h-7 text-[#faf8f5]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="font-ganh text-2xl tracking-tight text-[#1c1b1a] font-bold lowercase">
              hướng dẫn sử dụng
            </h3>
            <p className="text-[11px] text-ink-charcoal/40 font-medium tracking-wide leading-relaxed max-w-sm">
              Khám phá toàn bộ tính năng và cách vận hành của hệ thống thông qua bộ tài liệu chi
              tiết.
            </p>
          </div>
        </div>

        <Link
          href="/hdsd"
          className="bg-[#134e4a] text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-[10px] hover:bg-[#003633] transition-all whitespace-nowrap z-10 shadow-sm"
        >
          Truy cập ngay
        </Link>
      </div>
    </div>
  );
}
