import AuthLayout from "@/components/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Cập nhật mật khẩu mới cho tài khoản.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
