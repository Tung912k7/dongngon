"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Contribution } from "@/types/database";

export default function Feed({
  initialContributions,
  workId,
}: {
  initialContributions: Contribution[];
  workId: string;
}) {
  const [contributions, setContributions] = useState<Contribution[]>(
    initialContributions
  );
  const supabase = createClient();

  useEffect(() => {
    setContributions(prev => {
      // Merge initialContributions with any existing ones (from realtime), avoiding duplicates
      const existingIds = new Set(initialContributions.map(c => c.id));
      const newFromRealtime = prev.filter(p => !existingIds.has(p.id));
      return [...initialContributions, ...newFromRealtime].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
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
            return [...prev, newContrib];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workId]);

  return (
    <div className="space-y-4 text-lg leading-relaxed text-gray-800 font-montserrat">
      {contributions.map((contribution) => (
        <div key={contribution.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <span>{contribution.content}</span>
        </div>
      ))}
      {contributions.length === 0 && (
          <p className="text-gray-400 italic text-center py-10">Chưa có nội dung. Hãy là người đầu tiên đóng góp.</p>
      )}
    </div>
  );
}
