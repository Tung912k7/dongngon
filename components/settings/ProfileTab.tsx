"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { PrimaryButton } from "@/components/PrimaryButton";
import { updateProfile } from "@/actions/profile";
import { sanitizeNickname } from "@/utils/sanitizer";
import { createClient } from "@/utils/supabase/client";

interface ProfileTabProps {
  initialNickname: string;
  initialAvatarUrl: string;
  userEmail: string;
}

export default function ProfileTab({ initialNickname, initialAvatarUrl, userEmail }: ProfileTabProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: "Kích thước ảnh quá lớn (tối đa 2MB)." });
        return;
      }

      // Upload immediately for simplicity or preview? 
      // Let's implement upload on save for consistency with modal, 
      // OR upload immediately to preview (simpler for now).
      // Actually, let's reuse the upload logic.
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setMessage(null);
      setIsSubmitting(true);

      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { contentType: "image/jpeg", upsert: true });

      if (error) {
        setMessage({ type: 'error', text: "Lỗi tải ảnh lên." });
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
      setMessage({ type: 'error', text: "Bút danh không được để trống." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateProfile(sanitizeNickname(nickname), avatarUrl);
      if (result.success) {
        setMessage({ type: 'success', text: "Cập nhật hồ sơ thành công!" });
      } else {
        setMessage({ type: 'error', text: result.error || "Có lỗi xảy ra." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Lỗi kết nối." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-8 border-b-2 border-black/5">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden relative">
            <Image
              src={avatarUrl || "/default_avatar.png"}
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-bold text-xl uppercase tracking-wide">Ảnh đại diện</h3>
          <p className="text-gray-500 text-sm">Chạm vào ảnh để thay đổi. Tối đa 2MB.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Bút danh (Hiển thị công khai)</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-6 py-4 border-2 border-black rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-black/5"
            placeholder="Nhập bút danh..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email (Không thể thay đổi)</label>
          <input
            type="text"
            value={userEmail}
            disabled
            className="w-full px-6 py-4 border-2 border-gray-200 bg-gray-50 rounded-xl font-medium text-gray-500 cursor-not-allowed"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold ${
            message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <PrimaryButton type="submit" disabled={isSubmitting} className="!w-auto !px-10">
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
