"use client";
import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import WorkCard from '@/components/WorkCard';
import { Work } from '@/stores/work-store';
import { formatDate } from '@/utils/date';

interface WorkWithRepoCount extends Work {
  contributor_count: number;
}

const PopularContent = () => {
  const [popularWorks, setPopularWorks] = useState<WorkWithRepoCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularWorks = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('works')
          .select(`
            id, title, category_type, sub_category, 
            status, created_at, author_nickname, 
            created_by, age_rating,
            contributions:contributions(count)
          `)
          .eq('privacy', 'Public')
          .limit(10);

        if (error) throw error;

        if (data) {
          const mapped = data.map((work: any) => ({
            ...work,
            type: work.category_type,
            hinh_thuc: work.sub_category,
            rule: "1 câu",
            date: formatDate(work.created_at),
            rawDate: new Date(work.created_at),
            status: work.status === "writing" ? "Đang viết" :
              work.status === "finished" ? "Hoàn thành" :
                work.status === "pending" ? "Đợi duyệt" : work.status,
            contributor_count: work.contributions?.[0]?.count || 0
          }))
            .sort((a, b) => b.contributor_count - a.contributor_count)
            .slice(0, 3);

          setPopularWorks(mapped);
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
      <div className="w-full flex flex-col items-center justify-center gap-10 py-20 opacity-50">
        <div className="h-10 w-64 bg-white/10 animate-pulse rounded-xl border-2 border-white/20"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full h-80 bg-white/5 animate-pulse rounded-xl border-2 border-white/10"></div>
          ))}
        </div>
      </div>
    );
  }

  if (popularWorks.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 md:gap-16 relative overflow-visible py-8 md:py-20">
      {/* Title Section - Brutalist Header */}
      <div className="w-full max-w-4xl px-4 flex flex-col items-center justify-center gap-4 relative z-20">
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3 md:gap-4"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-4 sm:w-8 h-1 md:h-2 bg-white" />
            <h2 className="font-ganh text-2xl md:text-4xl lg:text-5xl text-white tracking-[0.1em] sm:tracking-[0.15em] text-center uppercase font-bold">
              Bảng xếp hạng
            </h2>
            <div className="w-4 sm:w-8 h-1 md:h-2 bg-white" />
          </div>

          <p className="font-ganh text-[9px] md:text-xs text-white/40 uppercase tracking-[0.3em] sm:tracking-[0.5em] font-bold text-center">
            Khám phá những hạt giống nảy mầm mạnh mẽ nhất
          </p>
        </m.div>
      </div>

      {/* Horizontal Scroll Layout for Mobile / Grid for Desktop */}
      <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-10 lg:gap-12 w-full max-w-6xl mx-auto px-6 md:px-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-10 md:pb-0 relative z-10 transition-all">
        {popularWorks.map((work, index) => (
          <m.div
            key={work.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
            className="relative min-w-[280px] sm:min-w-[320px] md:min-w-0 w-[85vw] md:w-auto snap-center flex-shrink-0"
          >
            {/* Rank Indicator Badge */}
            <div className="absolute -top-2 -left-2 z-30 w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center font-ganh font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {index + 1}
            </div>

            <WorkCard
              work={work}
              variant="home"
              hideMenu={true}
            />

            {/* Contributor Count Footer for Home */}
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border border-white/20 bg-white/10" />
                  ))}
                </div>
                <span className="font-be-vietnam text-[10px] text-white/50 uppercase tracking-widest font-bold">
                  {work.contributor_count} câu
                </span>
              </div>
              <div className="w-8 h-[1px] bg-white/20" />
            </div>
          </m.div>
        ))}
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-32 h-32 border-2 border-white/5 rounded-full -translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-2 border-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none" />
    </div>
  );
};

export default PopularContent;
