import { beforeEach, describe, expect, it, vi } from "vitest";
import { forgotPassword, updatePassword } from "../auth";
import { createClient } from "@/utils/supabase/server";
import * as rateLimit from "@/utils/rate-limit";

vi.mock("@/utils/supabase/server");
vi.mock("@/utils/rate-limit");
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((key: string) => {
      if (key === "host") return "localhost:3000";
      if (key === "x-forwarded-for") return "192.168.1.1";
      return null;
    }),
  }),
}));

describe("Auth Actions", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      auth: {
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase);

    // Mock rate limiting as allowed by default
    vi.mocked(rateLimit.checkRateLimitDistributed).mockResolvedValue({
      allowed: true,
      remaining: 1,
      retryAfterSeconds: 0,
    });
  });

  describe("forgotPassword", () => {
    it("should reject invalid email", async () => {
      const result = await forgotPassword("notanemail");

      expect(result).toEqual({ error: "Email không hợp lệ." });
    });

    it("should reject empty email", async () => {
      const result = await forgotPassword("");

      expect(result).toEqual({ error: "Email không hợp lệ." });
    });

    it("should enforce rate limit by IP", async () => {
      vi.mocked(rateLimit.checkRateLimitDistributed)
        .mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterSeconds: 300 })
        .mockResolvedValueOnce({ allowed: true, remaining: 1, retryAfterSeconds: 0 });

      const result = await forgotPassword("user@example.com");

      expect(result).toEqual({
        success: true,
        message: "Nếu email tồn tại, chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.",
      });
    });

    it("should enforce rate limit by email", async () => {
      vi.mocked(rateLimit.checkRateLimitDistributed)
        .mockResolvedValueOnce({ allowed: true, remaining: 1, retryAfterSeconds: 0 })
        .mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterSeconds: 300 });

      const result = await forgotPassword("user@example.com");

      expect(result).toEqual({
        success: true,
        message: "Nếu email tồn tại, chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.",
      });
    });

    it("should send password reset email with valid input", async () => {
      const result = await forgotPassword("user@example.com");

      expect(result).toEqual({
        success: true,
        message: "Nếu email tồn tại, chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.",
      });

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/callback"),
        })
      );
    });

    it("should normalize email to lowercase", async () => {
      await forgotPassword("User@EXAMPLE.COM");

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.any(Object)
      );
    });

    it("should handle Supabase errors gracefully", async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: "User not found" },
      });

      const result = await forgotPassword("user@example.com");

      expect(result.success).toBe(true);
      expect(result.message).toContain("Nếu email tồn tại");
    });
  });

  describe("updatePassword", () => {
    it("should reject passwords shorter than 8 characters", async () => {
      const result = await updatePassword("short");

      expect(result).toEqual({ error: "Mật khẩu phải có ít nhất 8 ký tự." });
    });

    it("should reject passwords longer than 128 characters", async () => {
      const longPassword = "a".repeat(129);
      const result = await updatePassword(longPassword);

      expect(result).toEqual({ error: "Mật khẩu quá dài." });
    });

    it("should update password with valid input", async () => {
      const result = await updatePassword("SecurePass123");

      expect(result).toEqual({ success: true });
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: "SecurePass123",
      });
    });

    it("should accept 8-character password", async () => {
      const result = await updatePassword("12345678");

      expect(result.success).toBe(true);
    });

    it("should accept 128-character password", async () => {
      const longPassword = "a".repeat(128);
      const result = await updatePassword(longPassword);

      expect(result.success).toBe(true);
    });

    it("should handle Supabase errors", async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        error: { message: "Invalid password" },
      });

      const result = await updatePassword("ValidPass123");

      expect(result).toHaveProperty("error");
    });

    it("should not log password in errors", async () => {
      const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      mockSupabase.auth.updateUser.mockResolvedValue({
        error: { message: "Something went wrong" },
      });

      await updatePassword("SecurePass123");

      const logCalls = logSpy.mock.calls.join(" ");
      expect(logCalls).not.toContain("SecurePass123");

      logSpy.mockRestore();
    });
  });
});
