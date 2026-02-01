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
export function validatePoeticForm(content: string, hinhThuc: string): { isValid: boolean, error?: string } {
  // If not a formal poetic form, we skip this specific validation
  const limit = POETIC_FORM_LIMITS[hinhThuc] || 
                (hinhThuc.includes("Thơ") && !hinhThuc.includes("tự do") ? parseInt(hinhThuc.replace(/[^0-9]/g, "")) : null);

  if (!limit || isNaN(limit)) return { isValid: true };

  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) return { isValid: false, error: "Nội dung không được để trống." };

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].split(/\s+/).filter(w => w.length > 0);
    if (words.length !== limit) {
      return { 
        isValid: false, 
        error: `Dòng ${i + 1} có ${words.length} chữ. Thể loại ${hinhThuc} yêu cầu đúng ${limit} chữ mỗi dòng.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates email format using a standard regex.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
