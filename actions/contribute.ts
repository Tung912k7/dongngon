"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkBlacklist } from "@/utils/blacklist";
import { getErrorMessage } from "@/utils/error-handler";
import { sanitizeInput } from "@/utils/sanitizer";
import { checkRateLimitDistributed } from "@/utils/rate-limit";
import { captureServerEvent } from "@/utils/posthog-server";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTRIBUTION_LIMIT = 15;
const CONTRIBUTION_WINDOW_MS = 60 * 1000;

function isValidUuid(value: string) {
  return UUID_V4_REGEX.test(value);
}

export async function submitContribution(workId: string, content: string, newLine: boolean = false) {
  const supabase = await createClient();

  if (!isValidUuid(workId)) {
    return { error: "ID tác phẩm không hợp lệ." };
  }

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập để viết tiếp." };
  }

  const contributionRate = await checkRateLimitDistributed(
    supabase,
    `contribute:user:${user.id}`,
    CONTRIBUTION_LIMIT,
    CONTRIBUTION_WINDOW_MS
  );
  if (!contributionRate.allowed) {
    return {
      error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${contributionRate.retryAfterSeconds} giây.`,
    };
  }

  // 1.1 Check Work Details (including limit_type)
  const { data: work } = await supabase
    .from("works")
    .select("status, limit_type, sub_category, created_by, title, age_rating")
    .eq("id", workId)
    .single();

  if (work?.status === "finished") {
    return { error: "Tác phẩm này đã hoàn thành, không thể đóng góp thêm." };
  }

  // 1.1.5 Poetic Form Validation
  if (work?.sub_category) {
    const { validatePoeticForm } = await import("@/utils/validation");
    const poeticResult = validatePoeticForm(content, work.sub_category, work.limit_type);
    if (!poeticResult.isValid) {
      return { error: poeticResult.error };
    }
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

  // 4. Get User Profile for Nickname, Age Check & Activation State
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, birthday, activated_at")
    .eq("id", user.id)
    .single();

  // 4.1 Perform Age Rating check on backend before contribution
  if (work?.age_rating && work.age_rating !== "all") {
    const { calculateAge, isOldEnough } = await import("@/utils/age");
    const age = calculateAge(profile?.birthday);
    
    if (user.id !== work.created_by && !isOldEnough(age, work.age_rating)) {
      return { error: `Bạn chưa đủ tuổi (${work.age_rating}) để đóng góp vào tác phẩm này.` };
    }
  }

  const id = workId;
  const text = sanitizedContent;
  const nickname = profile?.nickname || "Người bí ẩn";

  // 5. Insert Contribution
  // Cấu trúc ĐÚNG để không còn lỗi 42703
  const { error } = await supabase
    .from('contributions')
    .insert([
      {
        work_id: id,
        user_id: user.id,
        content: text,
        author_nickname: nickname,
        new_line: newLine
      }
    ]);

  if (error) {
    console.error("Error submitting contribution:", error);
    return { error: getErrorMessage(error) };
  }

  // 6. Notify Work Owner (if someone else contributed)
  if (work && work.created_by && work.created_by !== user.id) {
    await supabase.from("notifications").insert({
      user_id: work.created_by,
      work_id: workId,
      type: "contribution",
      content: `${nickname} đã đóng góp tiếp nối vào tác phẩm "${work.title}".`,
      is_read: false
    });
  }

  // Track contribution event
  const isFirstContribution = !profile?.activated_at;
  await captureServerEvent(user.id, 'contribution_submitted', {
    work_id: workId,
    is_first: isFirstContribution,
    event_source: 'server_action',
    event_version: 1,
  });

  // Activation milestone: first ever contribution
  if (isFirstContribution) {
    await captureServerEvent(user.id, 'user_activated', {
      work_id: workId,
      activation_type: 'first_contribution',
      event_source: 'server_action',
      event_version: 1,
    });
    // Mark activation timestamp (idempotent — only updates if still NULL)
    await supabase
      .from('profiles')
      .update({ activated_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('activated_at', null);
  }

  revalidatePath(`/work/${workId}`);
  revalidatePath("/profile");
  return { success: true };
}
