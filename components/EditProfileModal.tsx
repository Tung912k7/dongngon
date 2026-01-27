"use client";

import { useState, useRef, useCallback } from "react";
import { updateProfile } from "@/actions/profile";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/imageCrop";
import { createClient } from "@/utils/supabase/client";

interface EditProfileModalProps {
  initialNickname: string;
  initialAvatarUrl: string;
}

export default function EditProfileModal({ initialNickname, initialAvatarUrl }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState(initialNickname);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Avatar Upload State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // 2MB Limit
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
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFieldErrors: Record<string, string> = {};
    if (!nickname.trim()) newFieldErrors.nickname = "Vui lòng nhập bút danh.";
    
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsSubmitting(false);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setError(null);

    let finalAvatarUrl = avatarUrl;

    // Timeout of 30 seconds for profile update (includes image upload)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 30000)
    );

    try {
      // If we have a new image to crop and upload
      if (imageSrc && croppedAreaPixels) {
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          const uploadedUrl = await uploadAvatar(croppedImageBlob);
          if (uploadedUrl) {
            finalAvatarUrl = uploadedUrl;
          } else {
            throw new Error("Không thể tải ảnh lên. Hãy đảm bảo bạn đã tạo bucket 'avatars' trong Supabase.");
          }
        }
      }

      const result = await Promise.race([
        updateProfile(nickname, finalAvatarUrl),
        timeoutPromise
      ]) as any;
      
      if (result.success) {
        setIsOpen(false);
        setImageSrc(null); // Clear cropper
      } else {
        setError(result.error || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      if (err.message === "TIMEOUT") {
        setError("Yêu cầu quá hạn (Timeout). Vui lòng thử lại.");
      } else {
        setError(err.message || "Có lỗi xảy ra khi cập nhật hồ sơ.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-12 w-full py-3 border-2 border-black text-black font-bold uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition-all text-center"
      >
        CHỈNH SỬA HỒ SƠ
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setImageSrc(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border-4 border-black rounded-[2.5rem] p-8 md:p-10 w-full max-w-xl relative z-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-3xl font-aquus font-bold mb-8 text-center uppercase tracking-tight">Cập nhật hồ sơ</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                {/* Consolidated Avatar Section */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#B4B4B4]">ẢNH ĐẠI DIỆN</label>
                  
                  {/* Upload & Reset Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-white border-2 border-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      CHỌN ẢNH TỪ THIẾT BỊ
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("/default_avatar.png");
                        setImageSrc(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-6 py-2 bg-[#F9F9F9] border-2 border-black/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-black hover:bg-white transition-all text-gray-400 hover:text-black"
                    >
                      PHỤC HỒI MẶC ĐỊNH
                    </button>

                    {!imageSrc && (
                      <span className="text-[10px] text-gray-400 font-bold italic ml-auto">Tối đa 2MB</span>
                    )}
                  </div>

                  {/* Preview / Cropping Frame */}
                  <div className="relative w-full h-[320px] bg-white rounded-3xl border-2 border-black overflow-hidden flex items-center justify-center group">
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
                        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-2xl border-2 border-black flex items-center gap-4 z-10">
                          <span className="text-[10px] font-black text-black">ZOOM</span>
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
                            className="text-[10px] font-black text-red-500 hover:text-red-700 underline"
                          >
                            XÓA
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Image
                          src={avatarUrl || "/default_avatar.png"}
                          alt="Current Avatar"
                          width={160}
                          height={160}
                          className={`w-full h-full object-cover ${(avatarUrl === "/default_avatar.png" || !avatarUrl) ? 'scale-[1.5]' : ''}`}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                          <p className="text-[10px] text-black font-black mt-4 tracking-widest uppercase bg-white px-4 py-2 border-2 border-black">Xem trước ảnh</p>
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
                  <label className="text-xs font-bold uppercase tracking-widest text-[#B4B4B4]">BÚT DANH</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (fieldErrors.nickname) setFieldErrors(prev => ({ ...prev, nickname: "" }));
                    }}
                    maxLength={30}
                    className={`w-full px-6 py-3 border-2 ${fieldErrors.nickname ? 'border-red-500 bg-red-50' : 'border-black'} rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-sm`}
                    placeholder="Nhập bút danh mới..."
                  />
                  {fieldErrors.nickname && <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-wider">{fieldErrors.nickname}</p>}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold animate-shake">
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
                    className="flex-1 py-3 border-2 border-black text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all text-sm"
                  >
                    HỦY
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-black text-white font-bold uppercase tracking-widest rounded-xl hover:opacity-80 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ĐANG LƯU...
                      </>
                    ) : "LƯU THAY ĐỔI"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
