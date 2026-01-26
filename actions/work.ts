"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWork(formData: {
  title: string;
  category_type: string;
  hinh_thuc: string;
  license: string;
  writing_rule: string;
}) {
  const supabase = await createClient();

  // 1. Check Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để tạo tác phẩm." };

  // 2. Validation
  if (!formData.title || formData.title.trim().length < 2) {
    return { error: "Tiêu đề phải có ít nhất 2 ký tự." };
  }

  // 3. Get User Profile for Nickname
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const authorNickname = profile?.nickname || "Người bí ẩn";

  // 4. Map UI labels to database constants
  const mapping = {
    category: {
      "Văn xuôi": "Văn xuôi",
      "Thơ": "Thơ",
      "Tiểu thuyết": "Tiểu thuyết"
    },
    rule: {
      "1 câu": "sentence",
      "1 kí tự": "character"
    }
  };

  // 5. Insert Work
  const { data, error } = await supabase.from("works").insert({
    title: formData.title.trim(),
    category_type: mapping.category[formData.category_type as keyof typeof mapping.category] || formData.category_type,
    sub_category: formData.hinh_thuc,
    license: formData.license,
    limit_type: mapping.rule[formData.writing_rule as keyof typeof mapping.rule] || formData.writing_rule,
    created_by: user.id,
    author_nickname: authorNickname,
    status: "writing"
  }).select().single();

  if (error) {
    console.error("Error creating work:", error);
    return { error: "Không thể tạo tác phẩm. Vui lòng thử lại sau." };
  }

  revalidatePath("/profile");
  revalidatePath("/dong-ngon");
  
  return { success: true, workId: data.id };
}

export async function deleteWork(workId: string) {
  const supabase = await createClient();

  // 1. Check Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để xóa tác phẩm." };

  // 2. Delete Work (RLS or explicit check)
  const { error } = await supabase
    .from("works")
    .delete()
    .eq("id", workId)
    .eq("created_by", user.id);

  if (error) {
    console.error("Error deleting work:", error);
    return { error: "Không thể xóa tác phẩm. Vui lòng thử lại sau." };
  }

  revalidatePath("/profile");
  revalidatePath("/dong-ngon");
  
  return { success: true };
}
