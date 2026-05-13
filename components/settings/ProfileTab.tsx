"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
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
}

export default function ProfileTab({
  initialNickname,
  initialAvatarUrl,
  initialBirthday,
  initialDescription,
  initialIsPrivate,
  initialPublicFields,
  userEmail
}: ProfileTabProps) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initialNickname);
  const [description, setDescription] = useState(initialDescription || "");
  const [avatarUrl, setAvatarUrl] = useState(getImageUrl(initialAvatarUrl));
  const [birthday, setBirthday] = useState(initialBirthday || "");
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [publicFields, setPublicFields] = useState<Record<string, boolean>>(initialPublicFields || {});
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
      const { data: { user } } = await supabase.auth.getUser();
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

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path);
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
    console.log("Saving profile:", { nickname, avatarUrl, birthday, description, isPrivate });

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

      console.log("Save result:", result);

      if (result.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        router.refresh(); // Sync props with server state
      } else {
        toast.error(result.error || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Lỗi kết nối hoặc hệ thống.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 pb-12 border-b-2 border-black/5">
        <div
          className="relative group cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-40 h-40 rounded-full border-4 border-black overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all">
            <Image
              src={getImageUrl(avatarUrl)}
              alt="Avatar"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] text-white font-black uppercase tracking-widest px-2 text-center">Thay đổi ảnh</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        <div className="flex-1 space-y-4 pt-4 text-center md:text-left">
          <h3 className="font-ganh text-2xl md:text-3xl uppercase tracking-tighter font-black">Ảnh đại diện</h3>
          <div className="space-y-2">
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] leading-relaxed max-w-md">
              Sử dụng ảnh chân dung hoặc ảnh đại diện yêu thích của bạn. Kích thước tối đa cho phép là 2MB.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              <span className="px-3 py-1 bg-black/5 text-[9px] font-black uppercase tracking-widest rounded-full opacity-60">JPEG / PNG</span>
              <span className="px-3 py-1 bg-black/5 text-[9px] font-black uppercase tracking-widest rounded-full opacity-60">Max 2048x2048px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl md:pl-5 lg:pl-5">
        {/* Form Fields Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black pb-1 block">Bút danh (Hiển thị công khai)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-6 py-4 border-2 border-black rounded-2xl font-bold focus:outline-none focus:ring-8 focus:ring-black/5 bg-[#fcfcfc] transition-all"
              placeholder="Nhập bút danh..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black pb-1 block">Ngày sinh (Không thể thay đổi)</label>
            <DateInput
              value={birthday}
              onChange={(val) => setBirthday(val)}
              disabled={!!initialBirthday}
              className={`w-full px-6 py-4 border-2 rounded-2xl font-bold focus:outline-none transition-all ${!!initialBirthday
                ? 'bg-black/5 border-black/10 text-black/30 cursor-not-allowed'
                : 'border-black focus:ring-8 focus:ring-black/5 bg-[#fcfcfc]'
                }`}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black pb-1 block">Giới thiệu bản thân</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            className="w-full px-6 py-5 border-2 border-black rounded-3xl font-bold focus:outline-none focus:ring-8 focus:ring-black/5 min-h-[160px] resize-none bg-[#fcfcfc] transition-all leading-relaxed"
            placeholder="Hãy chia sẻ một chút về bản thân bạn..."
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-black/30 font-black uppercase tracking-widest pt-1 px-2">
              {description.length}/200
            </span>
          </div>
        </div>

        <div className="space-y-3 opacity-60">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-black pb-1 block">Email (Không thể thay đổi)</label>
          <input
            type="text"
            value={userEmail}
            disabled
            className="w-full px-6 py-4 border-2 border-black/10 bg-black/5 rounded-2xl font-bold text-black/40 cursor-not-allowed"
          />
        </div>

        {/* CUSTOM VISIBILITY SETTINGS */}
        <div className="pt-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black border-dashed pb-4">
            <div className="space-y-1">
              <h4 className="font-ganh text-2xl uppercase tracking-tight font-black">Thiết lập hiển thị</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Chọn thông tin công khai trên hồ sơ của bạn</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { key: 'nickname', label: 'Bút danh' },
              { key: 'email', label: 'Email' },
              { key: 'birthday', label: 'Ngày sinh' },
              { key: 'description', label: 'Giới thiệu' },
              { key: 'hashtags', label: 'Hashtag' },
              { key: 'id', label: 'Mã định danh' }
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`group flex flex-col items-center justify-center p-6 border-2 border-black rounded-3xl cursor-pointer transition-all ${publicFields[key] !== false
                  ? "bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
                  : "bg-white text-black hover:bg-gray-50 shadow-none"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={publicFields[key] !== false}
                  onChange={() => {
                    setPublicFields(prev => ({
                      ...prev,
                      [key]: prev[key] === false ? true : false
                    }));
                  }}
                  className="sr-only"
                />
                <span className={`text-[10px] font-black uppercase tracking-widest mb-3 transition-colors ${publicFields[key] !== false ? "text-white/40" : "text-black/40"
                  }`}>
                  {publicFields[key] !== false ? "Đang hiện" : "Đang ẩn"}
                </span>
                <span className="font-ganh text-lg md:text-xl uppercase tracking-tight group-active:scale-95 transition-transform">
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
            className={`flex flex-col md:flex-row items-center justify-between p-8 md:p-12 border-4 rounded-[3rem] relative overflow-hidden group cursor-pointer transition-all duration-500 ${isPrivate
              ? "bg-black border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]"
              : "bg-white border-black/10 hover:border-black shadow-none"
              }`}
          >
            <div className="relative z-10 flex-1 text-center md:text-left mb-8 md:mb-0">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h4 className={`font-ganh text-2xl md:text-3xl uppercase tracking-tight font-black select-none transition-colors ${isPrivate ? 'text-white' : 'text-black'}`}>
                  Chế độ riêng tư
                </h4>
                {isPrivate !== initialIsPrivate && (
                  <span className="text-[10px] bg-red-500 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                    Chưa cập nhật
                  </span>
                )}
              </div>
              <p className={`text-[11px] font-bold uppercase tracking-widest leading-relaxed select-none transition-colors max-w-lg ${isPrivate ? 'text-white/60' : 'text-black/40'}`}>
                Khi kích hoạt, thông tin của bạn sẽ được ẩn hoàn toàn. Người dùng khác sẽ nhận được thông báo &ldquo;Người dùng đã khoá tài khoản&rdquo; khi truy cập hồ sơ của bạn.
              </p>
            </div>

            <div className={`relative shrink-0 w-24 h-24 flex items-center justify-center rounded-3xl transition-all duration-500 border-2 ${isPrivate ? 'bg-white border-white rotate-12 scale-110' : 'bg-black/5 border-black/10 rotate-0 scale-100'
              }`}>
              {isPrivate ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-black">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-black/20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
            </div>
          </div>
        </div>


        <div className="pt-12 flex flex-col md:flex-row items-center justify-center md:justify-end gap-8">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center md:text-right max-w-[200px]">
            Hệ thống sẽ đồng bộ thông tin của bạn sau khi lưu thành công.
          </p>
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="!w-full md:!w-auto !px-12 !py-6 !text-lg !rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            {isSubmitting ? "Đang xử lý..." : "Lưu hồ sơ ngay"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

