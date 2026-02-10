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
      </div>
    </div>
  );
}
