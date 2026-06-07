"use client";

import { logger } from "@/lib/logger";
import { ComponentType, useCallback, useEffect, useRef, useState } from "react";
import { updateProfile } from "@/actions/profile";
import { sanitizeNickname } from "@/utils/sanitizer";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import dynamic from "next/dynamic";
import type { Area, CropperProps } from "react-easy-crop";
const Cropper = dynamic(() => import("react-easy-crop"), {
  ssr: false,
}) as unknown as ComponentType<Partial<CropperProps>>;
import { getCroppedImg } from "@/utils/imageCrop";
import { createClient } from "@/utils/supabase/client";
import { PrimaryButton } from "./PrimaryButton";
import { getImageUrl } from "@/utils/image";

interface EditProfileModalProps {
  initialNickname: string;
  initialAvatarUrl: string;
  initialDescription?: string;
}

type UpdateProfileResult = Awaited<ReturnType<typeof updateProfile>>;

export default function EditProfileModal({
  initialNickname,
  initialAvatarUrl,
  initialDescription,
}: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState(initialNickname);
  const [description, setDescription] = useState(initialDescription || "");
  const [avatarUrl, setAvatarUrl] = useState(getImageUrl(initialAvatarUrl));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Avatar Upload State
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

      // 2MB Limit
      if (file.size > 2 * 1024 * 1024) {
        setError("kích thước ảnh vượt quá giới hạn 2MB.");
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
    const { data, error } = await supabase.storage.from("avatars").upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

    if (error) {
      logger.error("Upload error:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFieldErrors: Record<string, string> = {};
    if (!nickname.trim()) newFieldErrors.nickname = "vui lòng nhập bút danh của bạn.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsSubmitting(false);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setError(null);

    let finalAvatarUrl = avatarUrl;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 30000)
    );

    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          const uploadedUrl = await uploadAvatar(croppedImageBlob);
          if (uploadedUrl) {
            finalAvatarUrl = uploadedUrl;
          } else {
            throw new Error("không thể tải ảnh lên. vui lòng kiểm tra kết nối mạng.");
          }
        }
      }

      const result = (await Promise.race([
        updateProfile(sanitizeNickname(nickname), finalAvatarUrl, undefined, description),
        timeoutPromise,
      ])) as UpdateProfileResult;

      if (result.success) {
        setIsOpen(false);
        setImageSrc(null);
      } else {
        setError(result.error || "đã xảy ra lỗi ngoài ý muốn. vui lòng thử lại.");
      }
    } catch (err: unknown) {
      logger.error("Profile update error:", err);
      if (err instanceof Error && err.message === "TIMEOUT") {
        setError("yêu cầu phản hồi quá lâu. vui lòng thử lại sau ít phút.");
      } else {
        setError(err instanceof Error ? err.message : "đã xảy ra lỗi khi cập nhật hồ sơ.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <PrimaryButton
        onClick={() => setIsOpen(true)}
        className="mt-12 w-full !py-3 !text-sm font-ganh font-bold !lowercase !tracking-wider !rounded-full !bg-[#134e4a] hover:!bg-[#003633] !text-[#faf8f5]"
        ariaLabel="mở chỉnh sửa hồ sơ"
      >
        chỉnh sửa hồ sơ
      </PrimaryButton>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setImageSrc(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              aria-label="Đóng chỉnh sửa hồ sơ"
            />

            <m.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#faf8f5] border border-[#eae6e1] rounded-2xl p-6 md:p-10 w-full max-w-xl relative z-10 shadow-sm max-h-[85vh] overflow-y-auto overscroll-contain modal-scroll-container"
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                .modal-scroll-container::-webkit-scrollbar {
                  width: 6px;
                }
                .modal-scroll-container::-webkit-scrollbar-track {
                  background: #faf8f5;
                }
                .modal-scroll-container::-webkit-scrollbar-thumb {
                  background: #eae6e1;
                  border-radius: 10px;
                }
                .modal-scroll-container::-webkit-scrollbar-thumb:hover {
                  background: #134e4a;
                }
                .modal-scroll-container {
                  scrollbar-width: thin;
                  scrollbar-color: #eae6e1 #faf8f5;
                }
              `,
                }}
              />
              <h2 className="text-3.5xl font-ganh font-bold mb-8 text-center text-deep-teal lowercase">
                cập nhật hồ sơ
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                {/* Consolidated Avatar Section */}
                <div className="space-y-4">
                  <label className="block text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                    ảnh đại diện
                  </label>

                  {/* Upload & Reset Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <PrimaryButton
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="!px-4 !py-2 !text-xs font-medium !lowercase !tracking-wide !rounded-full !bg-[#134e4a] hover:!bg-[#003633]"
                    >
                      chọn ảnh từ thiết bị
                    </PrimaryButton>

                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("/webp/default_avatar.webp");
                        setImageSrc(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-4 py-2 bg-white border border-[#eae6e1] rounded-full text-xs font-medium lowercase tracking-wide hover:bg-black/5 active:scale-[0.98] transition-all text-black/80 cursor-pointer"
                    >
                      phục hồi mặc định
                    </button>

                    {!imageSrc && (
                      <span className="text-[10px] text-gray-400 font-bold italic ml-auto lowercase">
                        tối đa 2MB
                      </span>
                    )}
                  </div>

                  {/* Preview / Cropping Frame */}
                  <div className="relative w-full h-[320px] bg-[#fcfaf8] rounded-xl border border-[#eae6e1] overflow-hidden flex items-center justify-center group">
                    {imageSrc ? (
                      <div className="relative w-full h-full">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />
                        {/* Zoom Control Overlay */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-[#eae6e1] flex items-center gap-4 z-10 shadow-sm">
                          <span className="text-[10px] font-bold text-black/60 lowercase tracking-wider">
                            thu phóng
                          </span>
                          <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageSrc(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline lowercase"
                          >
                            xóa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Image
                          src={getImageUrl(avatarUrl)}
                          alt="Current Avatar"
                          width={160}
                          height={160}
                          className={`w-full h-full object-cover ${getImageUrl(avatarUrl) === "/webp/default_avatar.webp" || !avatarUrl ? "scale-[1.5]" : ""}`}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                          <p className="text-[10px] text-black/60 font-medium mt-4 tracking-wider lowercase bg-white/90 backdrop-blur-sm px-4 py-2 border border-[#eae6e1] rounded-full">
                            xem trước ảnh
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                    bút danh
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (fieldErrors.nickname)
                        setFieldErrors((prev) => ({ ...prev, nickname: "" }));
                    }}
                    maxLength={30}
                    className={`w-full px-4 py-3 border ${fieldErrors.nickname ? "border-red-400/60 bg-[#fdebec]" : "border-[#eae6e1]"} rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black bg-[#fcfaf8]`}
                    placeholder="nhập bút danh mới..."
                  />
                  {fieldErrors.nickname && (
                    <p className="text-[#9f2f2d] text-xs font-medium mt-1 tracking-wide lowercase">
                      {fieldErrors.nickname}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                    giới thiệu
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black bg-[#fcfaf8] min-h-[120px] resize-none"
                    placeholder="hãy chia sẻ một chút về bản thân bạn..."
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-gray-400 font-bold lowercase tracking-wider">
                      {description.length}/200
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-[#fdebec] border border-red-200/40 text-[#9f2f2d] rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setImageSrc(null);
                    }}
                    className="flex-1 py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider rounded-full hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm bg-white"
                  >
                    hủy bỏ
                  </button>
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 !py-3 !text-sm font-ganh font-bold !lowercase !tracking-wider !rounded-full !bg-[#134e4a] hover:!bg-[#003633] !text-[#faf8f5]"
                  >
                    {isSubmitting ? "đang lưu..." : "lưu thay đổi"}
                  </PrimaryButton>
                </div>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
