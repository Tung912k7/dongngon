"use client";

import { useCallback } from "react";
import { m } from "framer-motion";
import { LinkedButton } from "@/components/PrimaryButton";
import { captureClientEvent } from "@/utils/posthog-client";

// Reusable fade-up variant — each element uses this with its own delay.
// Duration 400ms, ease-out curve: starts fast, feels responsive.
const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1] as const,
      delay,
    },
  }),
};

const HeroSectionV2 = () => {
  const handleStartClick = useCallback(() => {
    void captureClientEvent("cta_click", { label: "Bắt đầu", page: "homepage" });
  }, []);

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-16 pt-24 md:pt-32 pb-12 md:pb-16 relative overflow-hidden flex items-center min-h-[70dvh]">
      <div className="max-w-[800px] relative z-10">
        {/* Eyebrow Badge — delay 0ms */}
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center rounded px-2.5 py-1 bg-deep-teal/[0.05] border border-deep-teal/12 text-[10px] uppercase tracking-[0.2em] font-medium text-deep-teal mb-5 md:mb-8"
        >
          Sinh ra từ một cuộc trò chuyện nhỏ đêm khuya
        </m.div>

        {/* Typography — staggered per line */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink-charcoal tracking-tight font-bold mb-6 leading-[1.4] text-balance break-words">
          <m.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.05}
            className="block"
          >
            Nhất ngôn xuất,
          </m.span>
          <m.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="block text-deep-teal italic font-serif font-normal opacity-90"
          >
            vạn kiếp hồi thanh
          </m.span>
        </h1>

        {/* Paragraph — delay 150ms */}
        <m.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="font-sans text-[15px] md:text-[16px] leading-relaxed text-on-surface-variant/90 max-w-[600px] mb-10"
        >
          Nơi những ý tưởng ngẫu hứng và độc đáo hội tụ. Mang đến một trải nghiệm mới mẻ và tràn đầy cảm hứng.
        </m.p>

        {/* CTAs — staggered 200ms + 250ms */}
        <div className="flex flex-col sm:flex-row gap-4">
          <m.div variants={fadeUp} initial="hidden" animate="visible" custom={0.2}>
            <LinkedButton
              href="/kho-tang"
              ariaLabel="Bắt đầu khám phá kho tàng tác phẩm"
              onClick={handleStartClick}
              className="group !bg-ink-charcoal !text-white flex items-center gap-2 hover:!bg-deep-teal !border-ink-charcoal/[0.12] hover:!border-deep-teal/30"
            >
              <span>Bắt đầu</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </LinkedButton>
          </m.div>
          <m.div variants={fadeUp} initial="hidden" animate="visible" custom={0.25}>
            <LinkedButton
              href="/hdsd"
              ariaLabel="Mở sổ tay hướng dẫn sử dụng"
              inverse
              className="hover:!bg-deep-teal hover:!text-white hover:!border-deep-teal/30"
            >
              Sổ tay hướng dẫn
            </LinkedButton>
          </m.div>
        </div>
      </div>

      {/* Soft Ambient Background Glow */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-deep-teal/4 to-accent-gold/4 blur-[140px] -z-10 hidden lg:block pointer-events-none" />
    </section>
  );
};

export default HeroSectionV2;
