"use client";

import Link from "next/link";

export default function InterfaceTab() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-gray-900">
          Giao diện & Trải nghiệm
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Tùy chỉnh giao diện hiển thị theo sở thích của bạn.
        </p>
      </div>

      {/* Help Center Card */}
      <div className="bg-[#f5f5f5] p-6 md:p-8 rounded-2xl border border-black/10 transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">

            <div>
              <h3 className="text-lg font-bold text-[#388186] mb-1">Hướng dẫn sử dụng</h3>
              <p className="text-sm text-gray-500">Truy cập hướng dẫn sử dụng và đọc các bài hướng dẫn chi tiết.</p>
            </div>
          </div>

          <Link
            href="/hdsd"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap flex-shrink-0"
          >
            Xem
          </Link>
        </div>
      </div>
    </div>
  );
}
