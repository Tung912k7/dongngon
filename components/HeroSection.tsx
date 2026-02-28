"use client";

import Image from "next/image";
import BrandHeader from "@/components/BrandHeader";
import SearchBar from "@/components/SearchBar";
import { LinkedButton } from "@/components/PrimaryButton";

const HeroSection = () => {
    return (
        <section className="min-h-[100dvh] h-full w-screen flex flex-col justify-center items-center relative overflow-hidden bg-white text-black snap-start shrink-0">
             <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 h-full flex flex-col justify-center relative w-full">
          
                {/* Hero Content - Flexible Flexbox Layout */}
                <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] gap-6 md:gap-10 pb-6 md:pb-12 w-full">
                    <BrandHeader />
                    
                    <p className="text-center font-be-vietnam text-lg md:text-xl text-gray-600 max-w-2xl px-4 sm:px-0">
                      Lần đầu tiên, một dự án viết văn kiểu mới. Nơi mọi người cùng nhau tạo nên những tác phẩm độc đáo, không giới hạn.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full justify-center px-4 sm:px-0">
                        <LinkedButton href="/kho-tang" className="w-full sm:w-auto px-8 py-3 md:px-12 md:py-3 text-xl md:text-2xl shadow-md">
                            Bắt Đầu Viết
                        </LinkedButton>
                    </div>
                    
                    {/* Scroll Down Indicator */}
                    <div className="flex flex-col items-center gap-1 mt-4 md:mt-8 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                    <span className="font-quicksand text-base md:text-lg font-medium">Cuộn để xem thêm</span>
                    <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="m7 6 5 5 5-5" />
                        <path d="m7 13 5 5 5-5" />
                    </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
