import AuthLayout from "@/components/AuthLayout";
import { ForgotPasswordForm } from "@/components/AuthForms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Lấy lại mật khẩu tài khoản của bạn.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
