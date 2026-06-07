"use client";

import { logger } from "@/lib/logger";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { PrimaryButton } from "@/components/PrimaryButton";
import { updateProfile } from "@/actions/profile";
import { sanitizeNickname } from "@/utils/sanitizer";
import { createClient } from "@/utils/supabase/client";
import DateInput from "@/components/DateInput";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/image";

interface ProfileTabProps {
  initialNickname: string;
  initialAvatarUrl: string;
  initialBirthday: string | null;
  initialDescription: string;
  initialIsPrivate: boolean;
  initialPublicFields: Record<string, boolean>;
  userEmail: string;
  userId: string;
}

export default function ProfileTab({
  initialNickname,
  initialAvatarUrl,
  initialBirthday,
  initialDescription,
  initialIsPrivate,
  initialPublicFields,
  userEmail,
  userId,
}: ProfileTabProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initialNickname);
  const [description, setDescription] = useState(initialDescription || "");
  const [avatarUrl, setAvatarUrl] = useState(getImageUrl(initialAvatarUrl));
  const [birthday, setBirthday] = useState(initialBirthday || "");
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [publicFields, setPublicFields] = useState<Record<string, boolean>>(
    initialPublicFields || {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn (tối đa 2MB).");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setIsSubmitting(true);

      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { contentType: "image/jpeg", upsert: true });

      if (error) {
        toast.error("Lỗi tải ảnh lên.");
        setIsSubmitting(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(data.path);
      setAvatarUrl(publicUrl);
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      return;
    }

    // Validate birthday if it is being set for the first time
    if (!initialBirthday && !birthday) {
      toast.error("Ngày sinh không được để trống.");
      return;
    }

    setIsSubmitting(true);
    logger.log("Saving profile:", { nickname, avatarUrl, birthday, description, isPrivate });

    try {
      const result = await updateProfile(
        sanitizeNickname(nickname),
        avatarUrl,
        !initialBirthday && birthday && birthday.length === 10 ? birthday : undefined,
        description,
        isPrivate,
        undefined,
        publicFields
      );

      logger.log("Save result:", result);

      if (result.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        router.refresh(); // Sync props with server state
      } else {
        toast.error(result.error || "Có lỗi xảy ra.");
      }
    } catch (error) {
      logger.error("Save error:", error);
      toast.error("Lỗi kết nối hoặc hệ thống.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 font-be-vietnam">
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 pb-12 border-b border-[#eae6e1]">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-40 h-40 rounded-2xl border border-[#eae6e1] overflow-hidden relative transition-all">
            <Image src={getImageUrl(avatarUrl)} alt="Avatar" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-[10px] text-white font-black uppercase tracking-widest px-2 text-center">
                Thay đổi ảnh
              </span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex-grow space-y-4 pt-4 text-center md:text-left">
          <h3 className="font-ganh text-2xl md:text-3xl tracking-tighter font-bold text-deep-teal lowercase">
            ảnh đại diện
          </h3>
          <div className="space-y-2">
            <p className="text-ink-charcoal/50 font-medium tracking-wide text-[11px] leading-relaxed max-w-md">
              Sử dụng ảnh chân dung hoặc ảnh đại diện yêu thích của bạn. Kích thước tối đa cho phép
              là 2MB.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <span className="px-3 py-1 bg-[#faf8f5] text-[9px] font-bold uppercase tracking-widest rounded-lg border border-[#eae6e1] text-ink-charcoal/60">
                JPEG / PNG
              </span>
              <span className="px-3 py-1 bg-[#faf8f5] text-[9px] font-bold uppercase tracking-widest rounded-lg border border-[#eae6e1] text-ink-charcoal/60">
                Max 2048x2048px
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl md:pl-5 lg:pl-5">
        {/* Form Fields Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-charcoal/40 pb-1 block">
              Bút danh (Hiển thị công khai)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-5 py-3.5 border border-[#eae6e1] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal bg-white transition-all text-ink-charcoal text-sm"
              placeholder="Nhập bút danh..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-charcoal/40 pb-1 block">
              Ngày sinh (Không thể thay đổi)
            </label>
            <DateInput
              value={birthday}
              onChange={(val) => setBirthday(val)}
              disabled={!!initialBirthday}
              className={`w-full px-5 py-3.5 border rounded-xl font-medium focus:outline-none transition-all text-sm ${
                initialBirthday
                  ? "bg-[#faf8f5]/80 border-[#eae6e1] text-ink-charcoal/30 cursor-not-allowed"
                  : "border-[#eae6e1] bg-white focus:ring-1 focus:ring-deep-teal focus:border-deep-teal"
              }`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-charcoal/40 pb-1 block">
            Giới thiệu bản thân
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full px-5 py-4 border border-[#eae6e1] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal min-h-[160px] resize-none bg-white transition-all leading-relaxed text-ink-charcoal text-sm"
            placeholder="Hãy chia sẻ một chút về bản thân bạn..."
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-ink-charcoal/30 font-bold uppercase tracking-widest pt-1 px-2">
              {description.length}/200
            </span>
          </div>
        </div>

        <div className="space-y-3 opacity-60">
          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-charcoal/40 pb-1 block">
            Email (Không thể thay đổi)
          </label>
          <input
            type="text"
            value={userEmail}
            disabled
            className="w-full px-5 py-3.5 border border-[#eae6e1] bg-[#faf8f5]/80 rounded-xl font-medium text-ink-charcoal/30 cursor-not-allowed text-sm"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold uppercase tracking-wider text-ink-charcoal/40 pb-1 block opacity-60">
              Mã định danh (Không thể thay đổi)
            </label>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(userId);
                toast.success("Đã sao chép mã định danh thành công!");
              }}
              className="text-[10px] font-bold text-deep-teal hover:underline cursor-pointer lowercase focus:outline-none"
            >
              sao chép mã
            </button>
          </div>
          <input
            type="text"
            value={userId}
            disabled
            className="w-full px-5 py-3.5 border border-[#eae6e1] bg-[#faf8f5]/80 rounded-xl font-medium text-ink-charcoal/50 cursor-not-allowed text-sm font-mono"
          />
        </div>

        {/* CUSTOM VISIBILITY SETTINGS */}
        <div className="pt-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-dashed border-[#eae6e1] pb-4">
            <div className="space-y-1">
              <h4 className="font-ganh text-2xl tracking-tight font-bold text-deep-teal lowercase">
                thiết lập hiển thị
              </h4>
              <p className="text-[10px] text-ink-charcoal/50 font-bold uppercase tracking-wider">
                Chọn thông tin công khai trên hồ sơ của bạn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { key: "nickname", label: "Bút danh" },
              { key: "email", label: "Email" },
              { key: "birthday", label: "Ngày sinh" },
              { key: "description", label: "Giới thiệu" },
              { key: "hashtags", label: "Hashtag" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`group flex flex-col items-center justify-center p-5 border rounded-xl cursor-pointer transition-all duration-200 ${
                  publicFields[key] !== false
                    ? "bg-[#134e4a]/10 text-[#134e4a] border-[#134e4a]/30 shadow-sm"
                    : "bg-white text-ink-charcoal/70 border-[#eae6e1] hover:border-[#134e4a]/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={publicFields[key] !== false}
                  onChange={() => {
                    setPublicFields((prev) => ({
                      ...prev,
                      [key]: prev[key] === false ? true : false,
                    }));
                  }}
                  className="sr-only"
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${
                    publicFields[key] !== false ? "text-[#134e4a]/50" : "text-ink-charcoal/40"
                  }`}
                >
                  {publicFields[key] !== false ? "đang hiện" : "đang ẩn"}
                </span>
                <span className="font-ganh text-lg md:text-xl lowercase tracking-tight group-active:scale-95 transition-transform">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* PRIVACY MODE SECTION */}
        <div className="pt-10">
          <div
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex flex-col md:flex-row items-center justify-between p-6 md:p-8 border rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 ${
              isPrivate
                ? "bg-[#134e4a]/5 border-[#134e4a]/30 text-black"
                : "bg-white border-[#eae6e1] hover:border-[#134e4a]/20"
            }`}
          >
            <div className="relative z-10 flex-1 text-center md:text-left mb-8 md:mb-0">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h4 className="font-ganh text-2xl md:text-3xl tracking-tight font-bold text-deep-teal select-none lowercase">
                  chế độ riêng tư
                </h4>
                {isPrivate !== initialIsPrivate && (
                  <span className="text-[10px] bg-red-650 text-white px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
                    chưa lưu
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium leading-relaxed select-none transition-colors max-w-lg text-ink-charcoal/60">
                Khi kích hoạt, thông tin của bạn sẽ được ẩn hoàn toàn. Người dùng khác sẽ nhận được
                thông báo &ldquo;Người dùng đã khoá tài khoản&rdquo; khi truy cập hồ sơ của bạn.
              </p>
            </div>

            <div
              className={`relative shrink-0 w-16 h-16 flex items-center justify-center rounded-xl transition-all duration-300 border ${
                isPrivate
                  ? "bg-[#134e4a] border-[#134e4a] text-white rotate-6 scale-105 shadow-sm"
                  : "bg-[#faf8f5] border-[#eae6e1] rotate-0 scale-100"
              }`}
            >
              {isPrivate ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8 text-ink-charcoal/30"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-center md:justify-end gap-8">
          <p className="text-[10px] text-ink-charcoal/40 font-medium uppercase tracking-widest text-center md:text-right max-w-[200px]">
            Hệ thống sẽ đồng bộ thông tin của bạn sau khi lưu thành công.
          </p>
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="!w-full md:!w-auto !px-8 !py-3.5 !text-sm !rounded-full transition-all bg-[#134e4a] hover:bg-[#003633] text-white shadow-none font-ganh lowercase tracking-wider"
          >
            {isSubmitting ? "Đang xử lý..." : "Lưu hồ sơ ngay"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
