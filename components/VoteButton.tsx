"use client";

import { useState } from "react";
import { voteEndWork } from "@/actions/vote";

export default function VoteButton({
  workId,
  initialCount,
  isCompleted,
}: {
  workId: string;
  initialCount: number;
  isCompleted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCompleted) {
    return (
      <div className="text-center text-gray-500 font-sans text-sm">
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
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span>🛑 Kết thúc tác phẩm</span>
        <span className="bg-gray-800 text-white rounded-full text-xs px-2 py-0.5">
          {count}/5
        </span>
      </button>
      <p className="text-xs text-gray-400 max-w-xs text-center">
        Tác phẩm sẽ tự động hoàn thành khi đủ 5 phiếu.
      </p>
    </div>
  );
}
