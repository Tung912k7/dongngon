import { checkBlacklist as checkBlacklistAction } from "@/actions/blacklist";

/**
 * Utility to check if a string contains any blacklisted words.
 * This version calls the server action to avoid RLS issues on the client.
 */
export async function checkBlacklist(text: string): Promise<string | null> {
  return checkBlacklistAction(text);
}

/**
 * Legacy support for synchronous-like check.
 * Still returns false by default as it cannot be truly sync with DB.
 */
export function containsBadWords(text: string): boolean {
    return false;
}
