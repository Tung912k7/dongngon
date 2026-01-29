"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkBlacklist } from "@/utils/blacklist";
import { getErrorMessage } from "@/utils/error-handler";
import { sanitizeInput } from "@/utils/sanitizer";

export async function submitContribution(workId: string, content: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để viết tiếp." };
  }

  // 1.1 Check Work Details (including limit_type)
  const { data: work } = await supabase
    .from("works")
    .select("status, limit_type")
    .eq("id", workId)
    .single();

  if (work?.status === "completed") {
    return { error: "Tác phẩm này đã hoàn thành, không thể đóng góp thêm." };
  }

  // 1.2 Sanitize Content based on limit_type
  // For character mode, we might want to preserve a single leading space if provided
  const isCharacterMode = work?.limit_type === 'character';
  const sanitizedContent = sanitizeInput(content, !isCharacterMode);

  // 2. Validate Content
  if (!sanitizedContent || sanitizedContent.length === 0) {
    return { error: "Nội dung không được để trống." };
  }
  
  if (sanitizedContent.length > 200) {
       return { error: "Nội dung quá dài (tối đa 200 ký tự)." };
  }

  const blacklistViolation = await checkBlacklist(sanitizedContent);
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
    const unit = work?.limit_type === 'character' ? 'kí tự' : 'câu';
    return { error: `Bạn chỉ được đóng góp 1 ${unit} mỗi ngày cho tác phẩm này.` };
  }

  // 4. Get User Profile for Nickname
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const id = workId;
  const text = sanitizedContent;
  const nickname = profile?.nickname || "Người bí ẩn";

  // 5. Insert Contribution
  // Cấu trúc ĐÚNG để không còn lỗi 42703
  const { error } = await supabase
    .from('contributions')
    .insert([
      {
        work_id: id,                  // Phải có dấu gạch dưới
        user_id: user.id,             // Phải có dấu gạch dưới
        content: text,                // Khớp với cột 'content'
        author_nickname: nickname     // Khớp với cột 'author_nickname'
      }
    ]);

  if (error) {
    console.error("Error submitting contribution:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath(`/work/${workId}`);
  revalidatePath("/profile");
  return { success: true };
}
