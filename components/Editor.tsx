"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitContribution } from "@/actions/contribute";
import { checkBlacklist } from "@/utils/blacklist";
import { PrimaryButton } from "./PrimaryButton";
import NotificationModal from "./NotificationModal";
import { validatePoeticForm } from "@/utils/validation";
import { useUserStore } from "@/stores/user-store";
import { useEditorStore } from "@/stores/editor-store";

export default function Editor({ 
  workId, 
  writingRule, 
  hinhThuc,
  user: initialUser,
  canContribute = true,
  blockedMessage
}: { 
  workId: string; 
  writingRule: string; 
  hinhThuc?: string;
  user: { id: string } | null;
  canContribute?: boolean;
  blockedMessage?: string;
}) {
  const router = useRouter();
  
  // Zustand Stores
  const { user } = useUserStore();
  const {
    content,
    isSubmitting,
    error,
    warning,
    notification,
    setContent,
    setIsSubmitting,
    setError,
    setWarning,
    showNotification,
    closeNotification,
    reset
  } = useEditorStore();

  const isSubmittingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFreeVerse = hinhThuc === "Tự do";
  const [newLine, setNewLine] = useState(false);
  const isBlocked = !canContribute;

  // Sync initial user prop with store if store is empty
  if (initialUser && !user) {
    useUserStore.setState({ user: initialUser });
  }

  useEffect(() => {
    if (isBlocked) {
      setWarning(null);
      return;
    }

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
  }, [content, isBlocked, setWarning]);

  const validateContent = (content: string, limitType: string) => {
    const trimmed = content.trim();

    if (limitType === '1 câu') {
      // Allow dates like 02/03/2026 or 02-03-2026 without punctuation
      const dateRegex = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/;
      if (dateRegex.test(trimmed)) {
        return true;
      }

      const sentenceRegex = /[.?!]$/;
      return sentenceRegex.test(trimmed);
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      return;
    }

    if (isSubmitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const currentContent = textareaRef.current?.value ?? content;
    const cleanContent = currentContent.trim();
    
    if (!cleanContent) {
      setError("Vui lòng nhập nội dung.");
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    const isValidRule = validateContent(cleanContent, writingRule);
    
    if (!isValidRule) {
      let msg = "Nội dung không hợp lệ.";
      if (writingRule === '1 câu') {
        msg = "Nội dung phải kết thúc bằng dấu câu (. ! ?).";
      }
        
        showNotification(msg, "info", "Sai quy tắc");
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
    }

    if (hinhThuc) {
      const poeticResult = validatePoeticForm(cleanContent, hinhThuc, writingRule);
      if (!poeticResult.isValid) {
        showNotification(poeticResult.error || "Sai số chữ trong câu thơ.", "info", "Sai thể thơ");
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        return;
      }
    }

    setError(null);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("TIMEOUT")), 10000)
    );

    try {
      const result = await Promise.race([
        submitContribution(workId, cleanContent, isFreeVerse ? newLine : false),
        timeoutPromise
      ]) as { success?: boolean; error?: string };
      
      if (result.error) {
        setError(result.error);
      } else {
        reset();
        setNewLine(false);

        router.refresh();
      }
    } catch (err: unknown) {
      const e = err as Error;
      console.error("Submit contribution error:", e);
      if (e.message === "TIMEOUT") {
        setError("Yêu cầu quá hạn (Timeout). Vui lòng thử lại.");
      } else {
        setError("Có lỗi xảy ra khi gửi đóng góp.");
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (!user && !isBlocked) {
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
      {isBlocked && (
        <div className="absolute -top-12 left-0 right-0 bg-amber-50 text-amber-700 text-xs p-2 rounded text-center border border-amber-200">
          {blockedMessage || "Bạn không có quyền đóng góp cho tác phẩm này."}
        </div>
      )}
      {error && (
        <div className="absolute -top-12 left-0 right-0 bg-red-50 text-red-600 text-sm p-2 rounded text-center border border-red-200">
          {error}
        </div>
      )}
      {warning && !error && !isBlocked && (
        <div className="absolute -top-12 left-0 right-0 bg-yellow-50 text-yellow-700 text-xs p-2 rounded text-center border border-yellow-200">
          {warning}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder={isBlocked ? "Chế độ chỉ xem" : "Viết tiếp câu chuyện..."}
          maxLength={500}
          onKeyDown={(e) => {
            if (isBlocked) {
              return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="flex-grow p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black resize-none min-h-[46px] h-auto prose-input font-be-vietnam whitespace-pre-wrap"
          disabled={isSubmitting || isBlocked}
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
          disabled={isSubmitting || isBlocked}
        >
          {isBlocked ? "Chỉ xem" : isSubmitting ? "..." : "Gửi"}
        </PrimaryButton>
      </div>

      {/* Free verse new line toggle */}
      {isFreeVerse && !isBlocked && (
        <div className="flex items-center gap-2 mt-2 pl-1">
          <button
            type="button"
            onClick={() => setNewLine(!newLine)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border-2 ${
              newLine
                ? "bg-black text-white border-black"
                : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
            }`}
          >
            <span className="text-sm leading-none">↵</span>
            <span>Xuống dòng</span>
          </button>
          {newLine && (
            <span className="text-[10px] text-gray-400 italic">Câu này sẽ bắt đầu trên dòng mới</span>
          )}
        </div>
      )}
      {!isBlocked && (
        <p className="text-xs text-gray-400 mt-2 text-center pl-2">
          Mỗi ngày chỉ được đóng góp 1 câu.
          {writingRule === "1 câu" && " Cần kết thúc bằng dấu chấm (.), chấm hỏi (?) hoặc chấm than (!)."}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2 text-center pl-2">
        Cần hướng dẫn? Xem
        {" "}
        <Link href="/wiki" className="font-semibold text-black underline hover:opacity-70 transition-opacity">
          Wiki
        </Link>
        {" "}
        để nắm cách sử dụng đầy đủ.
      </p>

      <NotificationModal 
        isOpen={notification.isOpen} 
        onClose={closeNotification}
        message={notification.message}
        type={notification.type}
        title={notification.title}
      />
    </form>
  );
}
