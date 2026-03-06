"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { m, useScroll, useTransform, useSpring } from 'framer-motion';

// Dynamic imports — ssr: false because all three use client-only APIs
const AboutContent = dynamic(() => import('./about/AboutContent'), { ssr: false });
const ContributionContent = dynamic(() => import('./contribution/ContributionContent'), { ssr: false });
const PopularContent = dynamic(() => import('./popular/PopularContent'), { ssr: false });

const CumulativeSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Section 1: About
  const opacityAbout = useTransform(smoothProgress, [0, 0.25, 0.3], [1, 1, 0]);
  const scaleAbout = useTransform(smoothProgress, [0, 0.3], [1, 0.8]);
  const pointerEventsAbout = useTransform(smoothProgress, (pos) => pos <= 0.3 ? "auto" : "none");
  const zIndexAbout = useTransform(smoothProgress, [0.3, 0.301], [30, 0]);

  // Section 2: Contribution
  const opacityContribution = useTransform(smoothProgress, [0.3, 0.35, 0.6, 0.65], [0, 1, 1, 0]);
  const scaleContribution = useTransform(smoothProgress, [0.3, 0.35, 0.6, 0.65], [0.8, 1, 1, 0.8]);
  const pointerEventsContribution = useTransform(smoothProgress, (pos) => (pos > 0.3 && pos <= 0.65) ? "auto" : "none");
  const zIndexContribution = useTransform(smoothProgress, [0.3, 0.301, 0.65, 0.651], [0, 30, 30, 0]);

  // Section 3: Popular
  const opacityPopular = useTransform(smoothProgress, [0.65, 0.7, 1], [0, 1, 1]);
  const scalePopular = useTransform(smoothProgress, [0.65, 0.7, 1], [0.8, 1, 1]);
  const pointerEventsPopular = useTransform(smoothProgress, (pos) => pos > 0.65 ? "auto" : "none");
  const zIndexPopular = useTransform(smoothProgress, [0.65, 0.651], [0, 30]);

  return (
    <section ref={containerRef} className="relative w-full bg-black text-white h-[400vh] sm:h-[400dvh]">
      <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-[#F5F5F5] to-transparent z-20 pointer-events-none"></div>

      <div className="sticky top-0 h-[100dvh] min-h-[600px] w-full flex flex-col md:flex-row overflow-hidden">

        <aside className="hidden md:flex flex-col w-24 lg:w-32 h-full z-30 shrink-0 border-r border-white/10 bg-black">
          <Link
            href="https://hoavandaiviet.vn"
            target="_blank"
            className="relative w-full h-full flex items-center justify-center group cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full opacity-100 transition-opacity group-hover:opacity-30">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: "url('/webp file/pattern1.webp')",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="-rotate-90 text-white font-medium text-lg tracking-widest whitespace-nowrap uppercase border border-white/50 px-6 py-2 bg-black/50 backdrop-blur-sm">
                Tìm hiểu thêm
              </div>
            </div>
          </Link>
        </aside>

        <main className="relative flex-1 w-full h-full">

          <m.div
            style={{
              opacity: opacityAbout,
              scale: scaleAbout,
              pointerEvents: pointerEventsAbout,
              zIndex: zIndexAbout,
            }}
            className="absolute inset-0 flex items-center justify-center px-4 md:px-12 lg:px-20 pt-20 md:pt-0"
          >
            <div className="w-full max-w-5xl">
              <AboutContent />
            </div>
          </m.div>

          <m.div
            style={{
              opacity: opacityContribution,
              scale: scaleContribution,
              pointerEvents: pointerEventsContribution,
              zIndex: zIndexContribution,
            }}
            className="absolute inset-0 flex items-center justify-center px-4 md:px-12 lg:px-20 pt-20"
          >
            <div className="w-full max-w-5xl">
              <ContributionContent />
            </div>
          </m.div>

          <m.div
            style={{
              opacity: opacityPopular,
              scale: scalePopular,
              pointerEvents: pointerEventsPopular,
              zIndex: zIndexPopular,
            }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-12 lg:px-20 pt-20 md:pt-[10vh] lg:pt-[12vh]"
          >
            <div className="w-full max-w-6xl">
              <PopularContent />
            </div>
          </m.div>

        </main>
      </div>
    </section>
  );
};

export default CumulativeSection;
