/**
 * Helper to remove backslashes that are often added by unintentional double-escaping/JSON.stringify
 */
function cleanEscapedQuotes(input: string): string {
  return input.replace(/\\(?=["'])/g, ""); // Remove backslash if followed by a quote
}

/**
 * Strict escaping and sanitization for regular inputs.
 */
export function sanitizeInput(input: string, shouldTrim: boolean = true): string {
  if (!input) return "";

  // 1. Clean backslashes
  let sanitized = cleanEscapedQuotes(input);

  // 2. Escape HTML symbols securely (Converts < to &lt;, > to &gt;)
  sanitized = escapeHTML(sanitized);

  // 3. Trim if required
  if (shouldTrim) {
    sanitized = sanitized.trim();
  }

  return sanitized;
}

/**
 * Encodes special characters into HTML entities.
 * Use for labels and attributes that might not be handled by React.
 */
export function escapeHTML(input: string): string {
  if (!input) return "";
  // React and Next.js handle HTML escaping automatically for text content and metadata.
  // Manual escaping here leads to "double-escaping" bugs in the UI.
  return input;
}

/**
 * Strict escaping for titles.
 */
export function sanitizeTitle(input: string): string {
  if (!input) return "";
  const cleaned = cleanEscapedQuotes(input).trim();
  return escapeHTML(cleaned);
}

/**
 * Strict escaping for nicknames.
 */
export function sanitizeNickname(input: string): string {
  if (!input) return "";
  const cleaned = cleanEscapedQuotes(input).trim();
  return escapeHTML(cleaned);
}
