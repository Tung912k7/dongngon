/**
 * Helper to remove backslashes that are often added by unintentional double-escaping/JSON.stringify
 */
function cleanEscapedQuotes(input: string): string {
  return input.replace(/\\(?=["'])/g, ""); // Remove backslash if followed by a quote
}

/**
 * Hàng rào bảo mật: Làm sạch dữ liệu đầu vào.
 * Mục tiêu: Loại bỏ các thẻ HTML và các ký tự có thể gây lỗi injection hoặc XSS.
 */
export function sanitizeInput(input: string, shouldTrim: boolean = true): string {
  if (!input) return "";

  // 1. Loại bỏ các thẻ HTML để tránh XSS
  let sanitized = input.replace(/<[^>]*>?/gm, "");
  
  // 2. Làm sạch các dấu backslash thừa trước dấu ngoặc
  sanitized = cleanEscapedQuotes(sanitized);

  // 3. Trim khoảng trắng thừa ở hai đầu (nếu được yêu cầu)
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
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;'
  };
  return input.replace(/[&<>"'/]/g, (m) => map[m]);
}

/**
 * Strict sanitization for titles: removes all HTML tags and cleans escaped quotes.
 */
export function sanitizeTitle(input: string): string {
  if (!input) return "";
  // Strip all HTML tags and clean escaped quotes
  const stripped = input.replace(/<[^>]*>?/gm, "");
  return cleanEscapedQuotes(stripped).trim();
}

/**
 * Strict sanitization for nicknames: removes all HTML tags and cleans up escaped quotes.
 * This resolves the issue where some pages show backslash-escaped versions.
 */
export function sanitizeNickname(input: string): string {
  if (!input) return "";
  // Strip all HTML tags and clean escaped quotes
  const stripped = input.replace(/<[^>]*>?/gm, "");
  return cleanEscapedQuotes(stripped).trim();
}
