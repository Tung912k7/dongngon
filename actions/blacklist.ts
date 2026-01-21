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
      .select("word, is_regex");

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
          const regex = new RegExp(item.word, 'i');
          if (regex.test(textLower)) {
            return item.word;
          }
        } catch (e) {
          console.error("Invalid regex in database:", item.word);
        }
      } else {
        const word = item.word.toLowerCase();
        if (textLower.includes(word)) {
          return item.word;
        }
      }
    }
  } catch (err) {
    console.error("Unexpected error in checkBlacklist:", err);
  }

  return null;
}
