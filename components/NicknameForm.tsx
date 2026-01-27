"use client";

import { useState } from "react";
import { updateNickname } from "@/actions/profile";

export default function NicknameForm({ initialNickname }: { initialNickname?: string }) {
  const [nickname, setNickname] = useState(initialNickname || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const result = await updateNickname(nickname);
    setIsSaving(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      setError(result.error || "Có lỗi xảy ra.");
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 mb-8">
        <span className="text-gray-600">Bút danh:</span>
        <span className="font-bold">{nickname || "Chưa đặt tên"}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-blue-600 hover:underline"
        >
          (Đổi)
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-8">
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={30}
        className="border p-1 rounded text-sm"
        placeholder="Nhập bút danh..."
      />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-black text-white px-3 py-1 rounded text-xs"
      >
        {isSaving ? "Lưu..." : "Lưu"}
      </button>
      <button
        onClick={() => setIsEditing(false)}
        className="text-gray-500 text-xs"
      >
        Hủy
      </button>
      {error && (
        <span className="text-red-500 text-xs font-bold block mt-1">{error}</span>
      )}
    </div>
  );
}
