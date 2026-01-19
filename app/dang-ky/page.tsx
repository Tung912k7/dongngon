import AuthLayout from "@/components/AuthLayout";
import { SignUpForm } from "@/components/AuthForms";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
