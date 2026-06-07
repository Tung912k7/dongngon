"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { PrimaryButton } from "@/components/PrimaryButton";
import { InputField } from "./InputField";
import { useAuthNotification } from "@/hooks/useAuthNotification";
import { updatePassword } from "@/actions/auth";

const NotificationModal = dynamic(() => import("@/components/NotificationModal"), { ssr: false });

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notification, showNotification, closeNotification } = useAuthNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    if (password !== confirmPassword) {
      showNotification("Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePassword(password);
      if (result.success) {
        showNotification("Mật khẩu của bạn đã được cập nhật thành công!", "success", "Thành công");
        setTimeout(() => router.push("/dang-nhap"), 2000);
      } else {
        showNotification(result.error || "Có lỗi xảy ra.", "error");
      }
    } catch {
      showNotification("Đã xảy ra lỗi.", "error");
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
        <h1 className="text-3xl md:text-4.5xl font-ganh font-bold text-deep-teal tracking-tight text-nowrap">
          đặt lại mật khẩu
        </h1>
      </div>

      <div className="space-y-2">
        <InputField
          label="Mật khẩu mới"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={50}
        />
        <InputField
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          maxLength={50}
        />
      </div>

      <div className="flex justify-center w-full mt-8">
        <PrimaryButton
          type="submit"
          disabled={!password.trim() || loading}
          className="w-full !rounded-xl !py-3 font-semibold tracking-wide"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </PrimaryButton>
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
