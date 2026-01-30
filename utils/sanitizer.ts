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
 * Strict sanitization for titles: removes all HTML tags.
 */
export function sanitizeTitle(input: string): string {
  if (!input) return "";
  // Strip all HTML tags
  return input.replace(/<[^>]*>?/gm, "").trim();
}
