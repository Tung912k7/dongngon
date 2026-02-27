"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkBlacklist } from "@/utils/blacklist";
import { getErrorMessage } from "@/utils/error-handler";
import { sanitizeNickname } from "@/utils/sanitizer";

export const isNicknameAvailable = async (nickname: string, excludeUserId?: string) => {
  const supabase = await createClient();
  
  const sanitizedNickname = sanitizeNickname(nickname);
  const query = supabase
    .from("profiles")
    .select("id")
    .ilike("nickname", sanitizedNickname);
    
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

export async function updateProfile(nickname: string, avatarUrl?: string, birthday?: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn cần đăng nhập." };
  }

  // 2. Validate Nickname
  const sanitizedNickname = sanitizeNickname(nickname);
  if (!sanitizedNickname || sanitizedNickname.length < 2) {
    return { error: "Bút danh phải có ít nhất 2 ký tự (sau khi đã loại bỏ các thẻ HTML)." };
  }
  
  if (sanitizedNickname.length > 30) {
      return { error: "Bút danh quá dài." };
  }

  const violation = await checkBlacklist(sanitizedNickname);
  if (violation) {
    return { error: `Bút danh chứa từ không cho phép (${violation}).` };
  }

  // 3. Check Uniqueness
  const isAvailable = await isNicknameAvailable(sanitizedNickname, user.id);
  if (!isAvailable) {
    return { error: "Bút danh này đã được sử dụng bởi người khác." };
  }

  // 4. Handle Birthday Logic (Cannot be changed after it is set once)
  let finalBirthday = undefined;
  if (birthday) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("birthday")
      .eq("id", user.id)
      .single();

    if (!currentProfile?.birthday) {
      // Allow setting it because it was not set previously
      finalBirthday = birthday;
    }
  }

  // 5. Upsert Profile
  const updatePayload: any = {
    id: user.id,
    nickname: sanitizedNickname,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl !== undefined) {
    updatePayload.avatar_url = avatarUrl;
  }
  
  if (finalBirthday !== undefined) {
    updatePayload.birthday = finalBirthday;
  }

  const { error } = await supabase.from("profiles").upsert(updatePayload);

  if (error) {
    console.error("Profile update error:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Bạn chưa đăng nhập." };

  const { error } = await supabase
    .from("profiles")
    .update({ has_seen_tour: true })
    .eq("id", user.id);

  if (error) {
    console.error("Error marking onboarding as complete:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateNickname(nickname: string) {
    return updateProfile(nickname);
}
