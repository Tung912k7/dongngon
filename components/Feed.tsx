"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Contribution } from "@/types/database";
import React from "react";
import ContributionTooltip from "@/components/ContributionTooltip";

const ITEMS_PER_BATCH = 50;

export default function Feed({
  initialContributions,
  workId,
  limitType,
}: {
  initialContributions: Contribution[];
  workId: string;
  limitType?: string;
}) {
  const [contributions, setContributions] = useState<Contribution[]>(
    initialContributions
  );
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContributions(prev => {
      // Merge initialContributions with any existing ones (from realtime), avoiding duplicates
      const existingIds = new Set(initialContributions.map(c => c.id));
      const newFromRealtime = prev.filter(p => !existingIds.has(p.id));
      const updated = [...initialContributions, ...newFromRealtime].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return updated;
    });
  }, [initialContributions]);

  useEffect(() => {
    const channel = supabase
      .channel("realtime contributions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contributions",
          filter: `work_id=eq.${workId}`,
        },
        (payload) => {

          const newContrib = payload.new as Contribution;
          setContributions((prev) => {
            if (prev.find(c => c.id === newContrib.id)) return prev;
            const updatedContributions = [...prev, newContrib].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            return updatedContributions;
          });
          // Auto-expand visible count so new contributions are immediately visible
          setVisibleCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workId]);

  // Infinite scroll: observe sentinel element
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_BATCH, contributions.length));
  }, [contributions.length]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleContributions = contributions.slice(0, visibleCount);
  const hasMore = visibleCount < contributions.length;

  return (
    <div className="flex flex-col gap-12">
      <div className="text-xl md:text-2xl leading-[1.8] text-black font-medium font-be-vietnam content-display italic">
        {visibleContributions.map((contribution, index) => {
          const isSentenceMode = limitType === 'sentence' || limitType === '1 câu';
          
          // Check if previous contribution ends with sentence-ending punctuation
          const prevContribution = index > 0 ? visibleContributions[index - 1] : null;
          const prevEndsWithPunctuation = prevContribution 
            ? /[.?!]$/.test(prevContribution.content.trim()) 
            : false;
          
          // For free verse: auto-capitalize after sentence-ending punctuation
          let displayContent = contribution.content;
          if (contribution.new_line && prevEndsWithPunctuation && displayContent.length > 0) {
            displayContent = displayContent.charAt(0).toUpperCase() + displayContent.slice(1);
          }
          
          return (
            <React.Fragment key={contribution.id}>
              {/* Free verse manual line break */}
              {contribution.new_line && <br />}
              <ContributionTooltip contribution={contribution}>
                <span className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Auto-add space after previous sentence-ending punctuation in free verse */}
                  {prevEndsWithPunctuation && !contribution.new_line && ' '}
                  {displayContent}
                  {!contribution.content.endsWith(' ') && isSentenceMode && ' '}
                </span>
              </ContributionTooltip>
            </React.Fragment>
          );
        })}
        {contributions.length === 0 && (
            <p className="text-gray-400 italic text-center py-10">Chưa có nội dung. Hãy là người đầu tiên đóng góp.</p>
        )}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-black/20 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
              Đang tải thêm...
            </span>
            <div className="w-2 h-2 bg-black/20 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      )}

      {/* Summary when all loaded */}
      {!hasMore && contributions.length > ITEMS_PER_BATCH && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-black/5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
            {contributions.length} dòng • Đã hiển thị tất cả
          </span>
        </div>
      )}
    </div>
  );
}
