"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const VOTE_THRESHOLD = 5; // Reduced for easier testing, can be 10

export async function voteEndWork(workId: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để bình chọn." };
  }

  // 2. Check if already voted
  const { data: existingVote } = await supabase
    .from("finish_votes")
    .select("id")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .single();

  if (existingVote) {
    return { error: "Bạn đã bình chọn rồi." };
  }

  // 3. Insert Vote
  const { error: voteError } = await supabase.from("finish_votes").insert({
    work_id: workId,
    user_id: user.id,
  });

  if (voteError) {
    console.error("Vote error:", voteError);
    return { error: "Lỗi hệ thống." };
  }

  // 4. Check Threshold and Auto-Complete
  const { count } = await supabase
    .from("finish_votes")
    .select("*", { count: "exact", head: true })
    .eq("work_id", workId);

  if (count && count >= VOTE_THRESHOLD) {
    // Mark Work as Completed
    await supabase
      .from("works")
      .update({ status: "completed" })
      .eq("id", workId);
      
    // Add [End] marker to contributions
    // We need a system nickname or current user nickname. 
    // For now, we'll use a hardcoded system name string if possible or fetch current user profile.
    // Ideally, catch this in a real app, but for now:
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
