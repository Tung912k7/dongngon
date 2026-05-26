"use client";

import { useCallback } from "react";
import { LinkedButton } from "@/components/PrimaryButton";
import HowItWorks from "@/components/HowItWorks";
import GridBackground from "./GridBackground";
import { captureClientEvent } from "@/utils/posthog-client";

const HeroSectionV2 = () => {
  const handleStartClick = useCallback(() => {
    void captureClientEvent("cta_click", { label: "Bắt đầu", page: "homepage" });
  }, []);

  return (
    <section className="min-h-[100dvh] h-full w-screen flex flex-col justify-center items-center relative overflow-hidden bg-white text-black snap-start shrink-0 font-['Be_Vietnam_Pro']">
      {/* Brutalist Grid Background */}
      <GridBackground opacity={0.2} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 h-full flex flex-col justify-center relative w-full z-10">
        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] gap-8 md:gap-12 pb-6 md:pb-12 w-full">
          <div className="text-center space-y-4 pt-10 md:pt-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-black uppercase">
              Đồng ngôn
            </h1>
            <p className="text-xl md:text-3xl font-bold text-literary-gold uppercase tracking-tight">
              {/*Cộng tác sáng tác. Mỗi người một câu.*/}
              [Slogan - Chúng mình đợi đề xuất của mọi người]
            </p>
          </div>

          <p className="text-center text-base md:text-lg text-black/80 max-w-xl px-4 sm:px-0 leading-relaxed font-medium">
            {/*Đồng ngôn là một không gian mở, nơi mọi người thể hiện sự sáng tạo, cá tính của bản thân qua những câu văn. Những câu văn đó rồi sẽ dẫn câu chuyện đi đến đâu?*/}
            Đồng ngôn là địa hạt của những lời nói vừa của riêng mình mà không của riêng ai. Tại nơi đây, chữ chồng lên chữ, hồn chất lên hồn, sinh nghệ thuật.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 w-full justify-center px-4 sm:px-0">
            <LinkedButton
              href="/dang-nhap"
              ariaLabel="Bắt đầu: tạo hoặc tham gia một tác phẩm mới"
              onClick={handleStartClick}
              className="w-full sm:w-[240px] md:w-[300px] !py-4 md:!py-5 !text-xl md:!text-2xl !rounded-[4px] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 hover:!bg-literary-gold hover:!text-white hover:!border-literary-gold active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
            >
              Bắt đầu
            </LinkedButton>
            <LinkedButton
              href="/hdsd"
              inverse
              ariaLabel="Hướng dẫn: cách sử dụng Đồng ngôn"
              className="w-full sm:w-[240px] md:w-[300px] !py-4 md:!py-5 !text-xl md:!text-2xl !rounded-[4px] border-2 border-black hover:bg-literary-gold hover:border-literary-gold hover:text-white active:scale-[0.98] transition-all"
            >
              Hướng dẫn
            </LinkedButton>
          </div>

          <p className="mt-3 text-sm text-black/60">Trải nghiệm ngay!!!</p>

          {/* How it works microflow */}
          <HowItWorks />

          {/* Scroll Down Indicator */}
          <div className="flex flex-col items-center gap-3 mt-8 animate-bounce cursor-pointer group">
            <span className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-black/40 group-hover:text-black transition-colors">
              Cuộn để xem thêm
            </span>
            <div className="w-8 h-8 flex items-center justify-center border-2 border-black rounded-full group-hover:bg-black group-hover:text-white transition-all">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV2;
