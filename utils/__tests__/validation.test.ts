import { describe, expect, it } from "vitest";
import { POETIC_FORM_LIMITS, validatePoeticForm } from "@/utils/validation";

describe("Validation Utilities", () => {
  describe("validatePoeticForm", () => {
    describe("Poetic Form Limits", () => {
      it("should have correct form limits", () => {
        expect(POETIC_FORM_LIMITS["Tứ ngôn"]).toBe(4);
        expect(POETIC_FORM_LIMITS["Ngũ ngôn"]).toBe(5);
        expect(POETIC_FORM_LIMITS["Lục ngôn"]).toBe(6);
        expect(POETIC_FORM_LIMITS["Thất ngôn"]).toBe(7);
        expect(POETIC_FORM_LIMITS["Bát ngôn"]).toBe(8);
      });
    });

    describe("Sentence Mode (1 câu)", () => {
      it("should accept content matching form requirement", () => {
        const content = "Một hai ba bốn";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should reject content with fewer words than required", () => {
        const content = "Một hai ba";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("4 chữ");
      });

      it("should reject content with more words than required", () => {
        const content = "Một hai ba bốn năm";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(false);
        expect(result.error).toContain("4 chữ");
      });

      it("should handle Ngũ ngôn form", () => {
        const validContent = "Một hai ba bốn năm";
        const result = validatePoeticForm(validContent, "Ngũ ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should handle Lục ngôn form", () => {
        const validContent = "Một hai ba bốn năm sáu";
        const result = validatePoeticForm(validContent, "Lục ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should handle Thất ngôn form", () => {
        const validContent = "Một hai ba bốn năm sáu bảy";
        const result = validatePoeticForm(validContent, "Thất ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should handle Bát ngôn form", () => {
        const validContent = "Một hai ba bốn năm sáu bảy tám";
        const result = validatePoeticForm(validContent, "Bát ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should normalize writing rule variations", () => {
        const content = "Một hai ba bốn";

        const result1 = validatePoeticForm(content, "Tứ ngôn", "1 câu");
        const result2 = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(true);
      });

      it("should trim whitespace from content", () => {
        const content = "  Một hai ba bốn  ";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should handle multiple spaces between words", () => {
        const content = "Một  hai  ba  bốn";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });
    });

    describe("Non-Sentence Mode", () => {
      it("should accept any content when no writing rule specified", () => {
        const content = "Random content here";
        const result = validatePoeticForm(content, "Thơ tự do");

        expect(result.isValid).toBe(true);
      });

      it("should accept free verse poetry", () => {
        const content = "Thơ tự do không có quy tắc";
        const result = validatePoeticForm(content, "Thơ tự do");

        expect(result.isValid).toBe(true);
      });

      it("should accept prose without strict form", () => {
        const content = "Dài hoặc ngắn tùy ý";
        const result = validatePoeticForm(content, "Văn xuôi");

        expect(result.isValid).toBe(true);
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty content", () => {
        const result = validatePoeticForm("", "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(false);
      });

      it("should handle single word", () => {
        const result = validatePoeticForm("Word", "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(false);
      });

      it("should handle undefined writing rule", () => {
        const content = "Một hai ba bốn năm sáu";
        const result = validatePoeticForm(content, "Thơ tự do", undefined);

        expect(result.isValid).toBe(true);
      });

      it("should handle null writing rule", () => {
        const content = "Một hai ba bốn";
        const result = validatePoeticForm(content, "Tứ ngôn", null as unknown as string);

        expect(result.isValid).toBe(true);
      });

      it("should handle unknown poetic form", () => {
        const content = "Một hai ba bốn";
        const result = validatePoeticForm(content, "Unknown Form", "sentence");

        // Should be valid if form is not recognized
        expect(result.isValid).toBe(true);
      });

      it("should handle numeric word count extraction", () => {
        const content = "Một hai ba bốn";
        const result = validatePoeticForm(content, "Thơ 4 chữ", "sentence");

        // Should extract 4 from "Thơ 4 chữ"
        expect(result.isValid).toBe(true);
      });
    });

    describe("Vietnamese Text Handling", () => {
      it("should handle Vietnamese accents", () => {
        const content = "Thầm tìm lại lời thương";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should count Vietnamese words correctly", () => {
        const content = "Tôi yêu thơ văn Việt Nam";
        const result = validatePoeticForm(content, "Ngũ ngôn", "sentence");

        expect(result.isValid).toBe(true);
      });

      it("should handle Vietnamese punctuation", () => {
        const content = "Anh ơi, em yêu anh";
        const result = validatePoeticForm(content, "Ngũ ngôn", "sentence");

        // Should count 5 words, punctuation doesn't count
        expect(result.isValid).toBe(true);
      });
    });

    describe("Error Messages", () => {
      it("should provide clear error message when word count mismatch", () => {
        const content = "Một hai ba";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.error).toContain("Tứ ngôn");
        expect(result.error).toContain("4 chữ");
      });

      it("should include form name in error", () => {
        const content = "Mộthai ba";
        const result = validatePoeticForm(content, "Ngũ ngôn", "sentence");

        expect(result.error).toContain("Ngũ ngôn");
      });

      it("should not have error when valid", () => {
        const content = "Một hai ba bốn";
        const result = validatePoeticForm(content, "Tứ ngôn", "sentence");

        expect(result.error).toBeUndefined();
      });
    });
  });
});
