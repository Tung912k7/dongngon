"use client";
import { useEffect, useState } from 'react';
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

  if (isLoading || popularWorks.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-end justify-center gap-20 md:gap-16 lg:gap-24">
      {/* 1. Title */}
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="w-full max-w-4xl font-be-vietnam text-3xl md:text-5xl font-medium relative z-10 px-4"
      >
        Các tác phẩm phổ biến
      </motion.h2>

      {/* 2. Cards Container */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-end gap-12 md:gap-8 lg:gap-16 relative z-0 w-full px-4">
        {popularWorks.map((work, index) => {
          const isFeatured = popularWorks.length === 3 ? index === 1 : index === 0;

          return (
            <div key={work.id} className="flex flex-col items-center">
              {/* Card Body */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: isFeatured ? -30 : 0 }}
                className="relative w-44 md:w-48 lg:w-60 h-[280px] md:h-[380px] lg:h-[480px] bg-white rounded-[2.5rem] flex items-center justify-center p-8 shadow-2xl transition-transform hover:scale-105"
              >
                <span className="text-black font-be-vietnam text-xl lg:text-2xl font-bold text-center leading-tight break-words px-4">
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
              <div className="mt-8 md:mt-14 text-center">
                <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest">Số người đã đóng góp</p>
                <p className="text-xl font-bold">{work.contributor_count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularContent;
