"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

export async function getRandomActiveWork() {
  const supabase = await createClient();

  try {
    // Fetch user IDs of hidden profiles
    const { data: hiddenProfiles, error: hiddenProfilesError } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_hidden", true);

    if (hiddenProfilesError) {
      logger.error("[randomWork] Error fetching hidden profiles", hiddenProfilesError);
    }

    const hiddenIds = (hiddenProfiles || []).map((p) => p.id);

    // Build query for works table
    let query = supabase
      .from("works")
      .select("id")
      .eq("status", "writing")
      .eq("privacy", "Public")
      .eq("is_test", false);

    // Exclude works by hidden creators
    if (hiddenIds.length > 0) {
      query = query.not("created_by", "in", `(${hiddenIds.join(",")})`);
    }

    const { data: works, error: worksError } = await query;

    if (worksError) {
      logger.error("[randomWork] Error fetching active works", worksError);
      return { error: "Không thể lấy danh sách tác phẩm." };
    }

    if (!works || works.length === 0) {
      return { success: true, workId: null };
    }

    const randomIndex = Math.floor(Math.random() * works.length);
    return { success: true, workId: works[randomIndex].id };
  } catch (err) {
    logger.error("[randomWork] Unexpected error", err);
    return { error: "Có lỗi xảy ra khi lấy tác phẩm ngẫu nhiên." };
  }
}
