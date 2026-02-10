"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitContribution } from "@/actions/contribute";
import { checkBlacklist } from "@/utils/blacklist";
import { PrimaryButton } from "./PrimaryButton";
import NotificationModal from "./NotificationModal";
import { validatePoeticForm } from "@/utils/validation";

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
    if (limitType === '1 kí tự') {
      // Allow 1 character, or 1 space + 1 character
      // This supports the user's request for manual spacing
      return /^ ?[^ ]$/.test(content);
    }

    const trimmed = content.trim();
    if (limitType === '1 câu') {
      const sentenceRegex = /[.?!]$/;
      return sentenceRegex.test(trimmed);
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // 1. Clean content: only trim if not in character mode
    // Preserve internal newlines (don't replace \n with space)
    const isCharacterMode = writingRule === '1 kí tự';
    const cleanContent = isCharacterMode ? content : content.trim();
    
    if (!cleanContent) {
      setError("Vui lòng nhập nội dung.");
      setIsSubmitting(false);
      return;
    }

    // 2. Validate rule
    const isValidRule = validateContent(cleanContent, writingRule);
    
    if (!isValidRule) {
        let msg = "Nội dung không hợp lệ.";
        if (writingRule === '1 kí tự') {
            msg = "Quy tắc là '1 kí tự'. Bạn có thể nhập đúng 1 kí tự hoặc 1 dấu cách + 1 kí tự để tự cách chữ.";
        } else if (writingRule === '1 câu') {
            msg = "Nội dung phải kết thúc bằng dấu chấm (.), hỏi (?) hoặc cảm thán (!).";
        }
        
        showNotification(msg, "info", "Sai quy tắc");
        setIsSubmitting(false);
        return;
    }

    // 2.1 Validate Poetic Form constraints
    if (hinhThuc) {
      const poeticResult = validatePoeticForm(cleanContent, hinhThuc, writingRule);
      if (!poeticResult.isValid) {
        showNotification(poeticResult.error || "Sai số chữ trong câu thơ.", "info", "Sai thể thơ");
        setIsSubmitting(false);
        return;
      }
    }

    setError(null);

    // 3. Nếu vượt qua kiểm tra, mới tiến hành Insert
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    try {
      const result = await Promise.race([
        submitContribution(workId, cleanContent),
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
            
            setContent(value);
          }}
          placeholder="Viết tiếp câu chuyện..."
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black resize-none min-h-[46px] h-auto prose-input font-be-vietnam whitespace-pre-wrap"
          disabled={isSubmitting}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        <PrimaryButton
          type="submit"
          className="!px-4 !py-1.5 !text-sm rounded-lg min-w-[70px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : "Gửi"}
        </PrimaryButton>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center pl-2">
        Mỗi ngày chỉ được đóng góp 1 {writingRule === "1 kí tự" ? "kí tự" : "câu"}.
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
