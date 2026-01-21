"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
    console.error("Vote error:", voteError);
    return { error: "Lỗi hệ thống." };
  }

  // 5. Calculate Threshold and Auto-Complete
  // Get unique contributors
  const { data: contributorsData } = await supabase
    .from("contributions")
    .select("user_id")
    .eq("work_id", workId);
  
  const uniqueContributors = new Set(contributorsData?.map((c: any) => c.user_id) || []).size;
  const threshold = Math.max(1, Math.floor(uniqueContributors / 2) + 1);

  // Get current votes
  const { count } = await supabase
    .from("finish_votes")
    .select("*", { count: "exact", head: true })
    .eq("work_id", workId);

  if (count && count >= threshold) {
    // Mark Work as Completed
    await supabase
      .from("works")
      .update({ status: "completed" })
      .eq("id", workId);
      
    // Add [End] marker
    await supabase.from("contributions").insert({
        work_id: workId,
        user_id: user.id,
        content: "[Hết] - Tác phẩm đã hoàn thành do cộng đồng bình chọn.",
        author_nickname: "Hệ thống" 
    });
  }

  revalidatePath(`/work/${workId}`);
  return { success: true, newCount: count };
}
