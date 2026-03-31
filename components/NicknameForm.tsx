"use client";

import { useState } from "react";
import { updateNickname } from "@/actions/profile";
import { sanitizeNickname } from "@/utils/sanitizer";
import { PrimaryButton } from "./PrimaryButton";

export default function NicknameForm({ initialNickname }: { initialNickname?: string }) {
  const [nickname, setNickname] = useState(initialNickname || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim() || nickname.trim().length < 2) {
      setError("Bút danh phải có ít nhất 2 ký tự.");
      setIsInvalid(true);
      return;
    }

    setIsInvalid(false);
    setIsSaving(true);
    setError(null);
    const result = await updateNickname(sanitizeNickname(nickname));
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || "Có lỗi xảy ra.");
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-4 mb-8 bg-gray-50/50 p-4 rounded-xl border-2 border-dashed border-black/10">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Bút danh</span>
        <span className="font-ganh font-bold text-xl tracking-tight">{nickname || "Chưa đặt tên"}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="ml-auto text-[10px] font-black uppercase tracking-widest text-literary-gold hover:text-black transition-colors"
        >
          [ ĐỔI ]
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-8 p-4 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (isInvalid) setIsInvalid(false);
          }}
          autoFocus
          maxLength={30}
          className={`flex-grow px-4 py-2 border-2 ${isInvalid ? 'border-red-500 bg-red-50' : 'border-black'} rounded-xl text-lg font-ganh font-bold focus:outline-none focus:bg-gray-50 transition-all`}
          placeholder="Nhập bút danh..."
        />
        <PrimaryButton
          onClick={handleSave}
          disabled={isSaving}
          className="!px-6 !py-2 !text-[10px] !uppercase !tracking-widest !rounded-xl"
        >
          {isSaving ? "LƯU..." : "LƯU"}
        </PrimaryButton>
        <button
          onClick={() => setIsEditing(false)}
          className="px-3 py-2 text-black/40 hover:text-black text-[10px] font-black uppercase tracking-widest transition-colors"
        >
          HỦY
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-[9px] font-black uppercase tracking-wider pl-1">{error}</p>
      )}
    </div>
  );
}
