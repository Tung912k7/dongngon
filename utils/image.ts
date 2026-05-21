/**
 * Safely get avatar URL, handling legacy paths with spaces and null values.
 */
/**
 * Safely get image URL, handling legacy paths with spaces and null values.
 */
export function getImageUrl(url: string | null | undefined): string {
  const DEFAULT_AVATAR = "/webp/default_avatar.webp";

  if (!url) return DEFAULT_AVATAR;

  // Fix legacy paths with spaces (both encoded and raw)
  let cleanUrl = url;

  // Handle webp file paths
  cleanUrl = cleanUrl.replace(/\/webp%20file\//g, "/webp/");
  cleanUrl = cleanUrl.replace(/\/webp file\//g, "/webp/");

  // Handle png file paths
  cleanUrl = cleanUrl.replace(/\/png%20file\//g, "/png/");
  cleanUrl = cleanUrl.replace(/\/png file\//g, "/png/");

  return cleanUrl;
}

/**
 * @deprecated Use getImageUrl instead
 */
export const getAvatarUrl = getImageUrl;
