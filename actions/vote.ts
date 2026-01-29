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
    console.error("Vote error:", voteError);
    return { error: getErrorMessage(voteError) };
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
  const { count, error: countError } = await supabase
    .from("finish_votes")
    .select("*", { count: "exact", head: true })
    .eq("work_id", workId);

  if (countError) {
    console.error("Error fetching vote count:", countError);
    return { error: "Không thể tính toán kết quả bình chọn." };
  }

  if (count && count >= threshold) {
    // Mark Work as Completed
    const { error: completeError } = await supabase
      .from("works")
      .update({ status: "finished" })
      .eq("id", workId);
      
    if (completeError) {
      console.error("Error completing work:", completeError);
      return { error: "Bình chọn thành công nhưng không thể hoàn tất tác phẩm." };
    }
      
    // Add [End] marker
    const { error: markerError } = await supabase.from("contributions").insert({
        work_id: workId,
        user_id: user.id,
        content: "[Hết] - Tác phẩm đã hoàn thành do cộng đồng bình chọn.",
        author_nickname: "Hệ thống" 
    });

    if (markerError) {
      console.error("Error adding [End] marker:", markerError);
      // We don't necessarily return error here since the work IS completed, 
      // but it's better to be consistent.
      return { error: "Bình chọn thành công nhưng không thể đánh dấu kết thúc." };
    }
  }

  revalidatePath(`/work/${workId}`);
  return { success: true, newCount: count };
}
