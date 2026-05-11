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
import ConfirmModal from "./ConfirmModal";

export default function Editor({ 
  workId, 
  writingRule, 
  hinhThuc,
  categoryType,
  user: initialUser,
  canContribute = true,
  blockedMessage
}: { 
  workId: string; 
  writingRule: string; 
  hinhThuc?: string;
  categoryType?: string;
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
  const isPoetry = categoryType === "Thơ";
  const [newLine, setNewLine] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

    // Poetry (Thơ) does not require sentence-ending punctuation
    if (!isPoetry) {
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
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    if (isSubmitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const currentContent = textareaRef.current?.value ?? content;
    const cleanContent = currentContent.trim();

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
      <div className="text-center py-6 bg-[#fcfcfc] rounded-xl border-2 border-black border-dashed">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
          Bạn cần{" "}
          <Link href="/dang-nhap" className="text-black font-black underline hover:opacity-70 transition-opacity">
            đăng nhập
          </Link>{" "}
          hoặc{" "}
          <Link href="/dang-ky" className="text-black font-black underline hover:opacity-70 transition-opacity">
            ghi danh
          </Link>{" "}
          để ghi dấu ấn.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {isBlocked && (
        <div className="absolute -top-14 left-0 right-0 bg-white border-2 border-black text-black font-bold text-[10px] uppercase tracking-widest p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in slide-in-from-bottom-2">
          {blockedMessage || "QUYỀN ĐÓNG GÓP ĐANG BỊ KHÓA."}
        </div>
      )}
      {error && (
        <div className="absolute -top-14 left-0 right-0 bg-red-600 border-2 border-red-600 text-white font-bold text-[10px] uppercase tracking-widest p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)] text-center animate-in fade-in slide-in-from-bottom-2">
          {error}
        </div>
      )}
      {warning && !error && !isBlocked && (
        <div className="absolute -top-14 left-0 right-0 bg-literary-gold border-2 border-black text-black font-bold text-[10px] uppercase tracking-widest p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in slide-in-from-bottom-2">
          {warning}
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          placeholder={isBlocked ? "CHẾ ĐỘ CHỈ XEM" : "VIẾT TIẾP CÂU CHUYỆN..."}
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
          className="flex-grow p-3 bg-[#fcfcfc] border-2 border-black rounded-xl focus:outline-none focus:bg-white transition-all resize-none min-h-[46px] h-auto font-be-vietnam text-sm placeholder:text-black/20 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
          disabled={isSubmitting || isBlocked}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        
        {/* Free verse new line toggle - Integrated into main row */}
        {isFreeVerse && !isBlocked && (
          <button
            type="button"
            onClick={() => setNewLine(!newLine)}
            title="Xuống dòng mới"
            className={`flex items-center justify-center w-11 h-11 rounded-xl border-2 border-black transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none ${
              newLine
                ? "bg-black text-literary-gold"
                : "bg-white text-black/30 hover:text-black"
            }`}
          >
            <span className="text-xl font-bold">↵</span>
          </button>
        )}

        <PrimaryButton
          type="submit"
          className="!px-4 !h-11 rounded-xl min-w-[55px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          disabled={isSubmitting || isBlocked}
        >
          {isBlocked ? (
             <span className="text-[10px] font-bold">LỜI</span>
          ) : isSubmitting ? (
             <span className="animate-pulse">...</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </PrimaryButton>
      </div>
      {!isBlocked && (
        <p className="text-xs text-gray-400 mt-2 text-center pl-2">
          Mỗi ngày chỉ được đóng góp 1 câu.
          {writingRule === "1 câu" && !isPoetry && " Cần kết thúc bằng dấu chấm (.), chấm hỏi (?) hoặc chấm than (!)."}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-2 text-center pl-2">
        Cần hướng dẫn? Xem
        {" "}
        <Link href="/hdsd" className="font-semibold text-black underline hover:opacity-70 transition-opacity">
          Hướng dẫn
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

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeSubmit}
        title="Bạn đã hài lòng chưa?"
        message="Một khi bạn bấm 'Hài lòng', nội dung này sẽ được ghi nhận vĩnh viễn và không thể chỉnh sửa."
      />
    </form>
  );
}
