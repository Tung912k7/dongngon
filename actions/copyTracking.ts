"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

export async function incrementCopyCount(contributionId: string) {
  const supabase = await createClient();

  if (!contributionId) {
    return { error: "ID đóng góp không hợp lệ." };
  }

  try {
    const { error } = await supabase.rpc("increment_contribution_copy", {
      contrib_id: contributionId,
    });

    if (error) {
      logger.error("[copyTracking] Error incrementing copy count:", error);
      return { error: "Không thể ghi nhận lượt sao chép." };
    }

    return { success: true };
  } catch (err) {
    logger.error("[copyTracking] Unexpected error:", err);
    return { error: "Có lỗi xảy ra." };
  }
}
