"use client";

import { logger } from "@/lib/logger";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { REGULATIONS_CONTENT, TERMS_CONTENT } from "@/data/legalContent";
import { isEmailRegistered, isNicknameAvailable } from "@/actions/profile";
import dynamic from "next/dynamic";
import { PrimaryButton } from "@/components/PrimaryButton";
import { sanitizeNickname } from "@/utils/sanitizer";
import { InputField } from "./InputField";
import { Checkbox } from "./Checkbox";
import { Portal } from "./Portal";
import { useAuthNotification } from "@/hooks/useAuthNotification";

const NotificationModal = dynamic(() => import("@/components/NotificationModal"), { ssr: false });

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<"terms" | "regulations" | null>(null);
  const [data, setData] = useState({
    fullName: "",
    email: "",
    penName: "",
    password: "",
    birthday: "",
    agreedToTerms: false,
    agreedToRegulations: false,
  });

  const { notification, showNotification, closeNotification } = useAuthNotification();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (fieldErrors[name])
      setFieldErrors((prev: Record<string, string>) => ({ ...prev, [name]: "" }));
  };

  const isValid = useMemo(
    () =>
      data.fullName.trim() !== "" &&
      data.email.trim() !== "" &&
      data.penName.trim() !== "" &&
      data.password.trim() !== "" &&
      data.birthday.trim() !== "" &&
      data.agreedToTerms &&
      data.agreedToRegulations,
    [data]
  );

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/");
        router.refresh();
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFieldErrors: Record<string, string> = {};
    if (!data.fullName.trim()) newFieldErrors.fullName = "Họ và tên không được để trống.";
    if (!data.email.trim()) newFieldErrors.email = "Email không được để trống.";
    if (!data.penName.trim()) newFieldErrors.penName = "Bút danh không được để trống.";
    if (!data.password.trim()) newFieldErrors.password = "Mật khẩu không được để trống.";
    if (!data.birthday.trim()) newFieldErrors.birthday = "Ngày sinh không được để trống.";
    if (!data.agreedToTerms) newFieldErrors.agreedToTerms = "Bạn cần đồng ý với điều khoản.";
    if (!data.agreedToRegulations)
      newFieldErrors.agreedToRegulations = "Bạn cần đồng ý với quy định.";

    // Validation: Password strength
    if (data.password.trim()) {
      if (data.password.length < 8) {
        newFieldErrors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
      } else if (data.password.length > 50) {
        newFieldErrors.password = "Mật khẩu không được vượt quá 50 ký tự.";
      } else if (!/[a-z]/.test(data.password)) {
        newFieldErrors.password = "Mật khẩu phải chứa ít nhất một chữ thường (a-z).";
      } else if (!/[A-Z]/.test(data.password)) {
        newFieldErrors.password = "Mật khẩu phải chứa ít nhất một chữ hoa (A-Z).";
      } else if (!/[0-9]/.test(data.password)) {
        newFieldErrors.password = "Mật khẩu phải chứa ít nhất một chữ số (0-9).";
      } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(data.password)) {
        newFieldErrors.password = "Mật khẩu phải chứa ít nhất một ký tự đặc biệt.";
      }
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 20000)
    );

    try {
      const supabase = createClient();

      const { checkBlacklist } = await import("@/utils/blacklist");

      const violation = (await Promise.race([
        checkBlacklist(sanitizeNickname(data.penName)),
        timeoutPromise,
      ])) as string | null;

      if (violation) {
        showNotification(
          `Bút danh "${data.penName}" chứa từ không cho phép (${violation}). Vui lòng chọn tên khác.`,
          "error"
        );
        return;
      }

      const isEmailTaken = await Promise.race([isEmailRegistered(data.email), timeoutPromise]);

      if (isEmailTaken) {
        showNotification(
          `Email "${data.email}" đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.`,
          "info",
          "Thông báo"
        );
        return;
      }

      const isAvailable = await Promise.race([
        isNicknameAvailable(sanitizeNickname(data.penName)),
        timeoutPromise,
      ]);

      if (!isAvailable) {
        showNotification(
          `Bút danh "${data.penName}" đã được sử dụng. Vui lòng chọn tên khác.`,
          "error"
        );
        return;
      }

      const { data: authData, error: authError } = (await Promise.race([
        supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              nickname: sanitizeNickname(data.penName),
              birthday: data.birthday,
            },
          },
        }),
        timeoutPromise,
      ])) as { data: { user: { id: string } | null }; error: { message: string } | null };

      if (authError) {
        let errorMsg = authError.message;
        if (errorMsg.includes("Password should be at least")) {
          errorMsg = "Mật khẩu không đáp ứng yêu cầu bảo mật.";
        } else if (errorMsg === "User already registered") {
          errorMsg = "Email này đã được đăng ký.";
        }
        showNotification(errorMsg || "Lỗi đăng ký tài khoản.", "error");
        return;
      }

      if (authData.user) {
        showNotification(
          "Đăng ký thành công! Vui lòng kiểm tra Email (kiểm tra cả mục thư rác) để xác nhận tài khoản.",
          "success",
          "Xác nhận Email"
        );
      }
    } catch (err: unknown) {
      const error = err as Error;
      logger.error("Signup error:", error);
      if (error.message === "TIMEOUT") {
        showNotification("Yêu cầu quá hạn (Timeout). Vui lòng thử lại sau.", "error");
      } else {
        showNotification("Đã xảy ra lỗi trong quá trình đăng ký.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
        {/* Left Side: Form */}
        <div className="w-full flex justify-center lg:justify-end">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white/40 border border-mist-grey/30 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-[0_8px_24px_rgba(28,27,26,0.02)]"
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4.5xl font-ganh font-bold text-deep-teal tracking-tight">
                ghi danh tác giả
              </h1>
            </div>

            <div className="space-y-4">
              <InputField
                label="Họ và tên"
                name="fullName"
                value={data.fullName}
                onChange={handleChange}
                maxLength={100}
                error={fieldErrors.fullName}
                autoComplete="name"
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={data.email}
                onChange={handleChange}
                maxLength={100}
                error={fieldErrors.email}
                autoComplete="email"
              />
              <InputField
                label="Bút danh"
                name="penName"
                value={data.penName}
                onChange={handleChange}
                maxLength={30}
                error={fieldErrors.penName}
                autoComplete="nickname"
              />
              <InputField
                label="Ngày sinh"
                name="birthday"
                type="date"
                value={data.birthday}
                onChange={handleChange}
                error={fieldErrors.birthday}
                autoComplete="bday"
                required
              />
              <InputField
                label="Mật khẩu"
                name="password"
                type="password"
                value={data.password}
                onChange={handleChange}
                maxLength={50}
                error={fieldErrors.password}
                autoComplete="new-password"
              />

              <div className="text-xs text-ink-charcoal/70 bg-[#134E4A]/[0.02] border border-[#134E4A]/10 p-4 rounded-xl mt-3">
                <p className="font-semibold text-ink-charcoal mb-2 font-sans">Yêu cầu mật khẩu:</p>
                <ul className="list-disc pl-4 space-y-1.5 font-sans text-[11px]">
                  <li className={data.password.length >= 8 ? "text-deep-teal font-medium" : ""}>
                    Ít nhất 8 ký tự (tối đa 50)
                  </li>
                  <li className={/[A-Z]/.test(data.password) ? "text-deep-teal font-medium" : ""}>
                    Chứa ít nhất một chữ hoa (A-Z)
                  </li>
                  <li className={/[a-z]/.test(data.password) ? "text-deep-teal font-medium" : ""}>
                    Chứa ít nhất một chữ thường (a-z)
                  </li>
                  <li className={/[0-9]/.test(data.password) ? "text-deep-teal font-medium" : ""}>
                    Chứa ít nhất một số (0-9)
                  </li>
                  <li
                    className={
                      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(data.password)
                        ? "text-deep-teal font-medium"
                        : ""
                    }
                  >
                    Chứa ít nhất một ký tự đặc biệt
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <Checkbox
                label={
                  <>
                    Tôi đồng ý với các{" "}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveModal("terms");
                      }}
                      className="underline hover:text-gray-600 transition-colors"
                    >
                      điều khoản
                    </span>
                  </>
                }
                name="agreedToTerms"
                checked={data.agreedToTerms}
                onChange={handleChange}
                error={fieldErrors.agreedToTerms}
              />
              <Checkbox
                label={
                  <>
                    Tôi đồng ý với các{" "}
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveModal("regulations");
                      }}
                      className="underline hover:text-gray-600 transition-colors"
                    >
                      quy định
                    </span>
                  </>
                }
                name="agreedToRegulations"
                checked={data.agreedToRegulations}
                onChange={handleChange}
                error={fieldErrors.agreedToRegulations}
              />
            </div>

            <div className="flex justify-center w-full mt-6">
              <PrimaryButton
                type="submit"
                disabled={!isValid || loading}
                className="w-full !rounded-xl !py-3 font-semibold tracking-wide"
              >
                {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              </PrimaryButton>
            </div>

            <div className="text-center mt-5">
              <Link
                href="/dang-nhap"
                className="text-ink-charcoal/50 hover:text-deep-teal transition-all text-[13px] font-sans font-medium"
              >
                Đã có tài khoản? Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side: Illustration */}
        <div className="hidden lg:flex relative h-full items-center">
          <div className="absolute right-[-25%] w-[125%] aspect-square pointer-events-none translate-y-[-5%]">
            {/* Love Hand Background */}
            <Image
              src="/webp/lovehand.webp"
              alt="Love Hand"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="w-full h-full object-contain"
            />
            {/* Cow Centered in Heart */}
            <div className="absolute top-[48%] left-[52%] -translate-x-1/2 -translate-y-1/2 w-52 h-52 flex items-center justify-center">
              <Image
                src="/webp/cow.webp"
                alt="Cow"
                fill
                sizes="208px"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay (Shared) - Portaled to Body */}
      {activeModal && (
        <Portal>
          <div
            className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <div
              data-lenis-prevent
              className="bg-[#fcfaf8] rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto relative border border-mist-grey/40 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-deep-teal tracking-tight font-ganh">
                  {activeModal === "terms" ? "Các Điều Khoản" : "Quy Định Đồng Ngôn"}
                </h2>
              </div>

              <div className="prose prose-sm max-w-none text-ink-charcoal/80 leading-relaxed mb-8">
                {activeModal === "terms" ? (
                  <div dangerouslySetInnerHTML={{ __html: TERMS_CONTENT }} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: REGULATIONS_CONTENT }} />
                )}
              </div>

              <PrimaryButton
                onClick={() => setActiveModal(null)}
                className="w-full !rounded-xl font-semibold !tracking-[0.1em] !uppercase"
              >
                Đã hiểu & Đóng
              </PrimaryButton>
            </div>
          </div>
        </Portal>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => {
          closeNotification();
          if (notification.type === "success") {
            router.refresh();
            router.push("/dang-nhap");
          }
        }}
        message={notification.message}
        type={notification.type}
        title={notification.title}
      />
    </>
  );
}
