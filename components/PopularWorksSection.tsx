"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

interface WorkWithCount {
  id: string;
  title: string;
  contributor_count: number;
}

const PopularWorksSection = () => {
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

  if (isLoading || popularWorks.length === 0) return null;

  return (
    <section className="relative w-full min-h-screen bg-black text-white py-20 flex flex-col items-center justify-center gap-16 md:gap-24 overflow-hidden z-20">
      {/* Sidebar Pattern */}
      <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center justify-center h-full pointer-events-none border-r border-white/10 bg-black overflow-hidden bg-black/40">
          <div className="relative h-full w-20 md:w-24 lg:w-28 flex items-center justify-center">
             <div className="relative w-full h-full">
                 <div 
                   className="w-full h-full"
                   style={{
                     backgroundImage: "url('/pattern/pattern1.png')",
                     backgroundRepeat: 'repeat-y',
                     backgroundPosition: 'center top',
                     backgroundSize: '100% auto' 
                   }}
                 />
             </div>
          </div>
      </div>
      {/* 1. Title */}
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="font-be-vietnam text-3xl md:text-5xl font-medium text-center relative z-40 px-4"
      >
        Các tác phẩm phổ biến
      </motion.h2>

      {/* 2. Cards Container */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-12 md:gap-8 lg:gap-16 relative z-40 w-full px-4">
        {popularWorks.map((work, index) => {
          const isFeatured = popularWorks.length === 3 ? index === 1 : index === 0;

          return (
            <div key={work.id} className="flex flex-col items-center">
              {/* Card Body */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: isFeatured ? -30 : 0 }}
                className="relative w-48 md:w-52 lg:w-64 h-[320px] md:h-[400px] lg:h-[480px] bg-white rounded-[1.5rem] flex items-center justify-center p-8 shadow-2xl transition-transform hover:scale-105"
              >
                <span className="text-black font-be-vietnam text-lg lg:text-xl font-semibold text-center leading-snug break-words">
                  {work.title}
                </span>

                {/* Star - Half visible on bottom edge */}
                {isFeatured && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="#FFD700" className="drop-shadow-[0_0_15px_rgba(255,193,7,0.5)]">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                )}
              </motion.div>

              {/* Label */}
              <div className="mt-14 text-center">
                <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest">Số người đã đóng góp</p>
                <p className="text-xl font-bold">{work.contributor_count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PopularWorksSection;
