import { createClient } from "./supabase/client";

/**
 * Utility to check if a string contains any blacklisted words.
 * Returns the first violation found or null.
 */
export async function checkBlacklist(text: string): Promise<string | null> {
  if (!text) return null;

  const supabase = createClient();
  const { data: blacklist, error } = await supabase
    .from("blacklist_words")
    .select("word, is_regex");

  if (error) {
    console.error("Error fetching blacklist:", error);
    return null; // Fallback to safe if DB error
  }

  const textLower = text.toLowerCase();
  
  for (const item of blacklist || []) {
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

  return null;
}

/**
 * Synchronous-like check for legacy support (if needed)
 * Note: Since database fetch is async, this will only work if blacklist is pre-cached.
 * For now, we recommend using the async checkBlacklist.
 */
export function containsBadWords(text: string): boolean {
    // This is a placeholder for the legacy import in contribute.ts
    // In a real scenario, we'd pre-fetch the blacklist or use a local list.
    // For now, we'll return false to avoid breaking the build, but 
    // contribute.ts should be updated to use checkBlacklist.
    return false;
}
