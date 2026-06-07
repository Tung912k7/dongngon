"use client";

import { useEffect, useMemo, useState } from "react";
import { voteEndWork } from "@/actions/vote";
import { createClient } from "@/utils/supabase/client";

export default function VoteButton({
  workId,
  initialCount,
  isCompleted: initialIsCompleted,
  contributorCount,
}: {
  workId: string;
  initialCount: number;
  isCompleted: boolean;
  contributorCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`work-votes-${workId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "works",
          filter: `id=eq.${workId}`,
        },
        (payload) => {
          // Sync all counts from the new DB columns
          if (payload.new.vote_count !== undefined) {
            setCount(payload.new.vote_count);
          }
          // Note: local threshold depends on contributor_count
          if (payload.new.contributor_count !== undefined) {
            // We could sync this to state if we wanted, but props usually update via router.refresh()
          }
          // Sync completion status
          if (payload.new.status === "finished") {
            setIsCompleted(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workId]);

  // Threshold: More than half of contributors
  const threshold = Math.max(1, Math.floor(contributorCount / 2) + 1);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="px-5 py-2.5 bg-[#134e4a]/10 text-[#134e4a] border border-[#134e4a]/10 rounded-full font-ganh text-xs font-bold uppercase tracking-widest shadow-sm">
          Tác phẩm đã hoàn thành
        </div>
        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
          {count} Phiếu bầu • Quyết định tập thể
        </p>
      </div>
    );
  }

  const handleVote = async () => {
    setIsLoading(true);
    setError(null);

    // Optimistic update
    setCount((prev) => prev + 1);
    setHasVoted(true);

    const result = await voteEndWork(workId);

    if (result.error) {
      setError(result.error);
      // Revert optimistic update
      setCount((prev) => prev - 1);
      setHasVoted(false);
    } else if (result.newCount !== undefined) {
      setCount(result.newCount);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <span className="text-red-700 font-bold text-[10px] uppercase tracking-tighter bg-[#FFF5F5] px-2 py-0.5 border border-red-200 rounded-[4px]">
          {error}
        </span>
      )}
      <button
        onClick={handleVote}
        disabled={hasVoted || isLoading}
        className="group relative px-4 py-2 bg-white border border-[#eae6e1] rounded-full transition-all duration-300 hover:bg-[#134e4a]/5 hover:border-[#134e4a]/30 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center gap-2 cursor-pointer shadow-sm"
      >
        <span className="font-ganh text-[10px] font-bold uppercase tracking-widest text-[#1c1b1a]">
          🛑 Kết thúc
        </span>
        <span className="bg-[#1c1b1a] text-[#faf8f5] rounded-full text-[9px] font-black px-2 py-0.5 transition-colors group-hover:bg-[#134e4a]">
          {count}/{threshold}
        </span>
      </button>
      <p className="text-[9px] font-bold uppercase tracking-widest text-black/70 max-w-[180px] text-right leading-tight">
        Cần {threshold} phiếu ({Math.floor((threshold / contributorCount) * 100)}%) để đóng tác phẩm
      </p>
    </div>
  );
}
