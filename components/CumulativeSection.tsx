"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AboutContent from './about/AboutContent';
import ContributionContent from './contribution/ContributionContent';
import PopularContent from './popular/PopularContent';

const CumulativeSection = () => {
  return (
    <section className="relative w-full bg-black text-white">
      <div className="flex flex-col md:flex-row w-full relative">
        {/* Left Sidebar: Minimalist Pattern & Navigation Hook */}
        <aside className="hidden md:flex sticky top-0 h-[100dvh] w-24 lg:w-32 z-30 shrink-0 flex-col border-r border-white/10 bg-black overflow-hidden">
          {/* Pattern Container - Full Height */}
          {/* Pattern Container - Interactive Link */}
          <Link 
            href="https://hoavandaiviet.vn" 
            target="_blank"
            className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center group cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-100 transition-opacity group-hover:opacity-30">
              <div 
                className="relative w-[180vh] h-24 lg:h-32 shrink-0 scale-125"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <Image 
                  src="/pattern/pattern1.png"
                  alt="Hoa văn Đại Việt"
                  fill
                  className="object-fill"
                  priority={true}
                />
              </div>
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="-rotate-90 text-white font-medium text-lg tracking-widest whitespace-nowrap uppercase border border-white/50 px-6 py-2 bg-black/50 backdrop-blur-sm">
                Tìm hiểu thêm
              </div>
            </div>
          </Link>
        </aside>

        {/* Scrollable Content Container */}
        <div className="relative z-20 flex-1 flex flex-col w-full snap-y snap-mandatory md:snap-none">
          
          {/* About Block - Full Screen Page */}
          <section className="h-[100dvh] md:min-h-screen flex items-center justify-center snap-start py-12 md:py-24 px-4 md:px-12 lg:px-20">
            <div className="w-full">
              <AboutContent />
            </div>
          </section>

          {/* Contribution Block - Full Screen Page */}
          <section className="h-[100dvh] md:min-h-screen flex items-center justify-center snap-start py-12 md:py-24 px-4 md:px-12 lg:px-20">
            <div className="w-full">
              <ContributionContent />
            </div>
          </section>

          {/* Popular Works Block - Full Screen Page */}
          <section className="h-[100dvh] md:min-h-screen flex items-center justify-center snap-start py-12 md:py-24 px-4 md:px-12 lg:px-20">
            <div className="w-full">
              <PopularContent />
            </div>
          </section>

        </div>
      </div>
    </section>
  );
};

export default CumulativeSection;
