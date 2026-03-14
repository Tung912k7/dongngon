import { beforeEach, describe, expect, it, vi } from "vitest";

import { READ_ONLY_PROSE_CONTRIBUTION_ERROR } from "@/actions/contribute-policy";

const mockCreateClient = vi.hoisted(() => vi.fn());
const mockRevalidatePath = vi.hoisted(() => vi.fn());
const mockCheckBlacklist = vi.hoisted(() => vi.fn());
const mockSanitizeInput = vi.hoisted(() => vi.fn());
const mockCheckRateLimitDistributed = vi.hoisted(() => vi.fn());
const mockCaptureServerEvent = vi.hoisted(() => vi.fn());
const mockGetErrorMessage = vi.hoisted(() => vi.fn());
const mockValidatePoeticForm = vi.hoisted(() => vi.fn());

vi.mock("@/utils/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

vi.mock("@/utils/blacklist", () => ({
  checkBlacklist: mockCheckBlacklist,
}));

vi.mock("@/utils/sanitizer", () => ({
  sanitizeInput: mockSanitizeInput,
}));

vi.mock("@/utils/rate-limit", () => ({
  checkRateLimitDistributed: mockCheckRateLimitDistributed,
}));

vi.mock("@/utils/posthog-server", () => ({
  captureServerEvent: mockCaptureServerEvent,
}));

vi.mock("@/utils/error-handler", () => ({
  getErrorMessage: mockGetErrorMessage,
}));

vi.mock("@/utils/validation", () => ({
  validatePoeticForm: mockValidatePoeticForm,
}));

import { submitContribution } from "@/actions/contribute";

const VALID_WORK_ID = "11111111-1111-4111-8111-111111111111";
const OWNER_ID = "owner-1";
const OTHER_USER_ID = "user-2";

type SupabaseMockOptions = {
  user: { id: string } | null;
  work: {
    status: string;
    limit_type: string;
    sub_category: string | null;
    created_by: string | null;
    title: string;
    age_rating: string | null;
  } | null;
  recentContributions?: Array<{ created_at: string }>;
  profile?: {
    nickname?: string | null;
    birthday?: string | null;
    activated_at?: string | null;
  } | null;
};

function createSupabaseMock({
  user,
  work,
  recentContributions = [],
  profile = null,
}: SupabaseMockOptions) {
  const workSingle = vi.fn(async () => ({ data: work, error: null }));
  const workEq = vi.fn(() => ({ single: workSingle }));
  const worksSelect = vi.fn(() => ({ eq: workEq }));
  const worksUpdateEq = vi.fn(async () => ({ error: null }));
  const worksUpdate = vi.fn(() => ({ eq: worksUpdateEq }));

  const recentContributionQuery = {
    eq: vi.fn(),
    gte: vi.fn(async () => ({ data: recentContributions, error: null })),
  };
  recentContributionQuery.eq.mockReturnValue(recentContributionQuery);

  const contributionsInsert = vi.fn(async () => ({ error: null }));
  const contributionsSelect = vi.fn(() => recentContributionQuery);

  const profileSingle = vi.fn(async () => ({ data: profile, error: null }));
  const profileEq = vi.fn(() => ({ single: profileSingle }));
  const profilesSelect = vi.fn(() => ({ eq: profileEq }));
  const profilesUpdateIs = vi.fn(async () => ({ error: null }));
  const profilesUpdateEq = vi.fn(() => ({ is: profilesUpdateIs }));
  const profilesUpdate = vi.fn(() => ({ eq: profilesUpdateEq }));

  const notificationsInsert = vi.fn(async () => ({ error: null }));

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      switch (table) {
        case "works":
          return {
            select: worksSelect,
            update: worksUpdate,
          };
        case "contributions":
          return {
            select: contributionsSelect,
            insert: contributionsInsert,
          };
        case "profiles":
          return {
            select: profilesSelect,
            update: profilesUpdate,
          };
        case "notifications":
          return {
            insert: notificationsInsert,
          };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    }),
  };

  return {
    supabase,
    spies: {
      contributionsInsert,
      notificationsInsert,
      worksUpdate,
      worksUpdateEq,
      worksSelect,
    },
  };
}

describe("submitContribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimitDistributed.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mockCheckBlacklist.mockResolvedValue(null);
    mockSanitizeInput.mockImplementation((value: string) => value.trim());
    mockCaptureServerEvent.mockResolvedValue(undefined);
    mockGetErrorMessage.mockReturnValue("Unexpected error");
    mockValidatePoeticForm.mockReturnValue({ isValid: true });
  });

  it("blocks a non-owner from contributing to read-only prose", async () => {
    const { supabase, spies } = createSupabaseMock({
      user: { id: OTHER_USER_ID },
      work: {
        status: "draft",
        limit_type: "sentence",
        sub_category: "Nhật ký (chỉ xem)",
        created_by: OWNER_ID,
        title: "Read-only diary",
        age_rating: null,
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await submitContribution(VALID_WORK_ID, "Noi dung dong gop");

    expect(result).toEqual({ error: READ_ONLY_PROSE_CONTRIBUTION_ERROR });
    expect(spies.contributionsInsert).not.toHaveBeenCalled();
    expect(spies.notificationsInsert).not.toHaveBeenCalled();
    expect(mockValidatePoeticForm).not.toHaveBeenCalled();
    expect(mockCaptureServerEvent).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("allows the owner to contribute to read-only prose and returns success", async () => {
    const { supabase, spies } = createSupabaseMock({
      user: { id: OWNER_ID },
      work: {
        status: "draft",
        limit_type: "sentence",
        sub_category: "Nhật ký (chỉ xem)",
        created_by: OWNER_ID,
        title: "Read-only diary",
        age_rating: null,
      },
      profile: {
        nickname: "Tac gia",
        birthday: null,
        activated_at: "2026-01-01T00:00:00.000Z",
      },
    });
    mockCreateClient.mockResolvedValue(supabase);

    const result = await submitContribution(VALID_WORK_ID, "Noi dung dong gop");

    expect(result).toEqual({ success: true });
    expect(mockValidatePoeticForm).toHaveBeenCalledWith(
      "Noi dung dong gop",
      "Nhật ký (chỉ xem)",
      "sentence"
    );
    expect(spies.contributionsInsert).toHaveBeenCalledOnce();
    expect(spies.notificationsInsert).not.toHaveBeenCalled();
    expect(mockCaptureServerEvent).toHaveBeenCalledOnce();
    expect(mockCaptureServerEvent).toHaveBeenCalledWith(OWNER_ID, "contribution_submitted", {
      work_id: VALID_WORK_ID,
      is_first: false,
      event_source: "server_action",
      event_version: 1,
    });
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(1, `/work/${VALID_WORK_ID}`);
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(2, "/profile");
  });
});