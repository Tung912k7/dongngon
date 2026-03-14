import { describe, expect, it } from "vitest";

import {
  getReadOnlyProseContributionError,
  READ_ONLY_PROSE_CONTRIBUTION_ERROR,
} from "@/actions/contribute-policy";
import { isReadOnlyProseSubCategory } from "@/data/workTypes";

describe("isReadOnlyProseSubCategory", () => {
  it("nhận diện đúng các tiểu loại văn xuôi chỉ xem", () => {
    expect(isReadOnlyProseSubCategory("Nhật ký (chỉ xem)")).toBe(true);
    expect(isReadOnlyProseSubCategory("Hồi ký (chỉ xem)")).toBe(true);
    expect(isReadOnlyProseSubCategory("Nhật ký")).toBe(false);
  });
});

describe("getReadOnlyProseContributionError", () => {
  it("chặn người không phải chủ tác phẩm với Nhật ký (chỉ xem)", () => {
    const result = getReadOnlyProseContributionError({
      subCategory: "Nhật ký (chỉ xem)",
      ownerId: "owner-1",
      contributorId: "user-2",
    });

    expect(result).toBe(READ_ONLY_PROSE_CONTRIBUTION_ERROR);
  });

  it("chặn người không phải chủ tác phẩm với Hồi ký (chỉ xem)", () => {
    const result = getReadOnlyProseContributionError({
      subCategory: "Hồi ký (chỉ xem)",
      ownerId: "owner-1",
      contributorId: "user-2",
    });

    expect(result).toBe(READ_ONLY_PROSE_CONTRIBUTION_ERROR);
  });

  it("không chặn chủ tác phẩm với Nhật ký (chỉ xem)", () => {
    const result = getReadOnlyProseContributionError({
      subCategory: "Nhật ký (chỉ xem)",
      ownerId: "owner-1",
      contributorId: "owner-1",
    });

    expect(result).toBeNull();
  });
});