import { Virtuoso } from "react-virtuoso";
// ... (imports remain same)

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
  const supabase = useMemo(() => createClient(), []);
  const virtuosoRef = useRef<any>(null);
  const bufferRef = useRef<Contribution[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setContributions(prev => {
      const existingIds = new Set(initialContributions.map(c => c.id));
      const newFromRealtime = prev.filter(p => !existingIds.has(p.id));
      return [...initialContributions, ...newFromRealtime].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [initialContributions]);

  const flushBuffer = useCallback(() => {
    if (bufferRef.current.length === 0) return;

    setContributions((prev) => {
      const newItems = bufferRef.current.filter(
        (item) => !prev.find((p) => p.id === item.id)
      );
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
          const newContrib = payload.new as Contribution;
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

  const renderContribution = (index: number, contribution: Contribution) => {
    const isSentenceMode = limitType === 'sentence' || limitType === '1 câu';
    const prevContribution = index > 0 ? contributions[index - 1] : null;
    const prevEndsWithPunctuation = prevContribution 
      ? /[.?!]$/.test(prevContribution.content.trim()) 
      : false;
    
    let displayContent = contribution.content;
    if (contribution.new_line && prevEndsWithPunctuation && displayContent.length > 0) {
      displayContent = displayContent.charAt(0).toUpperCase() + displayContent.slice(1);
    }

    return (
      <span className="inline animate-in fade-in slide-in-from-bottom-2 duration-500">
        {contribution.new_line && <br />}
        <ContributionTooltip contribution={contribution}>
          <span className="cursor-help">
            {prevEndsWithPunctuation && !contribution.new_line && ' '}
            {displayContent}
            {!contribution.content.endsWith(' ') && isSentenceMode && ' '}
          </span>
        </ContributionTooltip>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <Virtuoso
        ref={virtuosoRef}
        useWindowScroll
        data={contributions}
        followOutput="smooth"
        itemContent={(index, contribution) => (
          <div className="text-xl md:text-2xl leading-[1.8] text-black font-medium font-be-vietnam content-display italic inline">
            {renderContribution(index, contribution)}
          </div>
        )}
        components={{
          Footer: () => (
            <div className="h-20" /> // Spacer for bottom editor
          )
        }}
      />
      
      {contributions.length === 0 && (
        <p className="text-gray-400 italic text-center py-10">Chưa có nội dung. Hãy là người đầu tiên đóng góp.</p>
      )}

      {contributions.length > 50 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-black/5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
            {contributions.length} dòng • Đã tải tất cả
          </span>
        </div>
      )}
    </div>
  );
}
