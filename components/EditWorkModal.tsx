"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWork } from "@/actions/work";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/types/database";
import { WORK_TYPES, CATEGORY_OPTIONS } from "@/data/workTypes";
import { PrimaryButton } from "./PrimaryButton";

interface EditWorkModalProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditWorkModal({ work, isOpen, onClose }: EditWorkModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    if (isLoading) return;
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    if (!formData.title.trim()) newFieldErrors.title = "Please enter a title";
    if (!formData.hinh_thuc) newFieldErrors.hinh_thuc = "Vui lòng chọn hình thức.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    setFieldErrors({});
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
            <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-tight text-black">Chỉnh sửa tác phẩm</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">TIÊU ĐỀ</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: "" }));
                    }}
                    maxLength={100}
                    className={`w-full px-6 py-3 border-2 ${fieldErrors.title ? 'border-red-500 bg-red-50' : 'border-black'} rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-sm text-black`}
                    placeholder="Tên tác phẩm của bạn..."
                  />
                  {fieldErrors.title && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{fieldErrors.title}</p>}
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
                      onChange={(e) => {
                        setFormData({ ...formData, hinh_thuc: e.target.value });
                        if (fieldErrors.hinh_thuc) setFieldErrors(prev => ({ ...prev, hinh_thuc: "" }));
                      }}
                      className={`w-full px-4 py-3 border-2 ${fieldErrors.hinh_thuc ? 'border-red-500 bg-red-50' : 'border-black'} rounded-2xl font-bold bg-white focus:outline-none text-sm text-black`}
                    >
                      <option value="" disabled>Chọn hình thức...</option>
                      {WORK_TYPES[formData.category_type]?.subCategories.map(sub => (
                        <option key={sub}>{sub}</option>
                      ))}
                    </select>
                    {fieldErrors.hinh_thuc && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{fieldErrors.hinh_thuc}</p>}
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
                  <PrimaryButton
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 !py-2 !text-xs !uppercase !tracking-widest"
                  >
                    {isLoading ? "ĐANG LƯU..." : "CẬP NHẬT"}
                  </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
