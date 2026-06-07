"use client";

import { logger } from "@/lib/logger";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createWork } from "@/actions/work";
import { AnimatePresence, m } from "framer-motion";
import { CATEGORY_OPTIONS, WORK_TYPES } from "@/data/workTypes";
import { PrimaryButton } from "./PrimaryButton";

interface CreateWorkModalProps {
  customTrigger?: React.ReactNode;
  onSuccess?: () => void;
  defaultOpen?: boolean;
}

export default function CreateWorkModal({
  customTrigger,
  onSuccess,
  defaultOpen = false,
}: CreateWorkModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
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
    age_rating: "All",
    description: "",
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
        age_rating: "All",
        description: "",
      });
      setFieldErrors({});
      setError(null);
    }
  }, [isOpen]);

  // Synchronize defaultOpen when it changes
  useEffect(() => {
    if (defaultOpen) {
      setIsOpen(true);
    }
  }, [defaultOpen]);

  // Clean up URL parameters when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("create")) {
        url.searchParams.delete("create");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
  }, [isOpen]);

  // Automatically validate sub-category when category changes
  useEffect(() => {
    if (!isOpen) return;

    setFormData((prev) => {
      const availableSubCategories = WORK_TYPES[prev.category_type]?.subCategories || [];
      if (prev.hinh_thuc && availableSubCategories.includes(prev.hinh_thuc)) {
        return prev;
      }
      return { ...prev, hinh_thuc: availableSubCategories[0] || "" };
    });
  }, [formData.category_type, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmitting.current) return;
    isSubmitting.current = true;
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    if (!formData.title.trim()) newFieldErrors.title = "vui lòng nhập tiêu đề cho tác phẩm.";
    if (!formData.hinh_thuc) newFieldErrors.hinh_thuc = "vui lòng chọn hình thức thể hiện.";

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
      const result = (await Promise.race([createWork(formData), timeoutPromise])) as {
        success: boolean;
        error?: string;
      };

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
          age_rating: "All",
          description: "",
        });
      } else {
        setError(result.error || "đã xảy ra lỗi ngoài ý muốn. vui lòng thử lại.");
      }
    } catch (err: unknown) {
      const e = err as Error;
      logger.error("Create work error:", e);
      if (e.message === "TIMEOUT") {
        setError("yêu cầu phản hồi quá lâu. vui lòng thử lại sau ít phút.");
      } else {
        setError("đã xảy ra lỗi khi tạo tác phẩm mới.");
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
          className="w-10 h-10 rounded-full border border-[#eae6e1] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-[0.98] bg-white text-black/60 hover:bg-black/5 hover:text-black cursor-pointer"
          title="tạo tác phẩm mới"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="w-5 h-5 transition-colors"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <m.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#faf8f5] border border-[#eae6e1] rounded-2xl p-8 md:p-10 w-full max-w-lg relative z-10"
            >
              <h2 className="text-3.5xl font-ganh font-bold mb-8 text-center text-deep-teal lowercase">
                khởi tạo tác phẩm mới
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                    tiêu đề tác phẩm
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    maxLength={100}
                    className={`w-full px-4 py-3 border ${fieldErrors.title ? "border-red-400/60 bg-[#fdebec]" : "border-[#eae6e1]"} rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black bg-[#fcfaf8]`}
                    placeholder="tên tác phẩm của bạn..."
                  />
                  {fieldErrors.title && (
                    <p className="text-[#9f2f2d] text-xs font-medium mt-1 tracking-wide lowercase">
                      {fieldErrors.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-black/60 tracking-wider lowercase">
                      mô tả (tùy chọn)
                    </label>
                    <span
                      className={`text-[10px] font-bold ${formData.description.length > 450 ? "text-red-500" : "text-gray-400"}`}
                    >
                      {formData.description.length}/500
                    </span>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value.slice(0, 500) })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black resize-none bg-[#fcfaf8]"
                    placeholder="một chút lời dẫn cho tác phẩm của bạn..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                      thể loại
                    </label>
                    <select
                      value={formData.category_type}
                      onChange={(e) => setFormData({ ...formData, category_type: e.target.value })}
                      className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium bg-[#fcfaf8] focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                      hình thức
                    </label>
                    <select
                      value={formData.hinh_thuc}
                      onChange={(e) => {
                        setFormData({ ...formData, hinh_thuc: e.target.value });
                        if (fieldErrors.hinh_thuc)
                          setFieldErrors((prev) => ({ ...prev, hinh_thuc: "" }));
                      }}
                      className={`w-full px-4 py-3 border ${fieldErrors.hinh_thuc ? "border-red-400/60 bg-[#fdebec]" : "border-[#eae6e1]"} rounded-xl font-medium bg-[#fcfaf8] focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black cursor-pointer`}
                    >
                      <option value="" disabled>
                        chọn hình thức...
                      </option>
                      {WORK_TYPES[formData.category_type]?.subCategories.map((sub) => (
                        <option key={sub}>{sub}</option>
                      ))}
                    </select>
                    {fieldErrors.hinh_thuc && (
                      <p className="text-[#9f2f2d] text-xs font-medium mt-1 tracking-wide lowercase">
                        {fieldErrors.hinh_thuc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                      quy tắc
                    </label>
                    <select
                      value={formData.writing_rule}
                      onChange={(e) => setFormData({ ...formData, writing_rule: e.target.value })}
                      className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium bg-[#fcfaf8] focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black cursor-pointer"
                    >
                      <option>1 câu</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <label className="text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                      độ tuổi
                    </label>
                    <select
                      value={formData.age_rating}
                      onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                      className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium bg-[#fcfaf8] focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black cursor-pointer"
                    >
                      <option value="All">mọi độ tuổi</option>
                      <option value="13+">13+</option>
                      <option value="16+">16+</option>
                      <option value="18+">18+</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                    quyền riêng tư
                  </label>
                  <select
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium bg-[#fcfaf8] focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black cursor-pointer"
                  >
                    <option value="public">cộng đồng</option>
                    <option value="private">riêng tư</option>
                  </select>
                </div>

                {error && (
                  <div className="p-4 bg-[#fdebec] border border-red-200/40 text-[#9f2f2d] rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider rounded-full hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm bg-white"
                  >
                    hủy bỏ
                  </button>
                  <PrimaryButton
                    type="submit"
                    disabled={
                      isLoading ||
                      isSubmitting.current ||
                      !formData.title.trim() ||
                      !formData.hinh_thuc
                    }
                    className="flex-1 !py-3 !text-sm font-ganh font-bold !lowercase !tracking-wider !rounded-full !bg-[#134e4a] hover:!bg-[#003633] !text-[#faf8f5]"
                  >
                    {isLoading ? "..." : "tạo tác phẩm"}
                  </PrimaryButton>
                </div>
              </form>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
