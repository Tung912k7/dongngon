"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkBlacklist } from "@/utils/blacklist";

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

  // 3. Upsert Profile
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

export async function updateNickname(nickname: string) {
    return updateProfile(nickname);
}
