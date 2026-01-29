"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Contribution } from "@/types/database";

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

  const supabase = createClient();

  useEffect(() => {
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
          console.log("Change received!", payload);
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
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = contributions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-lg leading-[1.8] text-gray-800 font-be-vietnam">
        {currentItems.map((contribution, index) => {
          const absoluteIndex = index + startIndex;
          const prevContribution = absoluteIndex > 0 ? contributions[absoluteIndex - 1] : null;
          
          // Logic for adding space in '1 kí tự' mode
          let content = contribution.content;
          const isCharacterMode = limitType === 'character';
          
          if (isCharacterMode && prevContribution) {
            const prevContent = prevContribution.content;
            const lastCharOfPrev = prevContent.trim().slice(-1);
            const punctuationRegex = /[.,!?;:]/;
            
            // Add space if previous ends with punctuation (even if it has a trailing space)
            // and current doesn't already start with a space
            if (punctuationRegex.test(lastCharOfPrev) && !content.startsWith(' ')) {
              content = ' ' + content;
            }
          }

          return (
            <span 
              key={contribution.id} 
              className={`animate-in fade-in slide-in-from-bottom-2 duration-500 ${!isCharacterMode ? "mr-1.5" : ""}`}
            >
              {content}
            </span>
          );
        })}
        {contributions.length === 0 && (
            <p className="text-gray-400 italic text-center py-10">Chưa có nội dung. Hãy là người đầu tiên đóng góp.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-2 border-black rounded-xl font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            QUAY LẠI
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl border-2 border-black font-bold text-sm transition-all ${
                  currentPage === i + 1 ? "bg-black text-white" : "hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-2 border-black rounded-xl font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            TIẾP THEO
          </button>
        </div>
      )}
    </div>
  );
}
