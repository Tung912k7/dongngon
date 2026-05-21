"use client";

import BrandHeader from "@/components/BrandHeader";
import { LinkedButton } from "@/components/PrimaryButton";
import HowItWorks from "@/components/HowItWorks";

const HeroSection = () => {
  return (
    <section className="min-h-[100dvh] h-full w-screen flex flex-col justify-center items-center relative overflow-hidden bg-white text-black snap-start shrink-0">
      {/* Brutalist Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.2]"
        style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 h-full flex flex-col justify-center relative w-full z-10">
        {/* Hero Content - Flexible Flexbox Layout */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] md:min-h-[80vh] gap-8 md:gap-12 pb-6 md:pb-12 w-full">
          <div className="transform scale-110 md:scale-125 mb-4">
            <BrandHeader />
          </div>

          <p className="text-center font-be-vietnam text-base md:text-lg text-black/80 max-w-xl px-4 sm:px-0 leading-relaxed font-medium normal-case">
            Nơi nhiều người nối chữ — cùng viết nên tác phẩm chung. Tham gia bằng một câu, tiếp nối
            tác phẩm, khám phá kho tàng sáng tác.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 w-full justify-center px-4 sm:px-0">
            <LinkedButton
              href="/kho-tang"
              ariaLabel="Bắt đầu: tạo hoặc tham gia một tác phẩm mới"
              onClick={() => {
                import("posthog-js").then((m) => {
                  try {
                    m.default.capture("cta_click", { label: "Bắt đầu", page: "homepage" });
                  } catch (e) {
                    // ignore analytics errors
                  }
                });
              }}
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

          <p className="mt-3 text-sm text-black/60">Tạo hoặc tham gia — mọi dòng đều góp phần.</p>

          {/* How it works microflow */}
          <HowItWorks />

          {/* Scroll Down Indicator - Brutalist Style */}
          <div className="flex flex-col items-center gap-3 mt-8 animate-bounce cursor-pointer group">
            <span className="font-ganh text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-black/40 group-hover:text-black transition-colors">
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

export default HeroSection;
