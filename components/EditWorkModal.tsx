"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateWork } from "@/actions/work";
import { sanitizeTitle } from "@/utils/sanitizer";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/types/database";
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
    category: (val: string) => val,
    rule: (val: string) => (val === "sentence" ? "1 câu" : "1 kí tự"),
    license: (val: string) => (val === "public" ? "Cộng đồng" : "Riêng tư"),
  };

  const [formData, setFormData] = useState({
    title: work.title,
    category_type: work.category_type,
    hinh_thuc: work.sub_category || "",
    license: work.license || "public",
    writing_rule: reverseMapping.rule(work.limit_type || "sentence"),
  });

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
    if (isLoading) return;
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    if (!formData.title.trim()) newFieldErrors.title = "Tiêu đề không được để trống.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    setFieldErrors({});
    setError(null);
    
    const updateData = {
      title: sanitizeTitle(formData.title),
    };
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );

    try {
      const result = await Promise.race([
        updateWork(work.id.toString(), updateData),
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

              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Thông tin cố định (Không thể thay đổi)</p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 uppercase">
                    {formData.category_type}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 uppercase">
                    {formData.hinh_thuc}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 uppercase">
                    {formData.writing_rule}
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 uppercase">
                    {reverseMapping.license(formData.license)}
                  </div>
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
