export const PROSE_SUBCATEGORIES = [
  "Tùy bút",
  "Nhật ký",
  "Nhật ký (chỉ xem)",
  "Hồi ký",
  "Hồi ký (chỉ xem)",
  "Tản văn",
] as const;

export const READ_ONLY_PROSE_SUBCATEGORIES = [
  "Nhật ký (chỉ xem)",
  "Hồi ký (chỉ xem)",
] as const;

export function isReadOnlyProseSubCategory(subCategory?: string | null): boolean {
  if (!subCategory) return false;
  return READ_ONLY_PROSE_SUBCATEGORIES.includes(
    subCategory as (typeof READ_ONLY_PROSE_SUBCATEGORIES)[number]
  );
}

export const WORK_TYPES: Record<string, { subCategories: string[] }> = {
  "Văn xuôi": {
    subCategories: [...PROSE_SUBCATEGORIES],
  },
  "Thơ": {
    subCategories: ["Tứ ngôn", "Ngũ ngôn", "Lục ngôn", "Thất ngôn", "Bát ngôn", "Tự do"],
  },
};

export const CATEGORY_OPTIONS = Object.keys(WORK_TYPES);
