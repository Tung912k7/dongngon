"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleSaveWork(workId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thực hiện chức năng này." };
  }

  // Check if already saved
  const { data: existing, error: checkError } = await supabase
    .from("saved_works")
    .select("id")
    .eq("user_id", user.id)
    .eq("work_id", workId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    return { success: false, error: "Đã xảy ra lỗi khi kiểm tra dữ liệu." };
  }

  if (existing) {
    // Unsave
    const { error: deleteError } = await supabase
      .from("saved_works")
      .delete()
      .eq("id", existing.id);

    if (deleteError) return { success: false, error: "Không thể bỏ lưu tác phẩm." };
    
    revalidatePath("/profile");
    revalidatePath(`/work/${workId}`);
    revalidatePath("/kho-tang");
    return { success: true, saved: false };
  } else {
    // Save
    const { error: insertError } = await supabase
      .from("saved_works")
      .insert({ user_id: user.id, work_id: workId });

    if (insertError) return { success: false, error: "Không thể lưu tác phẩm." };

    revalidatePath("/profile");
    revalidatePath(`/work/${workId}`);
    revalidatePath("/kho-tang");
    return { success: true, saved: true };
  }
}

export async function getSavedWorksStatus(workIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: true, savedIds: [] };

  const { data, error } = await supabase
    .from("saved_works")
    .select("work_id")
    .eq("user_id", user.id)
    .in("work_id", workIds);

  if (error) return { success: false, error: error.message };

  return { success: true, savedIds: data.map(d => d.work_id) };
}

