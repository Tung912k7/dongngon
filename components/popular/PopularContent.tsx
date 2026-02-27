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
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 lg:gap-10 relative z-0 w-full px-4 mt-8">
        {popularWorks.map((work, index) => {
          const isFeatured = popularWorks.length === 3 ? index === 1 : index === 0;

          return (
            <Link href={`/work/${work.id}`} key={work.id} className="flex flex-col items-center group cursor-pointer">
              
              {/* Star Crown for Featured */}
              <div className={`h-8 mb-2 flex items-end transition-opacity duration-500 ${isFeatured ? 'opacity-100' : 'opacity-0'}`}>
                {isFeatured && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1"/>
                  </svg>
                )}
              </div>

              {/* Card Body (Book Cover Aesthetic) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative w-36 h-48 md:w-48 md:h-72 lg:w-64 lg:h-96 rounded-l-md rounded-r-xl flex items-center justify-center p-6 transition-all duration-500 overflow-hidden ${
                  isFeatured 
                    ? 'bg-gradient-to-br from-white/[0.12] via-white/[0.02] to-black border-y border-l border-white/30 shadow-[10px_10px_30px_rgba(0,0,0,0.8),_inset_1px_1px_1px_rgba(255,255,255,0.1)] -translate-y-4 lg:-translate-y-8 group-hover:-translate-y-6 lg:group-hover:-translate-y-10 group-hover:shadow-[15px_15px_35px_rgba(0,0,0,0.9),_0_0_40px_rgba(255,215,0,0.15)] group-hover:border-yellow-500/40' 
                    : 'bg-gradient-to-br from-white/[0.06] to-transparent border-y border-l border-white/10 opacity-70 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:shadow-[10px_10px_30px_rgba(0,0,0,0.8)] group-hover:border-white/20'
                }`}
              >
                {/* Pages edge on the right */}
                <div className="absolute right-0 top-0 bottom-0 w-[4%] bg-gradient-to-r from-transparent to-white/[0.05] rounded-r-xl border-l border-white/[0.02]"></div>
                
                {/* Book spine texture */}
                <div className="absolute left-0 top-0 bottom-0 w-[8%] bg-gradient-to-r from-black/60 to-transparent border-r border-white/5"></div>
                <div className="absolute left-[8%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                
                <span className="text-white font-ganh text-lg md:text-xl lg:text-3xl tracking-wide text-center leading-snug break-words z-10 drop-shadow-lg">
                  {work.title}
                </span>

                {/* Subtle base glow for featured */}
                {isFeatured && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 bg-yellow-500/10 blur-2xl rounded-full"></div>
                )}
              </motion.div>

              {/* Label below card */}
              <div className={`mt-6 md:mt-8 flex flex-col items-center gap-1 transition-all duration-300 ${isFeatured ? 'text-yellow-50/90 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'text-gray-400 group-hover:text-gray-200'}`}>
                <p className="font-be-vietnam text-[10px] md:text-xs uppercase tracking-[0.2em] font-light">
                  Phép màu từ
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-ganh text-xl md:text-3xl">{work.contributor_count}</span>
                  <span className="font-be-vietnam text-xs font-light">người</span>
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
