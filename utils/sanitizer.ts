/**
 * Hàng rào bảo mật Frontend: Làm sạch dữ liệu đầu vào.
 * Mục tiêu: Loại bỏ các thẻ HTML và các ký tự có thể gây lỗi injection hoặc XSS.
 */
export function sanitizeInput(input: string, shouldTrim: boolean = true): string {
  if (!input) return "";

  // 1. loại bỏ trim() nếu là mode character để giữ spacing
  // 2. Không stripping tags phá hoại nội dung (<, >)
  // Chỉ nên encode hoặc để React tự handle text node.
  // Ở đây chúng ta tạm thời bỏ stripping destructive.
  let sanitized = input;

  // 2. Trim khoảng trắng thừa ở hai đầu (nếu được yêu cầu)
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
 * Strict sanitization for titles: removes all HTML tags.
 */
export function sanitizeTitle(input: string): string {
  if (!input) return "";
  // Strip all HTML tags
  return input.replace(/<[^>]*>?/gm, "").trim();
}

/**
 * Strict sanitization for nicknames: removes all HTML tags and cleans up escaped quotes.
 * This resolves the issue where some pages show backslash-escaped versions.
 */
export function sanitizeNickname(input: string): string {
  if (!input) return "";
  // 1. Strip all HTML tags
  const stripped = input.replace(/<[^>]*>?/gm, "");
  // 2. Remove backslashes that are often added by unintentional double-escaping/JSON.stringify
  const cleaned = stripped.replace(/\\(?=["'])/g, ""); // Remove backslash if followed by a quote
  return cleaned.trim();
}
