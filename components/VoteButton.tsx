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
        <div className="px-6 py-3 bg-black text-white border-2 border-black rounded font-ganh text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] opacity-70">
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
        <span className="text-red-600 font-bold text-[10px] uppercase tracking-tighter bg-red-50 px-2 py-0.5 border border-red-600 rounded-sm">
          {error}
        </span>
      )}
      <button
        onClick={handleVote}
        disabled={hasVoted || isLoading}
        className="group relative px-4 py-2 bg-white border-2 border-black rounded transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:translate-0 disabled:shadow-none flex items-center gap-2"
      >
        <span className="font-ganh text-[10px] font-bold uppercase tracking-widest">
          🛑 Kết thúc
        </span>
        <span className="bg-black text-white rounded-md text-[9px] font-black px-1.5 py-0.5 transition-colors group-hover:bg-literary-gold group-hover:text-black">
          {count}/{threshold}
        </span>
      </button>
      <p className="text-[9px] font-bold uppercase tracking-widest text-black/70 max-w-[180px] text-right leading-tight">
        Cần {threshold} phiếu ({Math.floor((threshold / contributorCount) * 100)}%) để đóng tác phẩm
      </p>
    </div>
  );
}
