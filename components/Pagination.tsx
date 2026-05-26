"use client";

import React, { memo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all font-black text-sm ${
            currentPage === i
              ? "bg-black border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white text-black border-black hover:bg-black hover:text-white hover:-translate-y-0.5 active:translate-y-0"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <nav className="flex items-center justify-center gap-2 mt-12 mb-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-black font-black text-xs uppercase tracking-widest transition-all ${
          currentPage === 1
            ? "opacity-30 cursor-not-allowed"
            : "bg-white text-black hover:bg-black hover:text-white hover:-translate-y-0.5"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span>Trước</span>
      </button>

      <div className="hidden sm:flex items-center gap-2">{renderPageButtons()}</div>

      <div className="flex sm:hidden items-center px-4 font-bold">
        {currentPage} / {totalPages}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-black font-black text-xs uppercase tracking-widest transition-all ${
          currentPage === totalPages
            ? "opacity-30 cursor-not-allowed"
            : "bg-white text-black hover:bg-black hover:text-white hover:-translate-y-0.5"
        }`}
      >
        <span>Sau</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
});

export default Pagination;
