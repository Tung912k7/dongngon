"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";

export async function markChangelogSeen(version: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const { error } = await supabase
    .from("profiles")
    .update({ last_seen_changelog: version })
    .eq("id", user.id);

  if (error) {
    logger.error("[Changelog] Mark seen error:", error.message);
    return { success: false };
  }

  return { success: true };
}
