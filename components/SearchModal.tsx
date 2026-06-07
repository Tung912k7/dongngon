"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDebouncedCallback } from "use-debounce";
import { sanitizeTitle, sanitizeNickname } from "@/utils/sanitizer";
import { escapeILike } from "@/utils/validation";

interface WorkSuggestion {
  id: string;
  title: string;
  author_nickname: string;
  category_type: string;
  status: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TAGS = ["Văn xuôi", "Thơ", "Tiểu thuyết", "1 câu"];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkSuggestion[]>([]);
  const [isPending, startTransition] = useTransition();
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Focus trap / mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle focus when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow exit/enter animations to start before focus
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Debounced search logic querying Supabase
  const searchWorks = useDebouncedCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      try {
        const { data, error } = await supabase
          .from("works")
          .select("id, title, author_nickname, category_type, status")
          .eq("privacy", "Public")
          .eq("is_test", false)
          .or(`title.ilike.%${escapeILike(searchTerm)}%,author_nickname.ilike.%${escapeILike(searchTerm)}%`)
          .limit(5);

        if (error) {
          console.error("[SearchModal] Database query error:", error);
          setResults([]);
        } else if (data) {
          const mapped = data.map((work) => ({
            id: work.id,
            title: sanitizeTitle(work.title),
            author_nickname: sanitizeNickname(work.author_nickname),
            category_type: work.category_type,
            status:
              work.status === "writing"
                ? "Đang viết"
                : work.status === "finished"
                  ? "Hoàn thành"
                  : "Đợi duyệt",
          }));
          setResults(mapped);
          setActiveIndex(-1); // Reset keyboard selection index
        }
      } catch (err) {
        console.error("[SearchModal] Search failed:", err);
        setResults([]);
      }
    });
  }, 250);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    searchWorks(val);
  };

  // Perform full search and navigate to /kho-tang
  const handleFullSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    onClose();
    router.push(`/kho-tang?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  // Navigate directly to a specific work
  const handleSelectWork = (workId: string) => {
    onClose();
    router.push(`/work/${workId}`);
  };

  // Keyboard navigation inside search results
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    const totalItems = results.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (totalItems === 0) return;
      setActiveIndex((prev) => (prev + 1 >= totalItems ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (totalItems === 0) return;
      setActiveIndex((prev) => (prev - 1 < 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelectWork(results[activeIndex].id);
      } else {
        handleFullSearch(query);
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-24 px-4 md:pt-32">
          {/* Backdrop Blur */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-[#FAF8F5]/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Search Card Container */}
          <m.div
            initial={{ scale: 0.98, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Khung tìm kiếm tác phẩm"
            className="relative z-10 w-full max-w-2xl bg-[#FAF8F5]/90 border border-mist-grey/50 rounded-2xl shadow-[0_24px_48px_rgba(28,27,26,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden"
          >
            {/* Input Wrapper */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-mist-grey/30">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-on-surface-variant/40 shrink-0"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm tác phẩm, tác giả..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-0 p-0 text-lg text-ink-charcoal placeholder:text-on-surface-variant/35 focus:ring-0 focus:outline-none font-sans font-medium"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-full hover:bg-surface-container-low text-on-surface-variant/40 hover:text-on-surface transition-colors cursor-pointer"
                  aria-label="Xóa từ khóa"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              {/* Empty Query State (Tags / Suggestions) */}
              {!query.trim() && (
                <div className="px-4 py-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block mb-3">
                    Thể loại phổ biến
                  </span>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {POPULAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setQuery(tag);
                          searchWorks(tag);
                        }}
                        className="px-3.5 py-1.5 bg-white border border-mist-grey/40 rounded-full text-xs font-medium text-on-surface-variant hover:text-deep-teal hover:border-deep-teal/40 hover:bg-deep-teal/[0.02] active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loader */}
              {isPending && query.trim() && (
                <div className="flex items-center justify-center py-12 gap-2 text-sm text-on-surface-variant/50">
                  <svg
                    className="animate-spin h-4 w-4 text-deep-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Đang tìm tác phẩm...</span>
                </div>
              )}

              {/* Results List */}
              {!isPending && query.trim() && results.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 block">
                    Tác phẩm tìm thấy ({results.length})
                  </span>
                  {results.map((work, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={work.id}
                        onClick={() => handleSelectWork(work.id)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-deep-teal/[0.04] text-deep-teal"
                            : "hover:bg-deep-teal/[0.02] text-ink-charcoal"
                        }`}
                      >
                        <div className="flex flex-col gap-1 pr-4 min-w-0">
                          <span className="font-ganh font-bold text-[15px] leading-tight truncate">
                            {work.title}
                          </span>
                          <span className="text-[12px] text-on-surface-variant/60 font-medium truncate">
                            Tác giả: {work.author_nickname}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant/75 font-semibold">
                            {work.category_type}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              work.status === "Hoàn thành"
                                ? "bg-green-500/10 text-green-700"
                                : "bg-orange-500/10 text-orange-700"
                            }`}
                          >
                            {work.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Full Search Action Bar */}
                  <div className="border-t border-mist-grey/20 mt-2 pt-2 px-2 pb-1">
                    <button
                      onClick={() => handleFullSearch(query)}
                      className="w-full text-center py-2.5 bg-deep-teal text-white hover:bg-ink-charcoal rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                    >
                      Xem tất cả kết quả cho &quot;{query}&quot;
                    </button>
                  </div>
                </div>
              )}

              {/* Empty Results State */}
              {!isPending && query.trim() && results.length === 0 && (
                <div className="text-center py-12 px-4 flex flex-col items-center">
                  <span className="font-ganh font-bold text-lg text-ink-charcoal mb-2">
                    Không tìm thấy tác phẩm
                  </span>
                  <span className="text-xs text-on-surface-variant/60 max-w-[280px] leading-relaxed mb-6">
                    Không có kết quả nào khớp với &quot;{query}&quot;. Nhấn nút dưới để tìm kiếm sâu
                    hơn.
                  </span>
                  <button
                    onClick={() => handleFullSearch(query)}
                    className="px-6 py-2.5 bg-deep-teal text-white hover:bg-ink-charcoal rounded-full text-xs font-semibold tracking-wider transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    Tìm kiếm sâu trên Kho Tàng
                  </button>
                </div>
              )}
            </div>

            {/* Footer Hints */}
            <div className="bg-surface-container-low/50 border-t border-mist-grey/30 px-6 py-3 flex items-center justify-between text-[11px] text-on-surface-variant/45 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-mist-grey/50 px-1.5 py-0.5 rounded text-[9px] shadow-sm">
                    Esc
                  </kbd>{" "}
                  Đóng
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-mist-grey/50 px-1.5 py-0.5 rounded text-[9px] shadow-sm">
                    ↵
                  </kbd>{" "}
                  Tìm kiếm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-mist-grey/50 px-1.5 py-0.5 rounded text-[9px] shadow-sm">
                    ↑
                  </kbd>
                  <kbd className="bg-white border border-mist-grey/50 px-1.5 py-0.5 rounded text-[9px] shadow-sm">
                    ↓
                  </kbd>{" "}
                  Lựa chọn
                </span>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
