"use client";

import { useState } from "react";
import { voteEndWork } from "@/actions/vote";

export default function VoteButton({
  workId,
  initialCount,
  isCompleted,
  contributorCount,
}: {
  workId: string;
  initialCount: number;
  isCompleted: boolean;
  contributorCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Threshold: More than half of contributors
  // If 0 contributors, default to 1 (or 5, but let's follow user logic)
  const threshold = Math.max(1, Math.floor(contributorCount / 2) + 1);

  if (isCompleted) {
    return (
      <div className="text-center text-gray-500 font-montserrat text-sm">
        Tác phẩm đã hoàn thành ({count} phiếu bầu)
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
    } 
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
       {error && <span className="text-red-500 text-xs">{error}</span>}
      <button
        onClick={handleVote}
        disabled={hasVoted || isLoading}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-montserrat transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>🛑 Kết thúc tác phẩm</span>
        <span className="bg-gray-800 text-white rounded-full text-xs px-2 py-0.5">
          {count}/{threshold}
        </span>
      </button>
      <p className="text-xs text-gray-400 max-w-xs text-center">
        Tác phẩm sẽ tự động hoàn thành khi đủ {threshold} phiếu (hơn 1/2 số người đóng góp).
      </p>
    </div>
  );
}
