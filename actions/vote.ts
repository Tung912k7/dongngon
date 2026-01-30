"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/utils/error-handler";

export async function voteEndWork(workId: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để bình chọn." };
  }

  // 2. Check if user is a contributor
  const { data: contribution } = await supabase
    .from("contributions")
    .select("id")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .limit(1);

  if (!contribution || contribution.length === 0) {
    return { error: "Bạn cần đóng góp nội dung trước khi bình chọn kết thúc." };
  }

  // 3. Check if already voted
  const { data: existingVote } = await supabase
    .from("finish_votes")
    .select("id")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    return { error: "Bạn đã bình chọn rồi." };
  }

  // 4. Insert Vote
  const { error: voteError } = await supabase.from("finish_votes").insert({
    work_id: workId,
    user_id: user.id,
  });

  if (voteError) {
    // If it's a unique constraint violation, they already voted
    if (voteError.code === '23505') {
        return { error: "Bạn đã bình chọn rồi." };
    }
    console.error("Vote error:", voteError);
    return { error: getErrorMessage(voteError) };
  }

  // 5. Get current votes count
  const { count: currentVotes } = await supabase
    .from("finish_votes")
    .select("*", { count: "exact", head: true })
    .eq("work_id", workId);

  const currentCount = currentVotes || 0;

  // 6. Threshold logic: Always fetch latest contributor count to avoid stale props
  const { data: contributions } = await supabase
    .from("contributions")
    .select("user_id")
    .eq("work_id", workId);
  
  const uniqueContributors = new Set(contributions?.map(c => c.user_id) || []).size;
  const threshold = Math.max(1, Math.floor(uniqueContributors / 2) + 1);

  if (currentCount >= threshold) {
     const { error: updateError } = await supabase
       .from("works")
       .update({ status: "finished" })
       .eq("id", workId)
       // Only update if it's NOT already finished or pending? 
       // Actually, we can update writing -> finished.
       .neq("status", "finished");
       
     if (updateError) {
         console.error("Critical error updating work status to finished:", updateError);
     }
  }

  revalidatePath(`/work/${workId}`);
  revalidatePath("/dong-ngon");
  return { success: true, newCount: currentCount };
}
