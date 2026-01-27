"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWork } from "@/actions/work";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/types/database";

interface EditWorkModalProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditWorkModal({ work, isOpen, onClose }: EditWorkModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map database constants back to UI labels
  const reverseMapping = {
    category: (val: string) => val, // Assuming they are same for now
    rule: (val: string) => (val === "sentence" ? "1 câu" : "1 kí tự"),
  };

  const [formData, setFormData] = useState({
    title: work.title,
    category_type: work.category_type,
    hinh_thuc: work.sub_category || "",
    license: work.license || "public",
    writing_rule: reverseMapping.rule(work.limit_type || "sentence"),
  });

  // Update form data if work changes (though modal is usually per-card)
  useEffect(() => {
    setFormData({
      title: work.title,
      category_type: work.category_type,
      hinh_thuc: work.sub_category || "",
      license: work.license || "public",
      writing_rule: reverseMapping.rule(work.limit_type || "sentence"),
    });
  }, [work]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await updateWork(work.id.toString(), formData);

    if (result.success) {
      onClose();
      router.refresh();
    } else {
      setError(result.error || "Có lỗi xảy ra.");
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white border-2 border-black rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg relative z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-3xl font-sans font-black mb-8 text-center uppercase tracking-tight text-black">Chỉnh sửa tác phẩm</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 font-sans">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">TIÊU ĐỀ</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-6 py-3 border-2 border-black rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-sm text-black"
                  placeholder="Tên tác phẩm của bạn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">THỂ LOẠI</label>
                  <select
                    value={formData.category_type}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      let newSub = "";
                      if (newCategory === "Thơ") newSub = "Tứ ngôn";
                      else if (newCategory === "Văn xuôi") newSub = "Tùy bút";
                      
                      setFormData({ 
                        ...formData, 
                        category_type: newCategory,
                        hinh_thuc: newSub
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-white focus:outline-none text-sm text-black"
                  >
                    <option>Văn xuôi</option>
                    <option>Thơ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">HÌNH THỨC</label>
                  <select
                    value={formData.hinh_thuc}
                    onChange={(e) => setFormData({ ...formData, hinh_thuc: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-white focus:outline-none text-sm text-black"
                  >
                    {formData.category_type === "Thơ" ? (
                      <>
                        <option>Tứ ngôn</option>
                        <option>Ngũ ngôn</option>
                        <option>Lục ngôn</option>
                        <option>Thất ngôn</option>
                        <option>Bát ngôn</option>
                        <option>Tự do</option>
                      </>
                    ) : (
                      <>
                        <option>Tùy bút</option>
                        <option>Nhật ký</option>
                        <option>Hồi ký</option>
                        <option>Tản văn</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">QUY TẮC</label>
                  <select
                    value={formData.writing_rule}
                    onChange={(e) => setFormData({ ...formData, writing_rule: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-white focus:outline-none text-sm text-black"
                  >
                    <option>1 câu</option>
                    <option>1 kí tự</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">QUYỀN RIÊNG TƯ</label>
                  <select
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-white focus:outline-none text-sm text-black"
                  >
                    <option value="public">Cộng đồng</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl text-sm font-bold animate-shake">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-black text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all text-sm"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-black text-white font-bold uppercase tracking-widest rounded-xl hover:opacity-80 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? "ĐANG LƯU..." : "CẬP NHẬT"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
