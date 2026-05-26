// Test Template for Server Actions
// Location: actions/__tests__/[feature].test.ts
//
// Copy this template and customize for each action.
// Run tests with: npm run test:unit

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWork, deleteWork, updateWork } from "../work";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as rateLimit from "@/utils/rate-limit";

// Mock external dependencies
vi.mock("@/utils/supabase/server");
vi.mock("next/cache");
vi.mock("@/utils/rate-limit");

describe("Work Actions", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockUser: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: "user-123",
      email: "user@example.com",
    };

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Work",
          created_by: mockUser.id,
        },
        error: null,
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase);

    // Mock rate limiting as allowed
    vi.mocked(rateLimit.checkRateLimitDistributed).mockResolvedValue({
      allowed: true,
      remaining: 1,
      retryAfterSeconds: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // TEST SUITE: createWork
  // ============================================================
  describe("createWork", () => {
    const validInput = {
      title: "Beautiful Poem",
      category_type: "Thơ",
      hinh_thuc: "Thơ tự do",
      license: "public",
      writing_rule: "sentence",
      age_rating: "all",
      description: "A beautiful poem about life",
    };

    // AUTHENTICATION TESTS
    describe("Authentication", () => {
      it("should return error if user is not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        const result = await createWork(validInput);

        expect(result).toEqual({
          error: "Bạn cần đăng nhập để tạo tác phẩm.",
        });
      });
    });

    // RATE LIMITING TESTS
    describe("Rate Limiting", () => {
      it("should prevent creation if rate limit exceeded", async () => {
        vi.mocked(rateLimit.checkRateLimitDistributed).mockResolvedValue({
          allowed: false,
          remaining: 0,
          retryAfterSeconds: 3600,
        });

        const result = await createWork(validInput);

        expect(result.error).toContain("quá nhanh");
        expect(result.error).toContain("3600");
      });

      it("should call rate limit checker with correct parameters", async () => {
        await createWork(validInput);

        expect(rateLimit.checkRateLimitDistributed).toHaveBeenCalledWith(
          mockSupabase,
          `create-work:user:${mockUser.id}`,
          6, // CREATE_WORK_LIMIT
          3600000 // CREATE_WORK_WINDOW_MS (1 hour)
        );
      });
    });

    // VALIDATION TESTS
    describe("Input Validation", () => {
      it("should reject empty title", async () => {
        const result = await createWork({
          ...validInput,
          title: "",
        });

        expect(result).toEqual({ error: expect.stringContaining("ký tự") });
      });

      it("should reject title with less than 2 characters", async () => {
        const result = await createWork({
          ...validInput,
          title: "A",
        });

        expect(result).toEqual({ error: expect.stringContaining("ký tự") });
      });

      it("should reject invalid category type", async () => {
        const result = await createWork({
          ...validInput,
          category_type: "Invalid Category",
        });

        expect(result).toEqual({ error: expect.stringContaining("không hợp lệ") });
      });

      it("should reject invalid license", async () => {
        const result = await createWork({
          ...validInput,
          license: "invalid",
        });

        expect(result).toEqual({ error: expect.stringContaining("không hợp lệ") });
      });

      it("should reject invalid writing rule", async () => {
        const result = await createWork({
          ...validInput,
          writing_rule: "invalid_rule",
        });

        expect(result).toEqual({ error: expect.stringContaining("không hợp lệ") });
      });

      it("should reject description over 1000 characters", async () => {
        const longDesc = "a".repeat(1001);
        const result = await createWork({
          ...validInput,
          description: longDesc,
        });

        expect(result.error).toContain("quá dài");
      });
    });

    // SUCCESS TESTS
    describe("Success Cases", () => {
      it("should create work with valid input", async () => {
        const result = await createWork(validInput);

        expect(result).toEqual({
          success: true,
          workId: "123e4567-e89b-12d3-a456-426614174000",
        });
      });

      it("should call Supabase insert with correct data", async () => {
        await createWork(validInput);

        expect(mockSupabase.from).toHaveBeenCalledWith("works");
        expect(mockSupabase.insert).toHaveBeenCalled();
      });

      it("should revalidate cache after creation", async () => {
        await createWork(validInput);

        expect(revalidatePath).toHaveBeenCalledWith("/kho-tang");
      });

      it("should accept optional description", async () => {
        const result = await createWork({
          ...validInput,
          description: undefined,
        });

        expect(result.success).toBe(true);
      });
    });

    // ERROR HANDLING TESTS
    describe("Error Handling", () => {
      it("should handle database errors gracefully", async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: {
            code: "23505",
            message: "duplicate key value violates unique constraint",
          },
        });

        const result = await createWork(validInput);

        expect(result).toHaveProperty("error");
        expect(result.error).toContain("tồn tại");
      });

      it("should handle unexpected errors", async () => {
        // Instead of rejecting, mock returning a catastrophic error object from Supabase
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        });

        const result = await createWork(validInput);

        expect(result).toHaveProperty("error");
      });
    });
  });

  // ============================================================
  // TEST SUITE: updateWork (Example for reference)
  // ============================================================
  describe("updateWork", () => {
    const validInput = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Updated Title",
      description: "Updated description",
    };

    it("should require authentication", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await updateWork(validInput.id, { title: validInput.title, description: validInput.description });

      expect(result).toHaveProperty("error");
    });



    it("should update work if user is owner", async () => {
      const result = await updateWork(validInput.id, { title: validInput.title, description: validInput.description });

      expect(result.success).toBe(true);
    });
  });

  // ============================================================
  // TEST SUITE: deleteWork (Example for reference)
  // ============================================================
  describe("deleteWork", () => {
    it("should require authentication", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await deleteWork("123e4567-e89b-12d3-a456-426614174000");

      expect(result).toHaveProperty("error");
    });

    it("should delete work if user is owner", async () => {
      const result = await deleteWork("123e4567-e89b-12d3-a456-426614174000");

      expect(result.success).toBe(true);
    });
  });
});

// ============================================================
// UTILITY TESTS (Example)
// ============================================================

describe("Validation Utilities", () => {
  describe("sanitizeTitle", () => {
    it("should remove XSS attack vectors", () => {
      // Import from utils/sanitizer.ts
      // const result = sanitizeTitle("<script>alert('xss')</script>");
      // expect(result).not.toContain("<script>");
    });

    it("should trim whitespace", () => {
      // Test trim behavior
    });
  });
});
