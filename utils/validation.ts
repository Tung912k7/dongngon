export const POETIC_FORM_LIMITS: Record<string, number> = {
  "Tứ ngôn": 4,
  "Ngũ ngôn": 5,
  "Lục ngôn": 6,
  "Thất ngôn": 7,
  "Bát ngôn": 8
};

/**
 * Validates content against a poetic form's word count rules.
 * @returns { isValid: boolean, error?: string }
 */
export function validatePoeticForm(content: string, hinhThuc: string, writingRule?: string): { isValid: boolean, error?: string } {
  // 1. Get word count of current contribution
  const words = content.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const normalizedWritingRule = writingRule === '1 câu' || writingRule === 'sentence'
    ? 'sentence'
    : writingRule
      ? 'sentence'
      : undefined;

  // 2. Get required words for the poetic form
  const requiredWords = POETIC_FORM_LIMITS[hinhThuc] || 
                (hinhThuc.includes("Thơ") && !hinhThuc.includes("tự do") ? parseInt(hinhThuc.replace(/[^0-9]/g, "")) : null);

  // 3. Sentence Mode (1 câu)
  // Enforce the full line length matching the poetic form.
  if (normalizedWritingRule === 'sentence') {
    if (!requiredWords || isNaN(requiredWords)) return { isValid: true };

    if (wordCount === requiredWords) {
      return { isValid: true };
    }
    
    return { 
      isValid: false, 
      error: `Thể loại ${hinhThuc} yêu cầu đúng ${requiredWords} chữ mỗi dòng.`
    };
  }

  // Fallback for non-poetry or undefined rule
  return { isValid: true };
}

/**
 * Validates email format using a standard regex.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
