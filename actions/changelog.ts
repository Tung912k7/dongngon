"use server";

import { createClient } from "@/utils/supabase/server";

export async function markChangelogSeen(version: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false };

  const { error } = await supabase
    .from("profiles")
    .update({ last_seen_changelog: version })
    .eq("id", user.id);

  if (error) {
    console.error("[Changelog] Mark seen error:", error.message);
    return { success: false };
  }

  return { success: true };
}
