"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "@/utils/error-handler";
import { sanitizeTitle } from "@/utils/sanitizer";
import { checkRateLimitDistributed } from "@/utils/rate-limit";
import { captureServerEvent } from "@/utils/posthog-server";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CREATE_WORK_LIMIT = 6;
const CREATE_WORK_WINDOW_MS = 60 * 60 * 1000;
const UPDATE_WORK_LIMIT = 20;
const UPDATE_WORK_WINDOW_MS = 60 * 1000;

const ALLOWED_CATEGORIES = new Set(["Văn xuôi", "Thơ", "Tiểu thuyết"]);
const ALLOWED_LICENSES = new Set(["public", "private"]);
const ALLOWED_RULES = new Set(["1 câu", "sentence"]);

function isValidUuid(value: string) {
  return UUID_V4_REGEX.test(value);
}

export async function createWork(formData: {
  title: string;
  category_type: string;
  hinh_thuc: string;
  license: string;
  writing_rule: string;
  age_rating: string;
  description?: string;
}) {
  const supabase = await createClient();

  // 1. Check Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để tạo tác phẩm." };

  const createWorkRate = await checkRateLimitDistributed(
    supabase,
    `create-work:user:${user.id}`,
    CREATE_WORK_LIMIT,
    CREATE_WORK_WINDOW_MS
  );
  if (!createWorkRate.allowed) {
    return {
      error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${createWorkRate.retryAfterSeconds} giây.`,
    };
  }

  // 1.1 Server-side Duplicate Check (Anti-spam/Race condition)
  const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
  const { data: recentWorks } = await supabase
    .from("works")
    .select("id")
    .eq("created_by", user.id)
    .eq("title", formData.title.trim())
    .gte("created_at", tenSecondsAgo);

  if (recentWorks && recentWorks.length > 0) {
    return { error: "Bạn đã tạo một tác phẩm trùng tên trong 10 giây qua. Vui lòng đợi." };
  }

  // 2. Validation
  const sanitizedTitle = sanitizeTitle(formData.title); // Use strict title sanitization
  if (!sanitizedTitle || sanitizedTitle.length < 2) {
    return { error: "Tiêu đề phải có ít nhất 2 ký tự." };
  }

  if (!ALLOWED_CATEGORIES.has(formData.category_type)) {
    return { error: "Thể loại không hợp lệ." };
  }

  if (!ALLOWED_LICENSES.has(formData.license)) {
    return { error: "Quyền riêng tư không hợp lệ." };
  }

  if (!ALLOWED_RULES.has(formData.writing_rule)) {
    return { error: "Quy tắc viết không hợp lệ." };
  }

  const normalizedRule = formData.writing_rule === "1 câu" || formData.writing_rule === "sentence"
    ? "sentence"
    : null;

  if (!normalizedRule) {
    return { error: "Quy tắc viết không hợp lệ." };
  }

  const sanitizedSubCategory = formData.hinh_thuc?.trim();
  if (!sanitizedSubCategory || sanitizedSubCategory.length > 60) {
    return { error: "Hình thức không hợp lệ." };
  }

  const sanitizedDescription = formData.description?.trim();
  if (sanitizedDescription && sanitizedDescription.length > 1000) {
    return { error: "Mô tả quá dài (tối đa 1000 ký tự)." };
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
  };

  // 5. Insert Work
  const { data, error } = await supabase.from("works").insert({
    title: sanitizedTitle,
    category_type: mapping.category[formData.category_type as keyof typeof mapping.category] || formData.category_type,
    sub_category: sanitizedSubCategory,
    license: formData.license,
    privacy: formData.license === "private" ? "Private" : "Public",
    limit_type: normalizedRule,
    age_rating: formData.age_rating,
    description: sanitizedDescription || null,
    created_by: user.id,
    author_nickname: authorNickname,
    status: "writing"
  }).select().single();

  if (error) {
    console.error("Error creating work:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/profile");
  revalidatePath("/kho-tang");

  await captureServerEvent(user.id, 'work_created', {
    work_id: data.id,
    category: formData.category_type,
    license: formData.license,
    event_source: 'server_action',
    event_version: 1,
  });

  return { success: true, workId: data.id };
}

export async function deleteWork(workId: string) {
  const supabase = await createClient();

  if (!isValidUuid(workId)) {
    return { error: "ID tác phẩm không hợp lệ." };
  }

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
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/profile");
  revalidatePath("/kho-tang");
  
  return { success: true };
}

export async function updateWork(workId: string, formData: {
  title: string;
  description?: string;
  license?: string;
}) {
  const supabase = await createClient();

  if (!isValidUuid(workId)) {
    return { error: "ID tác phẩm không hợp lệ." };
  }

  // 1. Check Authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Bạn cần đăng nhập để chỉnh sửa tác phẩm." };

  const updateWorkRate = await checkRateLimitDistributed(
    supabase,
    `update-work:user:${user.id}`,
    UPDATE_WORK_LIMIT,
    UPDATE_WORK_WINDOW_MS
  );
  if (!updateWorkRate.allowed) {
    return {
      error: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${updateWorkRate.retryAfterSeconds} giây.`,
    };
  }

  // 2. Validation
  const sanitizedTitle = sanitizeTitle(formData.title); // Use strict title sanitization
  if (!sanitizedTitle || sanitizedTitle.length < 2) {
    return { error: "Tiêu đề phải có ít nhất 2 ký tự." };
  }

  const sanitizedDescription = formData.description?.trim();
  if (sanitizedDescription && sanitizedDescription.length > 1000) {
    return { error: "Mô tả quá dài (tối đa 1000 ký tự)." };
  }

  // 3. Update Work
  const updatePayload: {
    title: string;
    description: string | null;
    license?: "public";
    privacy?: "Public";
  } = {
    title: sanitizedTitle,
    description: sanitizedDescription || null,
  };

  // Only allow updating license if it's changing from private to public
  if (formData.license === "public") {
     updatePayload.license = "public";
     updatePayload.privacy = "Public";
  }

  const { error } = await supabase
    .from("works")
    .update(updatePayload)
    .eq("id", workId)
    .eq("created_by", user.id);

  if (error) {
    console.error("Error updating work:", error);
    return { error: getErrorMessage(error) };
  }

  revalidatePath("/profile");
  revalidatePath("/kho-tang");
  revalidatePath(`/work/${workId}`);
  
  return { success: true };
}
