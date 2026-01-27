"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWork } from "@/actions/work";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/types/database";
import { WORK_TYPES, CATEGORY_OPTIONS } from "@/data/workTypes";

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

  // Map existing data to form
  useEffect(() => {
    setFormData({
      title: work.title,
      category_type: work.category_type,
      hinh_thuc: work.sub_category || "",
      license: work.license || "public",
      writing_rule: reverseMapping.rule(work.limit_type || "sentence"),
    });
  }, [work]);

  // Handle category changes - reset hinh_thuc if invalid
  useEffect(() => {
    // We only want to trigger this if category_type was actually changed by the user, 
    // but a simpler check is to see if hinh_thuc is compatible with the new category.
    const availableSubCategories = WORK_TYPES[formData.category_type]?.subCategories || [];
    if (formData.hinh_thuc && !availableSubCategories.includes(formData.hinh_thuc)) {
      setFormData(prev => ({ ...prev, hinh_thuc: "" }));
    }
  }, [formData.category_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Timeout of 15 seconds for updates
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );

    try {
      const result = await Promise.race([
        updateWork(work.id.toString(), formData),
        timeoutPromise
      ]) as any;

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Update work error:", err);
      if (err.message === "TIMEOUT") {
        setError("Yêu cầu quá hạn (Timeout). Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra khi cập nhật tác phẩm.");
      }
    } finally {
      setIsLoading(false);
    }
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
                  maxLength={100}
                  className="w-full px-6 py-3 border-2 border-black rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-sm text-black"
                  placeholder="Tên tác phẩm của bạn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">THỂ LOẠI</label>
                  <select
                    value={formData.category_type}
                    onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-white focus:outline-none text-sm text-black"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">HÌNH THỨC</label>
                  <select
                    value={formData.hinh_thuc}
                    onChange={(e) => setFormData({ ...formData, hinh_thuc: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black rounded-2xl font-bold bg-white focus:outline-none text-sm text-black"
                    required
                  >
                    <option value="" disabled>Chọn hình thức...</option>
                    {WORK_TYPES[formData.category_type]?.subCategories.map(sub => (
                      <option key={sub}>{sub}</option>
                    ))}
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
