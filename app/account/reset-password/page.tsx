import AuthLayout from "@/components/AuthLayout";
import { ResetPasswordForm } from "@/components/AuthForms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Cập nhật mật khẩu mới cho tài khoản của bạn.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
