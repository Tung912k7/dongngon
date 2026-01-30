"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createWork } from "@/actions/work";
import { motion, AnimatePresence } from "framer-motion";
import { WORK_TYPES, CATEGORY_OPTIONS } from "@/data/workTypes";
import { PrimaryButton } from "./PrimaryButton";

interface CreateWorkModalProps {
  customTrigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateWorkModal({ customTrigger, onSuccess }: CreateWorkModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isSubmitting = useRef(false);

  const [formData, setFormData] = useState({
    title: "",
    category_type: "Văn xuôi",
    hinh_thuc: "Tùy bút",
    license: "public",
    writing_rule: "1 câu",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        category_type: "Văn xuôi",
        hinh_thuc: "Tùy bút",
        license: "public",
        writing_rule: "1 câu",
      });
      setFieldErrors({});
      setError(null);
    }
  }, [isOpen]);

  // Automatically validate sub-category when category changes
  useEffect(() => {
    const availableSubCategories = WORK_TYPES[formData.category_type]?.subCategories || [];
    // If current sub-category is not valid for new category, pick the first one
    if (isOpen && (!formData.hinh_thuc || !availableSubCategories.includes(formData.hinh_thuc))) {
      setFormData(prev => ({ ...prev, hinh_thuc: availableSubCategories[0] || "" }));
    }
  }, [formData.category_type, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmitting.current) return;
    isSubmitting.current = true;
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    if (!formData.title.trim()) newFieldErrors.title = "Vui lòng nhập tiêu đề.";
    if (!formData.hinh_thuc) newFieldErrors.hinh_thuc = "Vui lòng chọn hình thức.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      isSubmitting.current = false;
      return;
    }

    setFieldErrors({});
    setError(null);
    
    // Timeout of 15 seconds for creation
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );

    try {
      const result = await Promise.race([
        createWork(formData),
        timeoutPromise
      ]) as any;

      if (result.success) {
        setIsLoading(false);
        isSubmitting.current = false;
        setIsOpen(false);
        if (onSuccess) onSuccess();
        router.refresh();
        setFormData({
          title: "",
          category_type: "Văn xuôi",
          hinh_thuc: "Tùy bút",
          license: "public",
          writing_rule: "1 câu",
        });
      } else {
        setError(result.error || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      console.error("Create work error:", err);
      if (err.message === "TIMEOUT") {
        setError("Yêu cầu quá hạn (Timeout). Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra khi tạo tác phẩm.");
      }
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <>
      {customTrigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {customTrigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            backgroundColor: isHovered ? "black" : "white",
          }}
          className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
          title="Tạo tác phẩm mới"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke={isHovered ? "white" : "black"}
            className="w-5 h-5 transition-colors"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              className="bg-white border-2 border-black rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg relative z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-tight text-black">Tạo tác phẩm mới</h2>
              
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
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 border-2 border-black text-black font-bold uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all text-sm"
                  >
                    HỦY
                  </button>
                  <PrimaryButton
                    type="submit"
                    disabled={isLoading || isSubmitting.current || !formData.title.trim() || !formData.hinh_thuc}
                    className="flex-1 !py-2 !text-xs !uppercase !tracking-widest"
                  >
                    {isLoading ? "..." : "TẠO TÁC PHẨM"}
                  </PrimaryButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
