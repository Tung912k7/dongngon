/**
 * Hàng rào bảo mật Frontend: Làm sạch dữ liệu đầu vào.
 * Mục tiêu: Loại bỏ các thẻ HTML và các ký tự có thể gây lỗi injection hoặc XSS.
 */
export function sanitizeInput(input: string, shouldTrim: boolean = true): string {
  if (!input) return "";

  // 1. Loại bỏ các thẻ HTML (Strip HTML tags)
  let sanitized = input.replace(/<[^>]*>?/gm, "");

  // 2. Trim khoảng trắng thừa ở hai đầu (nếu được yêu cầu)
  if (shouldTrim) {
    sanitized = sanitized.trim();
  }

  return sanitized;
}
