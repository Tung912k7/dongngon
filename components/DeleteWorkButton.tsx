"use client";

import { useState } from "react";
import { deleteWork } from "@/actions/work";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteWorkButtonProps {
  workId: string;
  workTitle: string;
}

export default function DeleteWorkButton({ workId, workTitle }: DeleteWorkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteWork(workId);
    if (!result.success) {
      alert(result.error || "Có lỗi xảy ra khi xóa tác phẩm.");
      setIsDeleting(false);
      setIsOpen(false);
    }
    // No need to close modal on success as revalidatePath will refresh the page
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-red-600 scale-90 hover:scale-100"
        title="Xóa tác phẩm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

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
