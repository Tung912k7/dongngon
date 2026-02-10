"use client";

import Image from "next/image";
import BrandHeader from "@/components/BrandHeader";

const HeroSection = () => {
    return (
        <section className="h-screen w-screen flex flex-col justify-center items-center relative overflow-hidden bg-white text-black snap-start shrink-0">
             <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 h-full flex flex-col justify-center relative w-full">
          
                {/* Hero Content - Flexible Flexbox Layout */}
                <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] gap-8 md:gap-12 pb-6 md:pb-12 w-full">
                    <BrandHeader />
                    
                    {/* Intro Card - Premium Balanced Refactor */}
                    <div className="w-fit max-w-[90vw] sm:max-w-xl mx-auto bg-white rounded-full border-2 border-black px-5 py-3 sm:px-8 sm:py-5 flex flex-row items-center justify-center gap-4 sm:gap-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10">
                        {/* Logo Container - Circular & Balanced */}
                        <div className="flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-full w-12 h-12 sm:w-28 sm:h-28 overflow-hidden border border-black/5 shadow-sm">
                            <Image
                                src="/logo.png"
                                alt="Đồng ngôn"
                                width={120}
                                height={120}
                                className="object-contain w-8 h-8 sm:w-20 sm:h-20"
                                priority
                            />
                        </div>
            
                        {/* Divider Line - Minimalist Vertical */}
                        <div className="block w-[1.5px] sm:w-[2px] h-8 sm:h-20 bg-black/80 shrink-0"></div>
                        
                        {/* Text Content - Flexible & Readable */}
                        <div className="flex flex-col justify-center min-w-0">
                            <p className="text-black text-[11px] sm:text-base font-medium leading-relaxed font-be-vietnam tracking-tight">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </p>
                        </div>
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
