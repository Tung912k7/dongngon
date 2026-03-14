import { isReadOnlyProseSubCategory } from "@/data/workTypes";

export const READ_ONLY_PROSE_CONTRIBUTION_ERROR =
  "Mục này ở chế độ chỉ xem. Chỉ chủ tác phẩm mới có thể đóng góp.";

type ReadOnlyProseContributionRuleInput = {
  subCategory?: string | null;
  ownerId?: string | null;
  contributorId?: string | null;
};

export function getReadOnlyProseContributionError({
  subCategory,
  ownerId,
  contributorId,
}: ReadOnlyProseContributionRuleInput): string | null {
  if (!isReadOnlyProseSubCategory(subCategory)) {
    return null;
  }

  return ownerId === contributorId ? null : READ_ONLY_PROSE_CONTRIBUTION_ERROR;
}