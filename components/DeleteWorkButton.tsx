"use client";

import { useState } from "react";
import { deleteWork } from "@/actions/work";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteWorkButtonProps {
  workId: string;
  workTitle: string;
  variant?: 'default' | 'menuItem';
  onAction?: () => void;
}

export default function DeleteWorkButton({ workId, workTitle, variant = 'default', onAction }: DeleteWorkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // Timeout of 10 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    try {
      const result = await Promise.race([
        deleteWork(workId),
        timeoutPromise
      ]) as any;

      if (result.success) {
        // 2. Chỉ khi xóa thành công ở DB mới cập nhật giao diện & đóng modal
        setIsOpen(false);
        if (onAction) onAction();
      } else {
        console.error("Lỗi xóa từ Database:", result.error);
        alert(result.error || "Không thể xóa tác phẩm, vui lòng thử lại!");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      if (err.message === "TIMEOUT") {
        alert("Yêu cầu xóa quá hạn (Timeout). Vui lòng thử lại sau.");
      } else {
        alert("Có lỗi xảy ra khi xóa tác phẩm.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      {variant === 'default' ? (
        <button
          onClick={triggerOpen}
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-red-600 scale-90 hover:scale-100"
          title="Xóa tác phẩm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ) : (
        <button
          onClick={triggerOpen}
          className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-wider"
        >
          Xóa
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white border-2 border-black rounded-[2.5rem] p-8 md:p-10 w-full max-w-md relative z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-2xl font-sans font-black mb-4 text-center uppercase tracking-tight text-black">Xác nhận xóa</h2>
              <p className="text-center text-gray-500 mb-8 font-sans">
                Bạn có chắc chắn muốn xóa tác phẩm <span className="font-bold text-black">"{workTitle}"</span>? 
                Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 border-2 border-black text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all text-sm disabled:opacity-50"
                >
                  HỦY
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-red-500 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? "ĐANG XÓA..." : "XÓA NGAY"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
