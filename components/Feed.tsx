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
          setContributions((prev) => [...prev, payload.new as Contribution]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, workId]);

  return (
    <div className="space-y-4 text-lg leading-relaxed text-gray-800">
      {contributions.map((contribution) => (
        <div key={contribution.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <span className="font-semibold text-gray-600 text-sm block mb-1">
                {contribution.author_nickname || "Người bí ẩn"}:
             </span>
             <span>{contribution.content}</span>
        </div>
      ))}
      {contributions.length === 0 && (
          <p className="text-gray-400 italic text-center py-10">Chưa có nội dung. Hãy là người đầu tiên đóng góp.</p>
      )}
    </div>
  );
}
