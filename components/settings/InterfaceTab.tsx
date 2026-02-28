"use client";

export default function InterfaceTab() {

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Giao diện & Trải nghiệm</h3>
        <p className="text-gray-500">Tùy chỉnh giao diện hiển thị theo sở thích của bạn.</p>
      </div>

      <div className="space-y-6">
        {/* Web Guide */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-black text-white rounded-[2rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-sm">Hướng dẫn sử dụng (Web Guide)</h4>
            <p className="text-xs text-gray-400">Xem tài liệu hướng dẫn chi tiết cách tham gia viết và tương tác tại Đồng Ngôn.</p>
          </div>
          <button 
            onClick={() => alert("Tính năng đang phát triển")}
            className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2 shrink-0 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
            Xem ngay
          </button>
        </div>
      </div>
    </div>
  );
}
