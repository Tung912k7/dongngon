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

export async function createAdminAnnouncement(message: string) {
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

  // Get all user ids (For a larger app, you'd use a queue/Edge Function, but doing directly here for small scope)
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id");

  if (profilesError || !profiles) {
    return { success: false, error: "Failed to fetch users" };
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

  return { success: true };
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
