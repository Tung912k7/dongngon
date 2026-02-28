"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

interface WorkWithCount {
  id: string;
  title: string;
  contributor_count: number;
}

const PopularContent = () => {
  const [popularWorks, setPopularWorks] = useState<WorkWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularWorks = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('works')
          .select(`id, title, contributions:contributions(count)`)
          .eq('privacy', 'Public')
          .limit(10);

        if (error) throw error;

        if (data) {
          const mapped = data.map((work: any) => ({
            id: work.id,
            title: work.title,
            contributor_count: work.contributions[0]?.count || 0
          }))
          .sort((a, b) => b.contributor_count - a.contributor_count)
          .slice(0, 3);

          if (mapped.length === 3) {
            const ordered = [mapped[1], mapped[0], mapped[2]];
            setPopularWorks(ordered);
          } else {
            setPopularWorks(mapped);
          }
        }
      } catch (err) {
        console.error('Error fetching popular works:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopularWorks();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-10 py-10 opacity-50">
        <div className="h-8 w-64 bg-white/10 animate-pulse rounded"></div>
        <div className="flex gap-8">
          {[1, 2, 3].map(i => <div key={i} className="w-40 h-56 bg-white/5 animate-pulse rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (popularWorks.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 md:gap-10 lg:gap-12 relative overflow-hidden py-6 md:py-8 lg:py-12">
      {/* 1. Title Section (Shelf Header) */}
      <div className="w-full max-w-4xl px-4 flex flex-col items-center justify-center gap-2 md:gap-3 relative z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-1"
        >
          <h2 className="font-ganh text-xl md:text-3xl lg:text-4xl text-white tracking-[0.1em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] text-center">
            CÁC TÁC PHẨM PHỔ BIẾN
          </h2>
          <div className="flex items-center gap-2 md:gap-3 w-full justify-center">
            <div className="h-[1px] flex-1 max-w-[40px] md:max-w-[60px] bg-gradient-to-r from-transparent via-white/30 to-white/50"></div>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rotate-45 border border-white/30"></div>
            <div className="h-[1px] flex-1 max-w-[40px] md:max-w-[60px] bg-gradient-to-l from-transparent via-white/30 to-white/50"></div>
          </div>
        </motion.div>
      </div>

      {/* 2. Bookshelf Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 lg:gap-16 relative z-10 w-full px-4 max-w-6xl mx-auto">
        {popularWorks.map((work, index) => {
          const isFeatured = popularWorks.length === 3 ? index === 1 : index === 0;

          return (
            <Link 
              href={`/work/${work.id}`} 
              key={work.id} 
              className="flex flex-col items-center group perspective-1000 w-full md:w-auto active:scale-95 transition-transform"
            >
              <div className="relative mb-2 md:mb-4 lg:mb-6">
                {/* Book Shadow Base */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[105%] h-2 bg-black/60 blur-lg scale-x-90 rounded-full"></div>

                {/* The Book Body */}
                <motion.div
                  initial={{ opacity: 0, rotateY: 15, x: 10 }}
                  whileInView={{ opacity: 1, rotateY: isFeatured ? 0 : -5, x: 0 }}
                  whileHover={{ rotateY: 5, x: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.98, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
                  className={`relative cursor-pointer rounded-l-[1.5px] rounded-r-[4px] transition-all duration-500 transform-style-3d backface-hidden ${
                    isFeatured 
                      ? 'w-28 h-36 md:w-40 md:h-56 lg:w-52 lg:h-72 shadow-[15px_15px_40px_rgba(0,0,0,0.9)] border-white/20' 
                      : 'w-22 h-28 md:w-32 md:h-44 lg:w-40 lg:h-56 shadow-[10px_10px_30px_rgba(0,0,0,0.8)] border-white/10 opacity-80 group-hover:opacity-100'
                  } bg-[#1a1a1a] border-y border-r overflow-hidden`}
                  style={{ willChange: "transform, opacity" }}
                >
                  {/* Spine Detail */}
                  <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-gradient-to-r from-black/80 via-black/40 to-transparent border-r border-white/5 rounded-l-[1px] z-20"></div>
                  
                  {/* Star Icon - Moved Inside as Overlay */}
                  {isFeatured && (
                    <div className="absolute top-1 right-1 md:top-2 md:right-2 z-30 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.5"/>
                      </svg>
                    </div>
                  )}

                  {/* Internal Padding for Content */}
                  <div className="relative h-full w-full p-3 md:p-4 lg:p-6 flex flex-col justify-center items-center z-10 text-center">
                    <span className="font-ganh text-[10px] md:text-sm lg:text-base tracking-wide leading-tight px-1 break-words drop-shadow-md overflow-hidden line-clamp-3">
                      {work.title}
                    </span>
                  </div>

                  {/* Subtle highlight for featured */}
                  {isFeatured && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>
                  )}
                </motion.div>
              </div>

              {/* Contributor Label (Compact) */}
              <div className={`flex flex-col items-center transition-all duration-300 ${isFeatured ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-sm flex flex-col items-center border backdrop-blur-sm ${
                  isFeatured 
                    ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-100/80' 
                    : 'border-white/5 bg-white/5 text-gray-400 font-light'
                }`}>
                  <p className="font-be-vietnam text-[7px] md:text-[8px] lg:text-[9px] uppercase tracking-[0.2em] opacity-50 mb-0.5">
                    Đóng góp bởi
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="font-ganh text-sm md:text-lg lg:text-xl leading-none">{work.contributor_count}</span>
                    <span className="font-be-vietnam text-[8px] md:text-[10px] lowercase">thành viên</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PopularContent;
