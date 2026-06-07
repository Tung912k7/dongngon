"use client";

import { logger } from "@/lib/logger";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";
import { PrimaryButton } from "@/components/PrimaryButton";
import { InputField } from "./InputField";
import { useAuthNotification } from "@/hooks/useAuthNotification";

const NotificationModal = dynamic(() => import("@/components/NotificationModal"), { ssr: false });

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ identifier: "", password: "" });
  const { notification, setNotification, showNotification, closeNotification } = useAuthNotification();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name])
      setFieldErrors((prev: Record<string, string>) => ({ ...prev, [e.target.name]: "" }));
  };

  const isValid = useMemo(
    () => data.identifier.trim() !== "" && data.password.trim() !== "",
    [data]
  );

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "auth-callback-failed") {
      showNotification(
        "Xác thực không thành công. Link có thể đã hết hạn hoặc không hợp lệ.",
        "error",
        "Lỗi xác thực"
      );
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (
        user &&
        (window.location.pathname === "/dang-nhap" || window.location.pathname === "/dang-ky")
      ) {
        const dest = new URLSearchParams(window.location.search).get("redirectTo") || "/";
        router.push(dest);
        router.refresh();
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFieldErrors: Record<string, string> = {};
    if (!data.identifier.trim()) newFieldErrors.identifier = "Vui lòng nhập bút danh hoặc email.";
    if (!data.password.trim()) newFieldErrors.password = "Vui lòng nhập mật khẩu.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );

    try {
      const supabase = createClient();
      let emailToUse = data.identifier;

      // Handle pen name login
      if (!data.identifier.includes("@")) {
        const { data: profileData, error: profileError } = await (async () => {
          return (await Promise.race([
            supabase.from("profiles").select("email").ilike("nickname", data.identifier).single(),
            timeoutPromise,
          ])) as { data: { email: string } | null; error: unknown };
        })();

        if (profileError) {
          const castedProfileError = profileError as { code?: string; message?: string };
          if (castedProfileError.code === "PGRST116") {
            showNotification(
              `Không tìm thấy người dùng với bút danh/email "${data.identifier}".`,
              "error"
            );
          } else {
            showNotification(
              castedProfileError.message || "Lỗi kiểm tra thông tin tài khoản.",
              "error"
            );
          }
          return;
        }

        if (!profileData?.email) {
          showNotification(
            "Bút danh tồn tại nhưng không có email liên kết. Vui lòng sử dụng Email.",
            "info"
          );
          return;
        }
        emailToUse = profileData.email;
      }

      const {
        data: { user },
        error,
      } = await (async () => {
        return (await Promise.race([
          supabase.auth.signInWithPassword({
            email: emailToUse,
            password: data.password,
          }),
          timeoutPromise,
        ])) as { data: { user: unknown }; error: unknown };
      })();

      if (error) {
        const authError = error as { message: string };
        showNotification(
          authError.message || "Bút danh/Email hoặc mật khẩu không chính xác.",
          "error"
        );
        return;
      }

      if (user) {
        const dest = new URLSearchParams(window.location.search).get("redirectTo") || "/";
        router.push(dest);
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      logger.error("Error during login request", error);
      if (error.message === "TIMEOUT") {
        showNotification("Yêu cầu quá hạn (Timeout). Vui lòng kiểm tra lại kết nối.", "error");
      } else {
        showNotification("Đã xảy ra lỗi.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in max-w-md mx-auto bg-white/40 border border-mist-grey/30 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-[0_8px_24px_rgba(28,27,26,0.02)]"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4.5xl font-ganh font-bold text-deep-teal tracking-tight">
          đăng nhập
        </h1>
      </div>

      <div className="space-y-2">
        <InputField
          label="Bút danh / Email"
          name="identifier"
          value={data.identifier}
          onChange={handleChange}
          maxLength={100}
          error={fieldErrors.identifier}
          autoComplete="username"
        />
        <InputField
          label="Mật khẩu"
          name="password"
          type="password"
          value={data.password}
          onChange={handleChange}
          maxLength={50}
          error={fieldErrors.password}
          autoComplete="current-password"
        />
        <div className="flex justify-end -mt-3 mb-2">
          <Link
            href="/quen-mat-khau"
            className="text-ink-charcoal/50 hover:text-deep-teal transition-all text-xs font-sans font-medium"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <div className="flex justify-center w-full mt-8">
        <PrimaryButton
          type="submit"
          disabled={!isValid || loading}
          className="w-full !rounded-xl !py-3 font-semibold tracking-wide"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </PrimaryButton>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/dang-ky"
          className="text-ink-charcoal/50 hover:text-deep-teal transition-all text-[13px] font-sans font-medium"
        >
          Chưa có tài khoản? Đăng ký ngay
        </Link>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        type={notification.type}
        title={notification.title}
      />
    </form>
  );
}
