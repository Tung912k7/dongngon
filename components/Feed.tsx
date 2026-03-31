"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Contribution } from "@/types/database";
import React from "react";
import ContributionTooltip from "@/components/ContributionTooltip";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workId]);

  const totalPages = Math.ceil(contributions.length / itemsPerPage);

  return (
    <div className="flex flex-col gap-12">
      <div className="text-xl md:text-2xl leading-[1.8] text-black font-medium font-be-vietnam content-display italic">
        {contributions.map((contribution, index) => {
          const isSentenceMode = limitType === 'sentence' || limitType === '1 câu';
          
          // Check if previous contribution ends with sentence-ending punctuation
          const prevContribution = index > 0 ? contributions[index - 1] : null;
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-10 border-t-2 border-black/5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 border-2 border-black rounded-xl font-ganh font-bold text-[10px] uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed hover:-translate-x-1 transition-all"
          >
            &larr; TRƯỚC
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl border-2 border-black font-ganh font-bold text-xs transition-all ${
                  currentPage === i + 1 ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <div className="sm:hidden font-ganh font-bold text-xs">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-2 border-2 border-black rounded-xl font-ganh font-bold text-[10px] uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed hover:translate-x-1 transition-all"
          >
            SAU &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
