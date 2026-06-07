"use client";

import { ComponentType, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { toast } from "sonner";
import { updateProfile } from "@/actions/profile";
import { sanitizeNickname } from "@/utils/sanitizer";
import { createClient } from "@/utils/supabase/client";
import { getCroppedImg } from "@/utils/imageCrop";
import dynamic from "next/dynamic";
import type { Area, CropperProps } from "react-easy-crop";
const Cropper = dynamic(() => import("react-easy-crop"), {
  ssr: false,
}) as unknown as ComponentType<Partial<CropperProps>>;
import { LinkedButton, PrimaryButton } from "./PrimaryButton";
import { formatDate } from "@/utils/date";
import { getImageUrl } from "@/utils/image";
import { getLevelInfo } from "@/utils/levels";

export type SidebarProfile = {
  id: string;
  email?: string;
  nickname?: string;
  description?: string;
  avatar_url?: string;
  hashtags?: string[];
  public_fields?: Record<string, boolean>;
  birthday?: string | null;
  is_private?: boolean;
  is_hidden?: boolean;
};

type UpdateProfileResult = Awaited<ReturnType<typeof updateProfile>>;

interface ProfileSidebarProps {
  profile: SidebarProfile;
  isOwner: boolean;
  currentUser: { id?: string } | null;
  inkPoints?: number;
}

export default function ProfileSidebar({
  profile: initialProfile,
  isOwner,
  currentUser,
  inkPoints = 0,
}: ProfileSidebarProps) {
  const { currentLevel } = getLevelInfo(inkPoints);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [nickname, setNickname] = useState(initialProfile.nickname || "");
  const [description, setDescription] = useState(initialProfile.description || "");
  const [hashtags, setHashtags] = useState<string[]>(initialProfile.hashtags || []);
  const [hashtagInput, setHashtagInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(getImageUrl(initialProfile.avatar_url));

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const fileName = `${user.id}-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });

    if (error) return null;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path);
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
        setProfile((prev) => ({
          ...prev,
          nickname,
          description,
          avatar_url: finalAvatarUrl,
          hashtags,
        }));
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
    setAvatarUrl(getImageUrl(profile.avatar_url));
    setHashtags(profile.hashtags || []);
    setHashtagInput("");
    setImageSrc(null);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="w-full lg:w-1/3 bg-[#fcfaf8] p-6 lg:p-10 rounded-2xl border border-[#eae6e1] flex flex-col items-center relative transition-colors duration-500 shadow-sm font-be-vietnam">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-ganh font-bold text-deep-teal tracking-tight mb-2 lowercase">
          hồ sơ
        </h1>
        <div className="text-[10px] font-bold text-ink-charcoal/20 uppercase tracking-[0.5em] text-center">
          identity
        </div>
      </div>

      {/* Avatar Section */}
      <div className="relative group w-48 h-48 mb-12">
        <div
          className={`w-full h-full border border-[#eae6e1] rounded-2xl flex items-center justify-center overflow-hidden bg-[#faf8f5] transition-colors duration-300 ${isEditing ? "ring-4 ring-[#134e4a]/5" : ""}`}
        >
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
              className={`w-full h-full object-cover transition-transform duration-500 ${isEditing && !imageSrc ? "scale-105 opacity-80" : ""} ${!avatarUrl || avatarUrl === "/webp/default_avatar.webp" || avatarUrl.includes("default_avatar") ? "scale-[0.8]" : ""}`}
              priority
            />
          )}

          {isEditing && !imageSrc && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
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
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                Thay đổi ảnh
              </span>
            </button>
          )}
        </div>

        {isEditing && imageSrc && (
          <div className="absolute -bottom-12 left-0 right-0 flex items-center gap-2 bg-white p-2.5 border border-[#eae6e1] rounded-xl z-30 shadow-md">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1 bg-[#eae6e1] rounded-full appearance-none cursor-pointer accent-[#134e4a]"
            />
            <button
              onClick={() => {
                setImageSrc(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-[10px] font-bold text-red-650 uppercase hover:underline"
            >
              Hủy
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Info Section */}
      <div className="w-full space-y-8 text-left px-2 mb-12">


        {(isOwner || profile.public_fields?.nickname !== false) && (
          <div className="border-b border-[#eae6e1] pb-4 mb-4">
            <p className="text-[10px] text-ink-charcoal/40 font-bold uppercase tracking-wider mb-2">
              BÚT DANH
            </p>
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="text-xl font-ganh font-bold text-ink-charcoal tracking-tight w-full bg-white border border-[#eae6e1] px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all"
                placeholder="Nhập bút danh..."
                maxLength={30}
                aria-label="Bút danh"
              />
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-3xl font-ganh font-bold text-ink-charcoal tracking-wide leading-none">
                  {profile.nickname}
                </p>
                <div>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${currentLevel.bgClass} ${currentLevel.textClass} ${currentLevel.borderClass}`}>
                    {currentLevel.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {(isOwner || profile.public_fields?.email !== false) && profile.email && (
          <div className="border-b border-[#eae6e1] pb-4 mb-4">
            <p className="text-[10px] text-ink-charcoal/40 font-bold uppercase tracking-wider mb-2">
              EMAIL
            </p>
            <p className="text-sm font-medium text-ink-charcoal/80">{profile.email}</p>
          </div>
        )}

        {(isOwner || profile.public_fields?.birthday !== false) && profile.birthday && (
          <div className="border-b border-[#eae6e1] pb-4 mb-4">
            <p className="text-[10px] text-ink-charcoal/40 font-bold uppercase tracking-wider mb-2">
              NGÀY SINH
            </p>
            <p className="text-sm font-medium text-ink-charcoal/80">
              {formatDate(profile.birthday)}
            </p>
          </div>
        )}

        {(isOwner || profile.public_fields?.description !== false) && (
          <div className="border-b border-[#eae6e1] pb-4 mb-4">
            <p className="text-[10px] text-ink-charcoal/40 font-bold uppercase tracking-wider mb-2">
              GIỚI THIỆU
            </p>
            {isEditing ? (
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm font-medium text-ink-charcoal/80 w-full bg-white border border-[#eae6e1] p-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all min-h-[120px] resize-none"
                  placeholder="Lời giới thiệu của bạn..."
                  maxLength={200}
                  aria-label="Giới thiệu bản thân"
                />
                <span className="absolute bottom-3 right-4 text-[9px] text-ink-charcoal/40 font-bold uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full border border-[#eae6e1]">
                  {description.length}/200
                </span>
              </div>
            ) : (
              <p className="text-sm font-medium text-ink-charcoal/60 italic leading-relaxed max-w-[60ch]">
                {profile.description ||
                  (isOwner
                    ? "Bạn chưa có lời giới thiệu nào..."
                    : "Tác giả chưa có lời giới thiệu nào...")}
              </p>
            )}
          </div>
        )}

        {/* HASHTAGS SECTION */}
        {(isOwner || profile.public_fields?.hashtags !== false) && (
          <div className="pb-4">
            <p className="text-[10px] text-ink-charcoal/40 font-bold uppercase tracking-wider mb-3">
              HASHTAG
            </p>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (hashtagInput.trim() && hashtags.length < 5) {
                          const tag = hashtagInput.trim().replace(/^#/, "");
                          if (!hashtags.includes(tag)) {
                            setHashtags([...hashtags, tag]);
                          }
                          setHashtagInput("");
                        }
                      }
                    }}
                    className="flex-1 text-sm font-bold text-ink-charcoal bg-white border border-[#eae6e1] px-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all"
                    placeholder="Thêm hashtag..."
                    maxLength={15}
                    aria-label="Thêm hashtag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (hashtagInput.trim() && hashtags.length < 5) {
                        const tag = hashtagInput.trim().replace(/^#/, "");
                        if (!hashtags.includes(tag)) {
                          setHashtags([...hashtags, tag]);
                        }
                        setHashtagInput("");
                      }
                    }}
                    className="px-4 py-2 bg-deep-teal hover:bg-[#003633] text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-ink-charcoal/80 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 border border-[#eae6e1] transition-all hover:border-[#134e4a]/20"
                    >
                      #{tag}
                      <button
                        onClick={() => setHashtags(hashtags.filter((_, i) => i !== idx))}
                        className="hover:text-red-650 font-bold flex items-center"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {hashtags.length >= 5 && (
                  <p className="text-[9px] text-ink-charcoal/40 italic">Tối đa 5 hashtags.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.hashtags && profile.hashtags.length > 0 ? (
                  profile.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-ink-charcoal/80 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#eae6e1] transition-all hover:border-[#134e4a]/20"
                    >
                      #{tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs italic text-ink-charcoal/30">Chưa có hashtags</p>
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
            className="w-full p-4 bg-red-50/50 border border-red-200 text-red-600 rounded-xl text-xs font-bold mb-6 text-center uppercase tracking-wide"
          >
            {error}
          </m.div>
        )}
      </AnimatePresence>

      <div className="w-full space-y-4">
        {isOwner ? (
          isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 py-3 border border-[#eae6e1] text-ink-charcoal font-ganh font-bold uppercase tracking-widest rounded-full hover:bg-white hover:border-[#134e4a]/20 transition-all text-[10px] disabled:opacity-50"
              >
                HỦY
              </button>
              <PrimaryButton
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 !py-3 !text-[10px] !uppercase !tracking-widest shadow-none !rounded-full"
              >
                {isSubmitting ? "ĐANG LƯU..." : "LƯU LẠI"}
              </PrimaryButton>
            </div>
          ) : (
            <PrimaryButton
              onClick={() => setIsEditing(true)}
              className="w-full !py-3.5 !text-xs !uppercase !tracking-widest shadow-none !rounded-full"
            >
              CHỈNH SỬA HỒ SƠ
            </PrimaryButton>
          )
        ) : (
          <div className="w-full flex flex-col gap-3 font-ganh font-bold">
            <button
              onClick={() => toast("Tính năng đang phát triển")}
              className="w-full py-3.5 bg-deep-teal text-white hover:bg-[#003633] transition-all text-xs uppercase tracking-widest rounded-full cursor-pointer"
            >
              Theo Dõi
            </button>
            {currentUser && (
              <LinkedButton
                href={`/profile?id=${currentUser.id}`}
                className="w-full !rounded-full !py-3.5 !text-xs !uppercase !tracking-widest shadow-none border border-[#eae6e1] !bg-white !text-ink-charcoal hover:!bg-[#faf8f5] hover:!border-[#134e4a]/20 transition-all"
              >
                VỀ HỒ SƠ TÔI
              </LinkedButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
