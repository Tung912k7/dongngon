"use client";

import { useState } from "react";

export default function InterfaceTab() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Placeholder state
  const [language, setLanguage] = useState<'vi' | 'en'>('vi'); // Placeholder state

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Giao diện & Trải nghiệm</h3>
        <p className="text-gray-500">Tùy chỉnh giao diện hiển thị theo sở thích của bạn.</p>
      </div>

      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-2 border-black/5 rounded-2xl hover:border-black/20 transition-colors">
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-sm">Chế độ tối (Dark Mode)</h4>
            <p className="text-xs text-gray-500">Sử dụng giao diện nền tối để bảo vệ mắt.</p>
          </div>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`w-14 h-8 shrink-0 rounded-full p-1 transition-colors duration-300 relative ${
              theme === 'dark' ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-2 border-black/5 rounded-2xl hover:border-black/20 transition-colors">
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-sm">Ngôn ngữ (Language)</h4>
            <p className="text-xs text-gray-500">Chọn ngôn ngữ hiển thị chính.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setLanguage('vi')}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition-all ${
                language === 'vi' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              Tiếng Việt
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border-2 transition-all ${
                language === 'en' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:border-gray-300'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Web Guide */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-black text-white rounded-[2rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-sm">Hướng dẫn sử dụng (Web Guide)</h4>
            <p className="text-xs text-gray-400">Xem tài liệu hướng dẫn chi tiết cách tham gia viết và tương tác tại Đồng Ngôn.</p>
          </div>
          <button 
            onClick={() => window.open('/web_guide.pdf', '_blank')}
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
