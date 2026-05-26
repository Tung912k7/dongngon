"use client";

import { logger } from "@/lib/logger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VirtuosoHandle } from "react-virtuoso";
import { createClient } from "@/utils/supabase/client";
import { Virtuoso } from "react-virtuoso";
import ContributionTooltip from "./ContributionTooltip";
import { Contribution } from "@/types/database";
import { useContributionSelection } from "./WorkPageLayout";
import { useZenStore } from "@/stores/zen-store";
import { getContributionsChunk } from "@/actions/contribute";

// Extend the base Contribution type to include the joined user_profile
interface FeedContribution extends Contribution {
  user_profile?: {
    pen_name?: string;
    hashtag?: string;
    custom_id?: string;
  };
}

export default function Feed({
  initialContributions,
  workId,
  limitType,
}: {
  initialContributions: FeedContribution[];
  workId: string;
  limitType?: string;
}) {
  const { onSelectContribution, selectedContributionId } = useContributionSelection();
  const isZenMode = useZenStore((state) => state.isZenMode);
  const [contributions, setContributions] = useState<FeedContribution[]>(initialContributions);

  // Infinite scroll state
  const [hasMore, setHasMore] = useState(initialContributions.length >= 50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const bufferRef = useRef<FeedContribution[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const result = await getContributionsChunk(workId, contributions.length, 50);
      if (result.success && result.data) {
        if (result.data.length < 50) {
          setHasMore(false);
        }

        if (result.data.length > 0) {
          setContributions((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newItems = (result.data as FeedContribution[]).filter(
              (c) => !existingIds.has(c.id)
            );
            return [...prev, ...newItems].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      logger.error("Failed to load more contributions:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [workId, contributions.length, isLoadingMore, hasMore]);

  useEffect(() => {
    setContributions((prev) => {
      const existingIds = new Set(initialContributions.map((c) => c.id));
      const newFromRealtime = prev.filter((p) => !existingIds.has(p.id));
      return [...initialContributions, ...newFromRealtime].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    if (initialContributions.length < 50) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [initialContributions]);

  const flushBuffer = useCallback(() => {
    if (bufferRef.current.length === 0) return;

    setContributions((prev) => {
      const newItems = bufferRef.current.filter((item) => !prev.find((p) => p.id === item.id));
      bufferRef.current = [];

      if (newItems.length === 0) return prev;

      return [...prev, ...newItems].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    flushTimeoutRef.current = null;
  }, []);

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
          const newContrib = payload.new as FeedContribution;
          bufferRef.current.push(newContrib);

          if (!flushTimeoutRef.current) {
            flushTimeoutRef.current = setTimeout(flushBuffer, 400);
          }
        }
      )
      .subscribe();

    return () => {
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, workId, flushBuffer]);

  const renderContribution = (index: number, contribution: FeedContribution) => {
    const isSentenceMode = limitType === "sentence" || limitType === "1 câu";
    const prevContribution = index > 0 ? contributions[index - 1] : null;
    const prevEndsWithPunctuation = prevContribution
      ? /[.?!]$/.test(prevContribution.content.trim())
      : false;

    let displayContent = contribution.content;
    if (contribution.new_line && prevEndsWithPunctuation && displayContent.length > 0) {
      displayContent = displayContent.charAt(0).toUpperCase() + displayContent.slice(1);
    }

    const isSelected = selectedContributionId === contribution.id;
    const isSystem = contribution.author_nickname === "Hệ thống";

    const handleClick = () => {
      if (!isSystem && onSelectContribution) {
        onSelectContribution(contribution);
      }
    };

    if (isSystem) {
      return (
        <span
          className="inline animate-in fade-in slide-in-from-bottom-2 duration-500"
          key={contribution.id}
        >
          {contribution.new_line && <br />}
          <span className="text-gray-400 italic">
            {prevEndsWithPunctuation && !contribution.new_line && " "}
            {displayContent}
            {!contribution.content.endsWith(" ") && isSentenceMode && " "}
          </span>
        </span>
      );
    }

    return (
      <span
        className="inline animate-in fade-in slide-in-from-bottom-2 duration-500"
        key={contribution.id}
      >
        {contribution.new_line && <br />}
        {/* Desktop: click to select for sidebar */}
        <span className="hidden lg:inline">
          <span
            onClick={handleClick}
            className={`cursor-pointer transition-all duration-200 ease-out
              underline decoration-transparent decoration-2 underline-offset-[5px]
              ${!isZenMode ? "hover:decoration-[#D4AF37]/50" : ""}
              ${isSelected && !isZenMode ? "decoration-[#D4AF37] bg-[#D4AF37]/10" : ""}
            `}
            title={`Bởi ${contribution.author_nickname}`}
          >
            {prevEndsWithPunctuation && !contribution.new_line && " "}
            {displayContent}
            {!contribution.content.endsWith(" ") && isSentenceMode && " "}
          </span>
        </span>
        {/* Mobile: tooltip popup */}
        <span className="lg:hidden inline">
          <ContributionTooltip contribution={contribution}>
            <span className="cursor-help">
              {prevEndsWithPunctuation && !contribution.new_line && " "}
              {displayContent}
              {!contribution.content.endsWith(" ") && isSentenceMode && " "}
            </span>
          </ContributionTooltip>
        </span>
      </span>
    );
  };

  // Auto-select the first non-system contribution on initial load (desktop only)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024 && contributions.length > 0) {
      const first = contributions.find((c) => c.author_nickname !== "Hệ thống");
      if (first && !selectedContributionId) {
        onSelectContribution(first);
      }
    }
  }, [contributions, onSelectContribution, selectedContributionId]);

  // Auto-update sidebar based on scroll position (desktop only)
  const lastSelectedIndex = useRef<number>(-1);
  const handleRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      if (typeof window === "undefined" || window.innerWidth < 1024) return;
      if (range.startIndex === lastSelectedIndex.current) return;

      const visibleContribution = contributions[range.startIndex];
      if (visibleContribution && visibleContribution.author_nickname !== "Hệ thống") {
        lastSelectedIndex.current = range.startIndex;
        onSelectContribution(visibleContribution);
      }
    },
    [contributions, onSelectContribution]
  );

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        data={contributions}
        rangeChanged={handleRangeChanged}
        endReached={loadMore}
        itemContent={(index, contribution) => (
          <div className="text-xl md:text-2xl leading-[1.8] text-black font-medium font-be-vietnam content-display italic inline">
            {renderContribution(index, contribution)}
          </div>
        )}
        components={{
          Footer: () => (
            <div className="flex flex-col items-center justify-center pt-10 pb-20 gap-4">
              {isLoadingMore && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" />
                </div>
              )}
              {!hasMore && contributions.length > 50 && (
                <div className="flex items-center justify-center gap-4 border-t-2 border-black/5 w-full pt-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                    {contributions.length} dòng • Đã tải tất cả
                  </span>
                </div>
              )}
            </div>
          ),
        }}
      />

      {contributions.length === 0 && (
        <p className="text-gray-400 italic text-center py-10">
          Chưa có nội dung. Hãy trở thành người đầu tiên.
        </p>
      )}
    </div>
  );
}
