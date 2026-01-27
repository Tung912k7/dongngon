"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkBlacklist } from "@/utils/blacklist";
import { getErrorMessage } from "@/utils/error-handler";

export async function submitContribution(workId: string, content: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để viết tiếp." };
  }

  // 1.1 Check Work Status
  const { data: work } = await supabase
    .from("works")
    .select("status")
    .eq("id", workId)
    .single();

  if (work?.status === "completed") {
    return { error: "Tác phẩm này đã hoàn thành, không thể đóng góp thêm." };
  }

  // 2. Validate Content
  if (!content || content.trim().length === 0) {
    return { error: "Nội dung không được để trống." };
  }
  
  if (content.length > 200) {
       return { error: "Nội dung quá dài (tối đa 200 ký tự)." };
  }

  const blacklistViolation = await checkBlacklist(content);
  if (blacklistViolation) {
    // If blacklisted, we still allow the contribution but mark the work as pending
    console.log(`Blacklist violation detected: "${blacklistViolation}". Marking work ${workId} as pending.`);
    
    // Update work status to pending
    const { error: statusError } = await supabase
      .from("works")
      .update({ status: "pending" })
      .eq("id", workId);

    if (statusError) {
      console.error("Error updating work status:", statusError);
      return { error: "Không thể cập nhật trạng thái tác phẩm để xử lý vi phạm." };
    }
  }

  // 3. Check Daily Limit
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const { data: recentContributions } = await supabase
    .from("contributions")
    .select("created_at")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .gte("created_at", startOfDay.toISOString());

  if (recentContributions && recentContributions.length > 0) {
    return { error: "Bạn chỉ được đóng góp 1 câu mỗi ngày cho tác phẩm này." };
  }

  // 4. Get User Profile for Nickname
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const authorNickname = profile?.nickname || "Người bí ẩn";

  // 5. Insert Contribution
  const { error } = await supabase.from("contributions").insert({
    work_id: workId,
    user_id: user.id,
    content: content.trim(),
    author_nickname: authorNickname
  });

  if (error) {
    console.error("Error submitting contribution:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath(`/work/${workId}`);
  return { success: true };
}
