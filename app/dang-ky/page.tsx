import AuthLayout from "@/components/AuthLayout";
import { SignUpForm } from "@/components/AuthForms";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký thành viên",
  description: "Bắt đầu hành trình sáng tạo tại Đồng ngôn — nơi mọi ý tưởng đều tìm thấy tiếng nói chung.",
};

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}

