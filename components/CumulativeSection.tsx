"use client";
import React, { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Lazy load content components to improve initial bundles
const AboutContent = dynamic(() => import('./about/AboutContent'), { ssr: true });
const ContributionContent = dynamic(() => import('./contribution/ContributionContent'), { ssr: true });
const PopularContent = dynamic(() => import('./popular/PopularContent'), { ssr: true });

const CumulativeSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Use spring for smoother interpolation on mobile/fast scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate opacity and scale based on scroll progress
  // Total scroll range divided into 3 sections
  
  // Section 1: About (Visible from start, fades out around 30%)
  const opacityAbout = useTransform(smoothProgress, [0, 0.25, 0.3], [1, 1, 0]);
  const scaleAbout = useTransform(smoothProgress, [0, 0.3], [1, 0.8]);
  const pointerEventsAbout = useTransform(smoothProgress, (pos) => pos <= 0.3 ? "auto" : "none");

  // Section 2: Contribution (Fades in 30-35%, visible 35-60%, fades out 60-65%)
  const opacityContribution = useTransform(smoothProgress, [0.3, 0.35, 0.6, 0.65], [0, 1, 1, 0]);
  const scaleContribution = useTransform(smoothProgress, [0.3, 0.35, 0.6, 0.65], [0.8, 1, 1, 0.8]);
  const pointerEventsContribution = useTransform(smoothProgress, (pos) => (pos > 0.3 && pos <= 0.65) ? "auto" : "none");

  // Section 3: Popular (Fades in 65-70%, visible until end)
  const opacityPopular = useTransform(smoothProgress, [0.65, 0.7, 1], [0, 1, 1]);
  const scalePopular = useTransform(smoothProgress, [0.65, 0.7, 1], [0.8, 1, 1]);
  const pointerEventsPopular = useTransform(smoothProgress, (pos) => pos > 0.65 ? "auto" : "none");

  // zIndex to ensure correct stacking
  const zIndexAbout = useTransform(smoothProgress, [0.3, 0.301], [30, 0]);
  const zIndexContribution = useTransform(smoothProgress, [0.3, 0.301, 0.65, 0.651], [0, 30, 30, 0]);
  const zIndexPopular = useTransform(smoothProgress, [0.65, 0.651], [0, 30]);

  return (
    <section ref={containerRef} className="relative w-full bg-black text-white h-[400vh]">
      {/* Smooth Transition Gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-[#F5F5F5] to-transparent z-20 pointer-events-none"></div>

      {/* Sticky Container - The Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar: Fixed/Sticky Pattern */}
        <aside className="hidden md:flex flex-col w-24 lg:w-32 h-full z-30 shrink-0 border-r border-white/10 bg-black">
          <Link 
            href="https://hoavandaiviet.vn" 
            target="_blank"
            className="relative w-full h-full flex items-center justify-center group cursor-pointer"
          >
            {/* Pattern Background */}
            <div className="absolute inset-0 w-full h-full opacity-100 transition-opacity group-hover:opacity-30">
               <div 
                 className="w-full h-full"
                 style={{
                   backgroundImage: "url('/pattern/pattern1.png')",
                   backgroundRepeat: 'no-repeat',
                   backgroundPosition: 'center',
                   backgroundSize: 'cover'
                 }}
               />
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="-rotate-90 text-white font-medium text-lg tracking-widest whitespace-nowrap uppercase border border-white/50 px-6 py-2 bg-black/50 backdrop-blur-sm">
                Tìm hiểu thêm
              </div>
            </div>
          </Link>
        </aside>

        {/* Content Container */}
        <main className="relative flex-1 w-full h-full">
          
          {/* About Block */}
          <motion.div 
            style={{ 
              opacity: opacityAbout, 
              scale: scaleAbout,
              pointerEvents: pointerEventsAbout,
              zIndex: zIndexAbout,
              willChange: "opacity, transform"
            }}
            className="absolute inset-0 flex items-center justify-center px-4 md:px-12 lg:px-20"
          >
            <div className="w-full max-w-5xl">
              <AboutContent />
            </div>
          </motion.div>

          {/* Contribution Block */}
          <motion.div 
            style={{ 
              opacity: opacityContribution, 
              scale: scaleContribution,
              pointerEvents: pointerEventsContribution,
              zIndex: zIndexContribution,
              willChange: "opacity, transform"
            }}
            className="absolute inset-0 flex items-center justify-center px-4 md:px-12 lg:px-20"
          >
            <div className="w-full max-w-5xl">
              <ContributionContent />
            </div>
          </motion.div>

          {/* Popular Block */}
          <motion.div 
            style={{ 
              opacity: opacityPopular, 
              scale: scalePopular,
              pointerEvents: pointerEventsPopular,
              zIndex: zIndexPopular,
              willChange: "opacity, transform"
            }}
            className="absolute inset-0 flex flex-col items-center justify-end px-4 md:px-12 lg:px-20 pb-20 md:pb-32"
          >
            <div className="w-full max-w-6xl">
              <PopularContent />
            </div>
          </motion.div>

        </main>
      </div>
    </section>
  );
};

export default CumulativeSection;
