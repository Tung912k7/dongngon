"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitContribution } from "@/actions/contribute";
import { checkBlacklist } from "@/utils/blacklist";
import NotificationModal from "./NotificationModal";

export default function Editor({ 
  workId, 
  writingRule, 
  hinhThuc,
  user
}: { 
  workId: string; 
  writingRule: string;
  hinhThuc?: string;
  user: any;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "error" | "success" | "info";
    title?: string;
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showNotification = (message: string, type: "error" | "success" | "info" = "info", title?: string) => {
    setNotification({ isOpen: true, message, type, title });
  };

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

  const validateContent = (content: string, limitType: string) => {
    const trimmed = content.trim();

    if (limitType === '1 kí tự') {
      const nonWhitespace = trimmed.replace(/\s+/g, "");
      return nonWhitespace.length === 1;
    }

    if (limitType === '1 câu') {
      // Regex tìm các dấu kết thúc câu.
      // Một câu chuẩn thường kết thúc bằng . ! hoặc ? và không chứa thêm các dấu này ở giữa (tùy ngữ cảnh, but keep it simple for now as per request)
      const sentenceEndings = trimmed.match(/[.!?]/g);

      // Kiểm tra nếu chỉ có đúng 1 dấu kết thúc ở cuối chuỗi
      // Note: User's logic snippet: const hasOneEnding = sentenceEndings && sentenceEndings.length === 1;
      const hasOneEnding = sentenceEndings && sentenceEndings.length === 1;
      const endsWithPunctuation = /[.!?]$/.test(trimmed);

      return hasOneEnding && endsWithPunctuation;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Vui lòng nhập nội dung.");
      setIsSubmitting(false);
      return;
    }

    // Content Validation based on rule
    const isValid = validateContent(trimmedContent, writingRule);
    
    if (!isValid) {
        let msg = "Nội dung không hợp lệ.";
        if (writingRule === '1 kí tự') {
            msg = "Quy tắc là '1 kí tự'. Vui lòng chỉ nhập đúng 1 kí tự.";
        } else if (writingRule === '1 câu') {
            msg = "Quy tắc là '1 câu'. Vui lòng nhập đúng 1 câu và kết thúc bằng dấu câu (. ! ?).";
        }
        
        showNotification(
            msg,
            "info",
            "Sai quy tắc"
        );
        setIsSubmitting(false);
        return;
    }

    setError(null);

    // Timeout of 10 seconds for submissions
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    try {
      const result = await Promise.race([
        submitContribution(workId, content),
        timeoutPromise
      ]) as any;
      
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Submit contribution error:", err);
      if (err.message === "TIMEOUT") {
        setError("Yêu cầu quá hạn (Timeout). Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra khi gửi đóng góp.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p className="text-sm text-gray-500 font-medium">
          Bạn cần{" "}
          <Link href="/dang-nhap" className="text-black font-bold underline hover:opacity-70 transition-opacity">
            đăng nhập
          </Link>{" "}
          hoặc{" "}
          <Link href="/dang-ky" className="text-black font-bold underline hover:opacity-70 transition-opacity">
            ghi danh
          </Link>{" "}
          để đóng góp cho tác phẩm này.
        </p>
      </div>
    );
  }

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
        <textarea
          value={content}
          onChange={(e) => {
            const value = e.target.value;
            
            // Automatic line wrap for poetic forms
            if (hinhThuc?.includes("Thơ") && hinhThuc !== "Thơ tự do") {
              const lines = value.split('\n');
              const currentLine = lines[lines.length - 1];
              const limitPerLine = parseInt(hinhThuc.replace("Thơ ", "")); // "Thơ 4 chữ" -> 4
              
              if (limitPerLine) {
                const words = currentLine.trim().split(/\s+/).filter(w => w.length > 0);
                // If we JUST typed a space and reached the limit, or have more than limit
                if (words.length >= limitPerLine && value.endsWith(" ")) {
                  setContent(value.trimEnd() + '\n');
                  return;
                }
              }
            }
            
            setContent(value);
          }}
          placeholder="Viết tiếp câu chuyện..."
          maxLength={500}
          className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black font-montserrat resize-none min-h-[46px] h-auto prose-input"
          disabled={isSubmitting}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : "Gửi"}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center pl-2">
        Mỗi ngày chỉ được đóng góp 1 câu.
      </p>

      <NotificationModal 
        isOpen={notification.isOpen} 
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        message={notification.message}
        type={notification.type}
        title={notification.title}
      />
    </form>
  );
}
