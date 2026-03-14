"use client";

import Link from "next/link";

export default function InterfaceTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Giao diện & Trải nghiệm</h3>
        <p className="text-gray-500">Tùy chỉnh giao diện hiển thị theo sở thích của bạn.</p>
      </div>

      <div className="space-y-6">
        {/* Wiki */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-black text-white rounded-[2rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-sm">Wiki hướng dẫn</h4>
            <p className="text-xs text-gray-400">Mở theo từng bài ngắn, đúng thứ bạn cần, không cần đọc tài liệu dài.</p>
          </div>
          <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2 shrink-0">
            <Link
              href="/wiki"
              className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21a3 3 0 0 0 3-3V5.25A2.25 2.25 0 0 0 20.25 3H8.25A2.25 2.25 0 0 0 6 5.25V18a3 3 0 0 0 3 3m10.5 0h-10.5m10.5 0v-4.5m-10.5 4.5v-4.5m0 0h10.5" />
              </svg>
              Mở wiki
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
