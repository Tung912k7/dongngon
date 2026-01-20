"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createWork(formData: {
  title: string;
  category_type: string;
  period: string;
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

  // 3. Insert Work
  const { data, error } = await supabase.from("works").insert({
    title: formData.title.trim(),
    category_type: formData.category_type,
    period: formData.period,
    license: formData.license,
    limit_type: formData.writing_rule,
    created_by: user.id,
    status: "Đang viết"
  }).select().single();

  if (error) {
    console.error("Error creating work:", error);
    return { error: "Không thể tạo tác phẩm. Vui lòng thử lại sau." };
  }

  revalidatePath("/profile");
  revalidatePath("/dong-ngon");
  
  return { success: true, workId: data.id };
}
