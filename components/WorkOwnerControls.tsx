"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateWork, deleteWork } from "@/actions/work";
import { PrimaryButton } from "./PrimaryButton";
import NotificationModal from "./NotificationModal";

export default function WorkOwnerControls({ 
  workId, 
  initialTitle,
  isOwner 
}: { 
  workId: string; 
  initialTitle: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  if (!isOwner) return null;

  const handleUpdate = async () => {
    if (!title.trim() || title === initialTitle) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    const result = await updateWork(workId, { title: title.trim() });
    setIsSubmitting(false);

    if (result.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      setNotification({
        isOpen: true,
        message: result.error || "Không thể cập nhật tiêu đề.",
        type: "error"
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tác phẩm này? Hành động này không thể hoàn tác.")) {
      return;
    }

    setIsSubmitting(true);
    const result = await deleteWork(workId);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/dong-ngon");
      router.refresh();
    } else {
      setNotification({
        isOpen: true,
        message: result.error || "Không thể xóa tác phẩm.",
        type: "error"
      });
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {isEditing ? (
        <div className="flex items-center gap-2 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow px-3 py-1 border-2 border-black rounded-lg font-bold text-sm focus:outline-none"
            autoFocus
          />
          <button 
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="text-xs font-bold uppercase tracking-widest text-green-600 hover:text-green-700"
          >
            Lưu
          </button>
          <button 
            onClick={() => { setIsEditing(false); setTitle(initialTitle); }}
            disabled={isSubmitting}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600"
          >
            Hủy
          </button>
        </div>
      ) : (
        <>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Chỉnh sửa
          </button>
          <button 
            onClick={handleDelete}
            className="text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-600 transition-colors"
          >
            Xóa
          </button>
        </>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
