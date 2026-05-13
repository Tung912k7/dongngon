import AuthLayout from "@/components/AuthLayout";
import { LoginForm } from "@/components/AuthForms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Truy cập tài khoản Đồng ngôn để tiếp tục hành trình viết lách và sáng tạo.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

