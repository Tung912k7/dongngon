"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { containsBadWords } from "@/utils/blacklist";

export async function submitContribution(workId: string, content: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để viết tiếp." };
  }

  // 2. Validate Content
  if (!content || content.trim().length === 0) {
    return { error: "Nội dung không được để trống." };
  }
  
  if (content.length > 200) {
       return { error: "Nội dung quá dài (tối đa 200 ký tự)." };
  }

  if (containsBadWords(content)) {
    return { error: "Nội dung chứa từ ngữ không phù hợp." };
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
    return { error: "Lỗi hệ thống. Vui lòng thử lại sau." };
  }

  revalidatePath(`/work/${workId}`);
  return { success: true };
}
