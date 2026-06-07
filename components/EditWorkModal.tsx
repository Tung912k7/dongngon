"use client";

import { logger } from "@/lib/logger";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateWork } from "@/actions/work";
import { sanitizeTitle } from "@/utils/sanitizer";
import { AnimatePresence, m } from "framer-motion";
import { Work } from "@/stores/work-store";
import { PrimaryButton } from "./PrimaryButton";

interface EditWorkModalProps {
  work: Work;
  isOpen: boolean;
  onClose: () => void;
}

type WorkMutationResult = {
  success?: boolean;
  error?: string;
};

const REVERSE_MAPPING = {
  category: (val: string) => val,
  rule: () => "1 câu",
  license: (val: string) => (val === "public" ? "Cộng đồng" : "Riêng tư"),
};

export default function EditWorkModal({ work, isOpen, onClose }: EditWorkModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: work.title,
    description: work.description || "",
    category_type: work.category_type || "",
    hinh_thuc: work.sub_category || "",
    license: work.license || "public",
    writing_rule: REVERSE_MAPPING.rule(),
  });

  useEffect(() => {
    setFormData({
      title: work.title,
      description: work.description || "",
      category_type: work.category_type || "",
      hinh_thuc: work.sub_category || "",
      license: work.license || "public",
      writing_rule: REVERSE_MAPPING.rule(),
    });
  }, [work]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    const newFieldErrors: Record<string, string> = {};
    if (!formData.title.trim()) newFieldErrors.title = "vui lòng nhập tiêu đề cho tác phẩm.";

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setIsLoading(false);
      return;
    }

    setFieldErrors({});
    setError(null);

    const updateData = {
      title: sanitizeTitle(formData.title),
      description: formData.description,
      license: formData.license,
    };

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 15000)
    );

    try {
      const result = (await Promise.race([
        updateWork(work.id.toString(), updateData),
        timeoutPromise,
      ])) as WorkMutationResult;

      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error || "đã xảy ra lỗi ngoài ý muốn. vui lòng thử lại.");
      }
    } catch (err: unknown) {
      logger.error("Update work error:", err);
      if (err instanceof Error && err.message === "TIMEOUT") {
        setError("yêu cầu phản hồi quá lâu. vui lòng thử lại sau ít phút.");
      } else {
        setError("đã xảy ra lỗi khi cập nhật tác phẩm.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <m.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#faf8f5] border border-[#eae6e1] rounded-2xl p-8 md:p-10 w-full max-w-lg relative z-10 shadow-sm"
          >
            <h2 className="text-3.5xl font-ganh font-bold mb-8 text-center text-deep-teal lowercase">
              chỉnh sửa tác phẩm
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

              {work.license !== "public" && (
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-medium text-black/60 tracking-wider mb-1.5 lowercase">
                    quyền riêng tư
                  </label>
                  <select
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    className="w-full px-4 py-3 border border-[#eae6e1] rounded-xl font-medium bg-[#fcfaf8] focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal transition-all duration-200 text-sm text-black cursor-pointer"
                  >
                    <option value="private">riêng tư</option>
                    <option value="public">cộng đồng</option>
                  </select>
                  <p className="text-xs font-medium text-black/40 italic tracking-tight lowercase">
                    * bạn có thể chuyển từ riêng tư sang cộng đồng, nhưng không thể làm ngược lại.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-[#eae6e1]">
                <p className="text-xs font-medium text-black/40 tracking-wider mb-4 lowercase">
                  thông tin cố định (không thể thay đổi)
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.category_type && (
                    <div className="px-4 py-2 bg-[#fcfaf8] border border-[#eae6e1] rounded-full text-xs font-medium text-black/60 lowercase">
                      {formData.category_type.toLowerCase()}
                    </div>
                  )}
                  <div className="px-4 py-2 bg-[#fcfaf8] border border-[#eae6e1] rounded-full text-xs font-medium text-black/60 lowercase">
                    {formData.hinh_thuc.toLowerCase()}
                  </div>
                  <div className="px-4 py-2 bg-[#fcfaf8] border border-[#eae6e1] rounded-full text-xs font-medium text-black/60 lowercase">
                    {formData.writing_rule.toLowerCase()}
                  </div>
                  {work.license === "public" && (
                    <div className="px-4 py-2 bg-[#fcfaf8] border border-[#eae6e1] rounded-full text-xs font-medium text-black/60 lowercase">
                      cộng đồng
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-[#fdebec] border border-red-200/40 text-[#9f2f2d] rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-[#eae6e1] text-black/80 font-ganh font-bold lowercase tracking-wider rounded-full hover:bg-black/5 active:scale-[0.98] transition-all duration-200 text-sm bg-white"
                >
                  hủy bỏ
                </button>
                <PrimaryButton
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 !py-3 !text-sm font-ganh font-bold !lowercase !tracking-wider !rounded-full !bg-[#134e4a] hover:!bg-[#003633] !text-[#faf8f5]"
                >
                  {isLoading ? "đang lưu..." : "cập nhật"}
                </PrimaryButton>
              </div>
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
