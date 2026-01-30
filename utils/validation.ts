/**
 * Validates a contribution based on the work's writing rule.
 * Returns null if valid, or an error message if invalid.
 */
export function validateWritingRule(content: string, rule: string): string | null {
  const trimmed = content.trim();
  if (trimmed.length === 0) return "Nội dung không được để trống.";

  if (rule === "1 kí tự") {
    const nonWhitespace = trimmed.replace(/\s+/g, "");
    if (nonWhitespace.length !== 1) {
      return "Quy tắc của tác phẩm này là '1 kí tự'. Vui lòng chỉ nhập đúng một chữ cái hoặc kí tự.";
    }
  } else {
    // Default or "1 câu"
    const hasPunctuation = /[.!?…]$/.test(trimmed);
    if (!hasPunctuation) {
      return "Quy tắc của tác phẩm này là '1 câu'. Câu của bạn cần kết thúc bằng dấu câu (vd: . ! ? ...).";
    }
  }

  return null;
}

/**
 * Basic email format validation.
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant regex
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email.trim());
}
