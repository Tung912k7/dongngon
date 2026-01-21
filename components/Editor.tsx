"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitContribution } from "@/actions/contribute";
import { checkBlacklist } from "@/utils/blacklist";

export default function Editor({ workId }: { workId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (content.trim()) {
        const violation = await checkBlacklist(content);
        if (violation) {
          setWarning(`Phát hiện từ nhạy cảm (${violation}). Tác phẩm sẽ bị đưa vào trạng thái chờ duyệt nếu bạn gửi.`);
        } else {
          setWarning(null);
        }
      } else {
        setWarning(null);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await submitContribution(workId, content);
    
    if (result.error) {
      setError(result.error);
    } else {
      setContent("");
      router.refresh();
      // Optional: Add a success toast or vibration
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-red-50 text-red-600 text-sm p-2 rounded text-center border border-red-200">
          {error}
        </div>
      )}
      {warning && !error && (
        <div className="absolute -top-12 left-0 right-0 bg-yellow-50 text-yellow-700 text-xs p-2 rounded text-center border border-yellow-200">
          {warning}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết tiếp câu chuyện..."
          className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black font-montserrat"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "..." : "Gửi"}
        </button>
      </div>
       <p className="text-xs text-gray-400 mt-2 text-center pl-2">
        Mỗi ngày chỉ được đóng góp 1 câu.
      </p>
    </form>
  );
}
