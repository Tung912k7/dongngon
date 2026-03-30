"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

export async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }

  return { success: true, notifications: data };
}

export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking format as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }

  // Soft revalidation if needed, though client-side UI handles optimistic updates
  return { success: true };
}

export async function markAllAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all as read:", error);
    return { success: false, error: "Failed to mark all as read" };
  }

  return { success: true };
}

export async function createAdminAnnouncement(message: string, targetNicknamesStr?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Verify if it's an admin (Role check based on your profile table)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admins only" };
  }

  let query = supabase.from("profiles").select("id, nickname");

  const targetNicknames = targetNicknamesStr
    ? targetNicknamesStr.split(",").map(n => n.trim()).filter(Boolean)
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

  const notificationsToInsert = profiles.map(p => ({
    user_id: p.id,
    type: "announcement",
    content: message,
    is_read: false
  }));

  // Batch insert all announcements
  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notificationsToInsert);

  if (insertError) {
    console.error("[Announcement] Error broadcasting:", insertError.code, insertError.message);
    return { success: false, error: `Lỗi hệ thống: ${insertError.message}` };
  }

  return { success: true, count: profiles.length };
}

export async function searchUserNicknames(keyword: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, data: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { success: false, data: [] };

  const { data, error } = await supabase
    .from("profiles")
    .select("nickname")
    .ilike("nickname", `%${keyword}%`)
    .limit(5);

  if (error || !data) return { success: false, data: [] };
  return { success: true, data: data.map(d => d.nickname) };
}

export async function runReactivationNudgesNow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Forbidden: Admins only" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl) {
    return {
      success: false,
      error: "Thiếu NEXT_PUBLIC_SUPABASE_URL trong môi trường server",
    };
  }

  if (!serviceRoleKey) {
    return {
      success: false,
      error:
        "Thiếu SUPABASE_SERVICE_ROLE_KEY (hoặc SUPABASE_SERVICE_ROLE) trong môi trường server",
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
    console.error("[ReactivationNudge] RPC error:", error.code, error.message);
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: reporterProfile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const reporterName = reporterProfile?.nickname || "Một cộng đồng viên";

  // Lấy danh sách ID của tất cả admin
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) return { success: false, error: "Không tìm thấy Admin nào" };

  // Lấy tên tác phẩm (nếu có, nếu không lấy mặc định)
  const { data: work } = await supabase
    .from("works")
    .select("title")
    .eq("id", workId)
    .single();

  const workTitle = work?.title || "Không rõ tác phẩm";

  const message = `Báo cáo vi phạm từ [${reporterName}]:\n- Câu vi phạm: "${content}"\n- Lý do: ${reason}\n- Người viết: ${authorNickname}\n- Tác phẩm: ${workTitle}`;

  const notificationsToInsert = admins.map(admin => ({
    user_id: admin.id,
    type: "system",
    content: message,
    is_read: false,
    work_id: workId
  }));

  const { error } = await supabase.from("notifications").insert(notificationsToInsert);

  if (error) {
    console.error("Error creating report notification:", error);
    return { success: false, error: "Không thể gửi báo cáo" };
  }

  return { success: true };
}

export async function deleteNotifications(ids: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };
  if (!ids || ids.length === 0) return { success: false, error: "No IDs provided" };

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) {
    console.error("Error deleting notifications:", error);
    return { success: false, error: "Failed to delete notifications" };
  }

  return { success: true };
}
