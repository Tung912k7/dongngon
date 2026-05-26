"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Root error boundary caught exception", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-white font-['Be_Vietnam_Pro']">
      <div className="max-w-md w-full border-4 border-black p-8 md:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
          Đã xảy ra lỗi hệ thống
        </h2>
        <p className="text-gray-600 mb-8 text-sm">
          Chúng mình đang kiểm tra và khắc phục sự cố này.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 border-2 border-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
}
