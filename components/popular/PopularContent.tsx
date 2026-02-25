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
    <div className="w-full h-full flex flex-col items-center justify-end pb-6 md:pb-10 lg:pb-16 gap-4 md:gap-6 lg:gap-8">
      {/* 1. Title */}
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="w-full max-w-4xl font-be-vietnam text-xl md:text-2xl lg:text-3xl font-medium relative z-10 px-4 text-center"
      >
        Các tác phẩm phổ biến
      </motion.h2>

      {/* 2. Cards Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 relative z-0 w-full px-4">
        {popularWorks.map((work, index) => {
          const isFeatured = popularWorks.length === 3 ? index === 1 : index === 0;

          return (
            <div key={work.id} className="flex flex-col items-center">
              {/* Card Body */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={`relative w-32 h-48 md:w-44 md:h-64 lg:w-56 lg:h-80 bg-white rounded-xl flex items-center justify-center p-4 shadow-2xl transition-transform hover:scale-105`}
              >
                <span className="text-black font-be-vietnam text-sm md:text-base lg:text-lg font-bold text-center leading-tight break-words px-1">
                  {work.title}
                </span>

                {/* Star - Half visible on bottom edge */}
                {isFeatured && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-50">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="#FFD700" className="drop-shadow-[0_0_15px_rgba(255,193,7,0.5)]">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                )}
              </motion.div>

              {/* Label */}
              <div className="mt-6 md:mt-8 text-center">
                <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">Số người đã đóng góp</p>
                <p className="text-base font-bold">{work.contributor_count}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularContent;
