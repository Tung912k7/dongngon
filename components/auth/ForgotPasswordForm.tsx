"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { PrimaryButton } from "@/components/PrimaryButton";
import { InputField } from "./InputField";
import { useAuthNotification } from "@/hooks/useAuthNotification";
import { forgotPassword } from "@/actions/auth";

const NotificationModal = dynamic(() => import("@/components/NotificationModal"), { ssr: false });

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { notification, showNotification, closeNotification } = useAuthNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email.trim());
      if (result.success) {
        showNotification(
          "Link đặt lại mật khẩu đã được gửi vào Email của bạn. Vui lòng kiểm tra (cả mục thư rác).",
          "success",
          "Đã gửi Email"
        );
        setEmail("");
      } else {
        showNotification(result.error || "Có lỗi xảy ra.", "error");
      }
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(error.message || "Đã xảy ra lỗi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in max-w-md mx-auto bg-white/40 border border-mist-grey/30 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-[0_8px_24px_rgba(28,27,26,0.02)]"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4.5xl font-ganh font-bold text-deep-teal tracking-tight text-nowrap">
          quên mật khẩu
        </h1>
      </div>

      <p className="text-center text-ink-charcoal/60 mb-8 text-[13.5px] font-sans leading-relaxed">
        Nhập email đã đăng ký của bạn để nhận liên kết khôi phục lại mật khẩu.
      </p>

      <div className="space-y-2">
        <InputField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="flex justify-center w-full mt-8">
        <PrimaryButton
          type="submit"
          disabled={loading}
          className="w-full !rounded-xl !py-3 font-semibold tracking-wide"
        >
          {loading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
        </PrimaryButton>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/dang-nhap"
          className="text-ink-charcoal/50 hover:text-deep-teal transition-all text-[13px] font-sans font-medium"
        >
          Quay lại Đăng nhập
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
