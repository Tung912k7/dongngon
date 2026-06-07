"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { requireAdmin, isValidUuid } from "@/actions/shared";
import { escapeILike } from "@/utils/validation";
import { sanitizeInput } from "@/utils/sanitizer";
import { checkRateLimitDistributed } from "@/utils/rate-limit";

export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    logger.error("Error fetching notifications", error as Error);
    return { success: false, error: "Failed to fetch notifications" };
  }

  return { success: true, notifications: data };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Error marking format as read", error as Error);
    return { success: false, error: "Failed to mark as read" };
  }

  // Soft revalidation if needed, though client-side UI handles optimistic updates
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    logger.error("Error marking all as read", error as Error);
    return { success: false, error: "Failed to mark all as read" };
  }

  return { success: true };
}

export async function createAdminAnnouncement(message: string, targetNicknamesStr?: string) {
  const adminResult = await requireAdmin();
  if (adminResult.error) return { success: false, error: adminResult.error };
  const { supabase } = adminResult;

  let query = supabase.from("profiles").select("id, nickname");

  const targetNicknames = targetNicknamesStr
    ? targetNicknamesStr
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
    : [];

  if (targetNicknames.length > 0) {
    query = query.in("nickname", targetNicknames);
  }

  // Get user ids
  const { data: profiles, error: profilesError } = await query;

  if (profilesError || !profiles) {
    return { success: false, error: "Failed to fetch users" };
  }

  if (targetNicknames.length > 0 && profiles.length === 0) {
    return { success: false, error: "Không tìm thấy người dùng nào với các nickname đã nhập." };
  }

  const notificationsToInsert = profiles.map((p) => ({
    user_id: p.id,
    type: "announcement",
    content: message,
    is_read: false,
  }));

  // Batch insert all announcements
  const { error: insertError } = await supabase.from("notifications").insert(notificationsToInsert);

  if (insertError) {
    logger.error("Error broadcasting announcement", insertError as Error);
    return { success: false, error: `Lỗi hệ thống: ${insertError.message}` };
  }

  return { success: true, count: profiles.length };
}

export async function searchUserNicknames(keyword: string) {
  const adminResult = await requireAdmin();
  if (adminResult.error) return { success: false, data: [] };
  const { supabase } = adminResult;

  const { data, error } = await supabase
    .from("profiles")
    .select("nickname")
    .ilike("nickname", `%${escapeILike(keyword)}%`)
    .limit(5);

  if (error || !data) return { success: false, data: [] };
  return { success: true, data: data.map((d) => d.nickname) };
}

export async function runReactivationNudgesNow() {
  const adminResult = await requireAdmin();
  if (adminResult.error) return { success: false, error: adminResult.error };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl) {
    return {
      success: false,
      error: "Thiếu NEXT_PUBLIC_SUPABASE_URL trong môi trường server",
    };
  }

  if (!serviceRoleKey) {
    return {
      success: false,
      error: "Thiếu SUPABASE_SERVICE_ROLE_KEY (hoặc SUPABASE_SERVICE_ROLE) trong môi trường server",
    };
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await serviceClient.rpc("enqueue_reactivation_nudges");

  if (error) {
    logger.error("RPC error for reactivation nudges", error as Error);
    return { success: false, error: `Lỗi hệ thống: ${error.message}` };
  }

  return { success: true, queuedCount: typeof data === "number" ? data : 0 };
}

