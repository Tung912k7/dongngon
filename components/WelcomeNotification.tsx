"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/actions/profile";

export default function WelcomeNotification() {
  const [show, setShow] = useState(true);
  const router = useRouter();

  const handleDismiss = async () => {
    setShow(false);
    try {
      await completeOnboarding();
      router.refresh();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-300">
      <div 
        className="bg-white w-[95%] sm:w-[500px] border-2 border-black rounded-[2rem] p-8 sm:p-12 relative text-center shadow-2xl animate-in zoom-in-95 duration-500"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-300"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-20 h-20 bg-gray-50 border-2 border-black rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-black">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.675 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
          </svg>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-ganh font-normal mb-4 text-black tracking-wide leading-tight">
          CHÀO MỪNG BẠN ĐẾN VỚI <br /> ĐỒNG NGÔN!
        </h2>
        
        <p className="font-be-vietnam text-base sm:text-lg text-gray-600 mb-10 px-2 leading-relaxed font-normal">
          Cảm ơn bạn đã tham gia cộng đồng. <br className="hidden md:block" /> 
          Chúc bạn có những phút giây thư giãn và sáng tạo tuyệt vời!
        </p>
        
        <button 
          onClick={handleDismiss}
          className="w-full sm:w-[85%] mx-auto block py-4 bg-black text-white font-ganh text-xl md:text-2xl tracking-wide rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all duration-300"
        >
          Bắt đầu khám phá
        </button>
      </div>
    </div>
  );
}
