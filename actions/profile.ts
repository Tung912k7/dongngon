"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkBlacklist } from "@/utils/blacklist";
import { cache } from "react";

export const isNicknameAvailable = async (nickname: string, excludeUserId?: string) => {
  const supabase = await createClient();
  
  const query = supabase
    .from("profiles")
    .select("id")
    .ilike("nickname", nickname.trim());
    
  if (excludeUserId) {
    query.neq("id", excludeUserId);
  }
  
  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error("Error checking nickname availability:", error);
    return false; // Assume unavailable on error as a safety measure
  }
  
  return !data;
};

export const isEmailRegistered = async (email: string) => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim())
    .maybeSingle();
    
  if (error) {
    console.error("Error checking email registration:", error);
    return false;
  }
  
  return !!data;
};

export async function updateProfile(nickname: string, avatarUrl?: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập." };
  }

  // 2. Validate Nickname
  if (!nickname || nickname.trim().length < 2) {
    return { error: "Bút danh phải có ít nhất 2 ký tự." };
  }
  
  if (nickname.trim().length > 30) {
      return { error: "Bút danh quá dài." };
  }

  const violation = await checkBlacklist(nickname);
  if (violation) {
    return { error: `Bút danh chứa từ không cho phép (${violation}).` };
  }

  // 3. Check Uniqueness
  const isAvailable = await isNicknameAvailable(nickname, user.id);
  if (!isAvailable) {
    return { error: "Bút danh này đã được sử dụng bởi người khác." };
  }

  // 4. Upsert Profile
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    nickname: nickname.trim(),
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Profile update error:", error);
    return { error: "Lỗi khi cập nhật hồ sơ." };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ has_seen_tour: true })
    .eq("id", user.id);

  if (error) {
    console.error("Error marking onboarding as complete:", error);
    return { error: "Failed to update onboarding status" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateNickname(nickname: string) {
    return updateProfile(nickname);
}