export async function reportContribution(
  contributionId: string,
  content: string,
  authorNickname: string,
  workId: string,
  reason: string
) {
  // Validate UUIDs
  if (!isValidUuid(contributionId) || !isValidUuid(workId)) {
    return { success: false, error: "ID không hợp lệ." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Rate limit: 5 reports per hour per user
  const reportRate = await checkRateLimitDistributed(
    supabase,
    `report:user:${user.id}`,
    5,
    60 * 60 * 1000
  );
  if (!reportRate.allowed) {
    return { success: false, error: "Bạn gửi báo cáo quá nhanh. Vui lòng thử lại sau." };
  }

  const { data: realContribution } = await supabase
    .from("contributions")
    .select("content, author_nickname, work_id")
    .eq("id", contributionId)
    .single();

  if (!realContribution) {
    return { success: false, error: "Đóng góp không tồn tại." };
  }

  // Sanitize inputs and use real DB data
  const safeContent = sanitizeInput(realContribution.content).slice(0, 200);
  const safeNickname = sanitizeInput(realContribution.author_nickname).slice(0, 50);
  const safeReason = sanitizeInput(reason).slice(0, 500);
  const actualWorkId = realContribution.work_id;

  const { data: reporterProfile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const reporterName = reporterProfile?.nickname || "Một cộng đồng viên";

  // Lấy danh sách ID của tất cả admin
  const { data: admins } = await supabase
    .from("user_private_data")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) return { success: false, error: "Không tìm thấy Admin nào" };

  // Lấy tên tác phẩm (nếu có, nếu không lấy mặc định)
  const { data: work } = await supabase.from("works").select("title").eq("id", actualWorkId).single();

  const workTitle = work?.title || "Không rõ tác phẩm";

  const message = `Báo cáo vi phạm từ [${reporterName}]:\n- Câu vi phạm: "${safeContent}"\n- Lý do: ${safeReason}\n- Người viết: ${safeNickname}\n- Tác phẩm: ${workTitle}`;

  const notificationsToInsert = admins.map((admin) => ({
    user_id: admin.id,
    type: "system",
    content: message,
    is_read: false,
    work_id: actualWorkId,
  }));

  const { error } = await supabase.from("notifications").insert(notificationsToInsert);

  if (error) {
    logger.error("Error creating report notification", error as Error);
    return { success: false, error: "Không thể gửi báo cáo" };
  }

  return { success: true };
}

export async function deleteNotifications(ids: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };
  if (!ids || ids.length === 0) return { success: false, error: "No IDs provided" };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) {
    logger.error("Error deleting notifications", error as Error);
    return { success: false, error: "Failed to delete notifications" };
  }

  return { success: true };
}

export async function sendIdeaToAdmins(targetId: string, penName: string, description: string) {
  const supabase = await createClient();

  // Auth check — require login to send ideas
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Bạn cần đăng nhập để gửi ý tưởng." };

  // Rate limit: 3 ideas per hour per user
  const ideaRate = await checkRateLimitDistributed(
    supabase,
    `send-idea:user:${user.id}`,
    3,
    60 * 60 * 1000
  );
  if (!ideaRate.allowed) {
    return { success: false, error: "Bạn gửi ý tưởng quá nhanh. Vui lòng thử lại sau." };
  }

  // Fetch actual nickname from profile
  const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", user.id).single();
  const safePenName = profile?.nickname ? sanitizeInput(profile.nickname).slice(0, 100) : "Một cộng đồng viên";
  const safeDescription = sanitizeInput(description).slice(0, 1000);
  if (!safeDescription) {
    return { success: false, error: "Mô tả không được để trống." };
  }

  // Lấy danh sách ID của tất cả admin
  const { data: admins } = await supabase
    .from("user_private_data")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) {
    return { success: false, error: "Không tìm thấy Admin nào để tiếp nhận ý tưởng." };
  }

  const message = `💡 Ý tưởng mới từ [${safePenName}] (ID: ${targetId}):\n- Mô tả: ${safeDescription}`;

  const notificationsToInsert = admins.map((admin) => ({
    user_id: admin.id,
    type: "system",
    content: message,
    is_read: false,
  }));

  const { error } = await supabase.from("notifications").insert(notificationsToInsert);

  if (error) {
    logger.error("Error creating idea notification", error as Error);
    return { success: false, error: "Không thể gửi ý tưởng. Vui lòng thử lại sau." };
  }

  return { success: true };
}
