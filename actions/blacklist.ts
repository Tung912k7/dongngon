"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Server Action to check if a string contains any blacklisted words.
 * This should be used on both client and server to avoid RLS issues 
 * and keep the blacklist logic centralized.
 */
export async function checkBlacklist(text: string): Promise<string | null> {
  if (!text || text.trim().length === 0) return null;

  try {
    const supabase = await createClient();
    
    // Fetch from blacklist_words
    const { data: blacklist, error } = await supabase
      .from("blacklist_words")
      .select("pattern, is_regex");

    if (error) {
      // Log more detail on the server, but don't crash
      console.error("Server-side blacklist fetch error:", error.message, error.details);
      return null;
    }

    if (!blacklist || blacklist.length === 0) return null;

    const textLower = text.toLowerCase();
    
    for (const item of blacklist) {
      if (item.is_regex) {
        try {
          const regex = new RegExp(item.pattern, 'i');
          if (regex.test(textLower)) {
            return item.pattern;
          }
        } catch {
          console.error("Invalid regex in database:", item.pattern);
        }
      } else {
        const word = item.pattern.toLowerCase();
        if (textLower.includes(word)) {
          return item.pattern;
        }
      }
    }
  } catch (err) {
    console.error("Unexpected error in checkBlacklist:", err);
  }

  return null;
}

export async function getBlacklistWords() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, data: [] };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { success: false, data: [] };

    const { data, error } = await supabase
      .from("blacklist_words")
      .select("id, pattern, is_regex, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Blacklist] Fetch error:", error);
      return { success: false, data: [] };
    }

    // Map `pattern` back to `word` for the frontend to minimize changes
    const mappedData = data.map((item) => ({
      id: item.id,
      word: item.pattern,
      is_regex: item.is_regex,
      created_at: item.created_at
    }));

    return { success: true, data: mappedData || [] };
  } catch (error) {
    console.error("[Blacklist] Fetch error:", error);
    return { success: false, data: [] };
  }
}

export async function addBlacklistWord(word: string, isRegex: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { success: false, error: "Forbidden" };

    const { error } = await supabase
      .from("blacklist_words")
      .insert([{ pattern: word.trim(), is_regex: isRegex, created_by: user.id, type: isRegex ? 'regex' : 'word' }]);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Pattern này đã có trong danh sách." };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Unknown error" };
  }
}

export async function deleteBlacklistWord(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { success: false, error: "Forbidden" };

    const { error } = await supabase
      .from("blacklist_words")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Unknown error" };
  }
}
