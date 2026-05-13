"use client";

import React, { useState, useEffect } from "react";
import { toggleSaveWork } from "@/actions/save-work";
import { m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface SaveWorkButtonProps {
  workId: string;
  initialSaved?: boolean;
  variant?: "icon" | "full";
  className?: string;
}

export default function SaveWorkButton({
  workId,
  initialSaved = false,
  variant = "icon",
  className = "",
}: SaveWorkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync state if initialSaved changes (e.g. navigation or refetch)
  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved, workId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI
    const nextSavedState = !isSaved;
    setIsSaved(nextSavedState);
    setIsAnimating(true);
    
    try {
      const result = await toggleSaveWork(workId);
      
      if (!result.success) {
        // Rollback on error
        setIsSaved(!nextSavedState);
        toast.error(result.error);
      } else {
        // Ensure state is synced with server response
        setIsSaved(result.saved!);
      }
    } catch (error) {
      // Rollback on exception
      setIsSaved(!nextSavedState);
      toast.error("Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  if (variant === "full") {
    return (
      <button
        onClick={handleToggle}
        aria-label={isSaved ? "Bỏ lưu tác phẩm" : "Lưu tác phẩm"}
        className={`w-full flex items-center gap-2.5 px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 group
          ${isSaved ? "bg-red-50 text-red-600 hover:bg-red-100" : "hover:bg-black hover:text-white active:bg-black/90"}
          ${className}
        `}
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isSaved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isAnimating ? "scale-125" : ""}`}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <AnimatePresence>
            {isAnimating && (
              <m.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-400 rounded-full"
              />
            )}
          </AnimatePresence>
        </div>
        <span>{isSaved ? "Đã lưu tác phẩm" : "Lưu tác phẩm"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors group
        ${isSaved ? "bg-red-50 text-red-600 border-red-200" : "bg-white/10 hover:bg-black/5 text-gray-400 hover:text-red-500 border-transparent"}
        border-2
        ${className}
      `}
      title={isSaved ? "Bỏ lưu" : "Lưu tác phẩm"}
      aria-label={isSaved ? "Bỏ lưu tác phẩm" : "Lưu tác phẩm"}
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isSaved ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform duration-300 ${isAnimating ? "scale-150" : "group-hover:scale-110"}`}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <AnimatePresence>
          {isAnimating && (
            <m.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-400 rounded-full"
            />
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

