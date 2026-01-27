export const WORK_TYPES: Record<string, { subCategories: string[] }> = {
  "Văn xuôi": {
    subCategories: ["Tùy bút", "Nhật ký", "Hồi ký", "Tản văn"],
  },
  "Thơ": {
    subCategories: ["Tứ ngôn", "Ngũ ngôn", "Lục ngôn", "Thất ngôn", "Bát ngôn", "Tự do"],
  },
};

export const CATEGORY_OPTIONS = Object.keys(WORK_TYPES);
