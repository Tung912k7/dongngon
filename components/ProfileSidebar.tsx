"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { updateProfile } from "@/actions/profile";
import { sanitizeNickname } from "@/utils/sanitizer";
import { createClient } from "@/utils/supabase/client";
import { getCroppedImg } from "@/utils/imageCrop";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { PrimaryButton, LinkedButton } from "./PrimaryButton";
import { formatDate } from "@/utils/date";

type SidebarProfile = {
  id: string;
  email?: string;
  nickname?: string;
  description?: string;
  avatar_url?: string;
  hashtags?: string[];
  public_fields?: Record<string, boolean>;
  birthday?: string | null;
};

type UpdateProfileResult = Awaited<ReturnType<typeof updateProfile>>;

interface ProfileSidebarProps {
  profile: SidebarProfile;
  isOwner: boolean;
  currentUser: { id?: string } | null;
}

export default function ProfileSidebar({ profile: initialProfile, isOwner, currentUser }: ProfileSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [nickname, setNickname] = useState(initialProfile.nickname || "");
  const [description, setDescription] = useState(initialProfile.description || "");
  const [hashtags, setHashtags] = useState<string[]>(initialProfile.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "/webp file/default_avatar.webp");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image Upload & Crop State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setError("Kích thước ảnh không được vượt quá 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (blob: Blob): Promise<string | null> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileName = `${user.id}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });

    if (error) return null;

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError("Vui lòng nhập bút danh.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    let finalAvatarUrl = avatarUrl;

    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          const uploadedUrl = await uploadAvatar(croppedImageBlob);
          if (uploadedUrl) finalAvatarUrl = uploadedUrl;
        }
      }

      const result: UpdateProfileResult = await updateProfile(
        sanitizeNickname(nickname),
        finalAvatarUrl,
        undefined, // birthday
        description, // description
        undefined, // isPrivate
        hashtags, // hashtags
        profile.public_fields // publicFields
      );
      
      if (result.success) {
        setAvatarUrl(finalAvatarUrl);
        setProfile((prev) => ({ ...prev, nickname, description, avatar_url: finalAvatarUrl, hashtags }));
        setIsEditing(false);
        setImageSrc(null);
      } else {
        setError(result.error || "Có lỗi xảy ra.");
      }
    } catch {
      setError("Có lỗi xảy ra khi cập nhật hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNickname(profile.nickname || "");
    setDescription(profile.description || "");
    setAvatarUrl(profile.avatar_url || "/webp file/default_avatar.webp");
    setHashtags(profile.hashtags || []);
    setHashtagInput("");
    setImageSrc(null);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="w-full md:w-1/3 bg-white p-10 rounded-[4rem] border-2 border-black flex flex-col items-center shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] relative transition-all duration-500">
      
      {/* Title */}
      <div className="mb-14 text-center">
        <h1 className="text-5xl font-bold uppercase tracking-tight mb-3">HỒ SƠ</h1>
        <div className="w-12 h-2.5 bg-black mx-auto"></div>
      </div>

      {/* Avatar Section */}
      <div className="relative group w-64 h-64 mb-16">
        <div className={`w-full h-full border-2 border-black flex items-center justify-center overflow-hidden bg-white transition-all duration-300 ${isEditing ? 'ring-4 ring-black/5' : ''}`}>
          {imageSrc && isEditing ? (
            <div className="relative w-full h-full z-20">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          ) : (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={256}
              height={256}
              className={`w-full h-full object-cover transition-transform duration-500 ${isEditing && !imageSrc ? 'scale-105 opacity-80' : ''} ${(!avatarUrl || avatarUrl === "/webp file/default_avatar.webp") ? 'scale-[0.8]' : ''}`}
              priority
            />
          )}

          {isEditing && !imageSrc && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">Thay đổi ảnh</span>
            </div>
          )}
        </div>

        {isEditing && imageSrc && (
          <div className="absolute -bottom-12 left-0 right-0 flex items-center gap-2 bg-white p-2 border-2 border-black rounded-xl z-30 shadow-lg">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <button 
              onClick={() => { setImageSrc(null); if (fileInputRef.current) fileInputRef.current.value =""; }}
              className="text-[10px] font-bold text-red-500 uppercase hover:underline"
            >
              Hủy
            </button>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {/* Info Section */}
      <div className="w-full space-y-8 text-left px-2 mb-12">
        {(isOwner || profile.public_fields?.id !== false) && (
          <div className="border-b border-gray-100 pb-2 flex justify-between items-end">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">MÃ ĐỊNH DANH</p>
              <p className="text-xs font-mono text-gray-400 select-all truncate bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                {profile.id}
              </p>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(profile.id);
                alert("Đã sao chép mã định danh thành công!");
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group relative"
              title="Sao chép mã"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-black">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
          </div>
        )}

        {(isOwner || profile.public_fields?.nickname !== false) && (
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">BÚT DANH</p>
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="text-2xl font-bold text-black tracking-tight w-full bg-gray-50 border-2 border-black p-2 rounded-xl focus:outline-none"
                placeholder="Nhập bút danh..."
                maxLength={30}
              />
            ) : (
              <p className="text-3xl font-bold text-black tracking-tight">{profile.nickname}</p>
            )}
          </div>
        )}

        {(isOwner || profile.public_fields?.email !== false) && profile.email && (
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">EMAIL</p>
            <p className="text-sm font-medium text-black/80">{profile.email}</p>
          </div>
        )}

        {(isOwner || profile.public_fields?.birthday !== false) && profile.birthday && (
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">NGÀY SINH</p>
            <p className="text-sm font-medium text-black/80">{formatDate(profile.birthday)}</p>
          </div>
        )}
        
        {(isOwner || profile.public_fields?.description !== false) && (
          <div className="border-b border-gray-100 pb-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">GIỚI THIỆU</p>
            {isEditing ? (
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm font-medium text-black/80 w-full bg-gray-50 border-2 border-black p-4 rounded-2xl focus:outline-none min-h-[120px] resize-none"
                  placeholder="Lời giới thiệu của bạn..."
                  maxLength={200}
                />
                <span className="absolute bottom-3 right-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full">
                  {description.length}/200
                </span>
              </div>
            ) : (
              <p className="text-sm font-medium text-black/60 italic leading-relaxed">
                {profile.description || (isOwner ? "Bạn chưa có lời giới thiệu nào..." : "Tác giả chưa có lời giới thiệu nào...")}
              </p>
            )}
          </div>
        )}

        {/* HASHTAGS SECTION */}
        {(isOwner || profile.public_fields?.hashtags !== false) && (
          <div className="pb-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-3">HASHTAG</p>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (hashtagInput.trim() && hashtags.length < 5) {
                          const tag = hashtagInput.trim().replace(/^#/, '');
                          if (!hashtags.includes(tag)) {
                            setHashtags([...hashtags, tag]);
                          }
                          setHashtagInput("");
                        }
                      }
                    }}
                    className="flex-1 text-sm font-bold text-black bg-gray-50 border-2 border-black px-4 py-2 rounded-xl focus:outline-none"
                    placeholder="Thêm hashtag..."
                    maxLength={15}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                        if (hashtagInput.trim() && hashtags.length < 5) {
                          const tag = hashtagInput.trim().replace(/^#/, '');
                          if (!hashtags.includes(tag)) {
                            setHashtags([...hashtags, tag]);
                          }
                          setHashtagInput("");
                        }
                    }}
                    className="px-4 py-2 bg-black text-white rounded-xl font-bold text-xs"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-2 border border-black/5">
                      #{tag}
                      <button onClick={() => setHashtags(hashtags.filter((_, i) => i !== idx))} className="hover:text-red-500 font-bold">×</button>
                    </span>
                  ))}
                </div>
                {hashtags.length >= 5 && <p className="text-[9px] text-gray-400 italic">Tối đa 5 hashtags.</p>}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.hashtags && profile.hashtags.length > 0 ? (
                  profile.hashtags.map((tag, idx) => (
                    <span key={idx} className="bg-[#f5f5f5] text-teal-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs italic text-gray-300">Chưa có hashtags</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl text-xs font-bold mb-6 text-center uppercase tracking-wide"
          >
            {error}
          </m.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        {isOwner ? (
          isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-3 border-2 border-black text-black font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 transition-all text-xs active:scale-95 disabled:opacity-50"
              >
                HỦY
              </button>
              <PrimaryButton 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 !py-3 !text-xs !uppercase !tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                {isSubmitting ? "ĐANG LƯU..." : "LƯU LẠI"}
              </PrimaryButton>
            </div>
          ) : (
            <PrimaryButton 
              onClick={() => setIsEditing(true)}
              className="w-full !py-4 !text-sm !uppercase !tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              CHỈNH SỬA HỒ SƠ
            </PrimaryButton>
          )
        ) : currentUser && (
          <LinkedButton 
            href="/profile" 
            className="w-full !rounded-full !py-4 !text-[11px] !uppercase !tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            VỀ HỒ SƠ TÔI
          </LinkedButton>
        )}
      </div>

    </div>
  );
}
