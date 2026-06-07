"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/utils/error-handler";
import { checkRateLimitDistributed } from "@/utils/rate-limit";
import { getRealIp } from "@/utils/ip";

const FORGOT_PASSWORD_IP_LIMIT = 5;
const FORGOT_PASSWORD_EMAIL_LIMIT = 3;
const FORGOT_PASSWORD_WINDOW_MS = 15 * 60 * 1000;

function getSafeBaseUrl(hostHeader: string | null) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      return new URL(siteUrl).origin;
    } catch {
      // Fallback below
    }
  }

  // Without NEXT_PUBLIC_SITE_URL, only allow localhost for local dev.
  // DO NOT trust arbitrary Host headers in production to prevent Host Header Injection.
  if (!hostHeader) {
    return null;
  }

  const host = hostHeader.trim().toLowerCase();
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return `http://${host}`;
  }

  return null;
}

export async function forgotPassword(email: string) {
  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "Email không hợp lệ." };
  }

  const { headers } = await import("next/headers");
  const headersList = await headers();
  const ip = getRealIp(headersList);

  const ipLimit = await checkRateLimitDistributed(
    supabase,
    `forgot-password:ip:${ip}`,
    FORGOT_PASSWORD_IP_LIMIT,
    FORGOT_PASSWORD_WINDOW_MS
  );
  const emailLimit = await checkRateLimitDistributed(
    supabase,
    `forgot-password:email:${normalizedEmail}`,
    FORGOT_PASSWORD_EMAIL_LIMIT,
    FORGOT_PASSWORD_WINDOW_MS
  );

  // Return the same message to reduce account/email probing signal.
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return {
      success: true,
      message: "Nếu email tồn tại, chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.",
    };
  }

  const origin = getSafeBaseUrl(headersList.get("host"));
  if (!origin) {
    return { error: "Không thể xác định domain đặt lại mật khẩu an toàn." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });

  if (error) {
    logger.error("Forgot password request failed:", getErrorMessage(error));
    return {
      success: true,
      message: "Nếu email tồn tại, chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.",
    };
  }

  return {
    success: true,
    message: "Nếu email tồn tại, chúng mình sẽ gửi hướng dẫn đặt lại mật khẩu.",
  };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
  }

  if (password.length > 128) {
    return { error: "Mật khẩu quá dài." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: getErrorMessage(error) };
  }

  return { success: true };
}
