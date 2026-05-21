import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { Work } from "@/stores/work-store";
import DeleteWorkButton from "./DeleteWorkButton";
import { formatDate } from "@/utils/date";

interface WorkCardProps {
  work: Work;
  isOwner?: boolean;
  hideMenu?: boolean;
  variant?: "default" | "home";
  initialSaved?: boolean;
  onPreview?: (work: Work, initialSaved: boolean) => void;
  onEdit?: (work: Work) => void;
}

const WorkCard = memo(function WorkCard({
  work,
  isOwner,
  hideMenu,
  variant = "default",
  initialSaved = false,
  onPreview,
  onEdit,
}: WorkCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPrivateNotice, setShowPrivateNotice] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = variant === "home";

  useEffect(() => {
    if (showPrivateNotice) {
      const timer = setTimeout(() => setShowPrivateNotice(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPrivateNotice]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCardClick = () => {
    if (onPreview) {
      onPreview(work, initialSaved);
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full relative"
    >
      <div
        onClick={handleCardClick}
        className={`group relative w-full bg-white border-2 border-black p-5 sm:p-7 flex flex-col min-h-[260px] sm:h-[340px] transition-all duration-300 cursor-pointer overflow-hidden
          ${isHome ? "rounded hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" : "hover:-translate-y-1"}
        `}
      >
        {/* Decorative Inner Border Reveal (on hover) */}
        {!isHome && (
          <div className="absolute inset-1 border border-black/0 group-hover:border-black/10 transition-all duration-500 pointer-events-none" />
        )}

        {/* Top Header: Metadata & Geometric Accent */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-black flex-shrink-0" />
              <span
                className={`text-[11px] uppercase tracking-[0.2em] ${isHome ? "font-bold text-black" : "font-black text-black/70"}`}
              >
                {work.type}
              </span>
            </div>
            {!isHome && (
              <div className="text-[11px] font-bold text-black/60 uppercase tracking-widest pl-4.5">
                {formatDate(work.created_at || new Date().toISOString())}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 border border-black ${isHome ? "bg-black text-white" : "bg-transparent text-black"}`}
            >
              {work.age_rating?.toLowerCase() === "all" ? "Mọi độ tuổi" : work.age_rating}
            </span>
            {work.rule && !isHome && (
              <span className="text-[11px] font-black uppercase tracking-tighter text-black/70">
                {work.rule}
              </span>
            )}
          </div>
        </div>

        {/* Center: High-Impact Title */}
        <div className="flex-grow flex flex-col justify-center py-4">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-ganh leading-[1.3] tracking-tight text-black line-clamp-3 break-words
            ${isHome ? "font-bold uppercase group-hover:text-black" : "font-bold group-hover:text-literary-gold transition-colors duration-500"}
          `}
          >
            {work.title}
          </h2>
        </div>

        {/* Bottom: Status & Author Signature */}
        <div className="mt-auto pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-t border-black/5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2 h-2 rounded-full border border-black/10 ${
                work.status === "Hoàn thành"
                  ? "bg-green-600"
                  : work.status === "Đang viết"
                    ? "bg-blue-600"
                    : "bg-yellow-600"
              }`}
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-black/70">
              {work.status}
            </span>
          </div>

          <div
            className="relative group/author self-start sm:self-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (work.is_author_private && !isOwner) {
                setShowPrivateNotice(true);
              } else {
                router.push(`/profile?id=${work.created_by}`);
              }
            }}
          >
            <span
              className={`font-ganh text-base sm:text-lg font-bold border-b-2 transition-colors duration-300 pb-0.5
               ${isHome ? "border-black group-hover/author:border-black" : "border-black group-hover/author:border-literary-gold"}
             `}
            >
              {work.author_nickname}
            </span>
          </div>
        </div>

        {/* Decorative Random Lines (Home Variant Only) */}
        {isHome && (
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 pointer-events-none opacity-20">
            <div
              className="h-[2px] bg-black"
              style={{ width: `${(parseInt(work.id.slice(-1), 16) % 30) + 10}px` }}
            />
            <div
              className="h-[2px] bg-black"
              style={{ width: `${(parseInt(work.id.slice(-2), 16) % 50) + 20}px` }}
            />
            <div
              className="h-[2px] bg-black"
              style={{ width: `${(parseInt(work.id.slice(-3), 16) % 20) + 15}px` }}
            />
          </div>
        )}
      </div>

      {/* Actions Menu Button - Floating on top */}
      {isOwner && !hideMenu && (
        <div className="absolute top-2 right-2 z-20" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-8 h-8 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/5 rounded-full transition-colors backdrop-blur-sm"
            title="Tùy chọn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M12 7.5a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 13.25a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 19a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5z" />
            </svg>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <m.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-1 w-36 bg-white border-2 border-black rounded shadow-lg py-1 overflow-hidden"
                style={{ right: "0", left: "auto" }}
              >
                <div className="px-1 flex flex-col">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onEdit) onEdit(work);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-black hover:bg-gray-50 transition-colors uppercase tracking-wider"
                  >
                    Chỉnh sửa
                  </button>
                  <div className="h-[1px] bg-gray-100 mx-2" />
                  <DeleteWorkButton
                    workId={work.id.toString()}
                    workTitle={work.title}
                    variant="menuItem"
                    onAction={() => setIsMenuOpen(false)}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Private Notice Overlay */}
      <AnimatePresence>
        {showPrivateNotice && (
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPrivateNotice(false);
            }}
          >
            <div className="bg-black/90 backdrop-blur-xl text-white px-8 py-6 rounded-[2rem] border border-white/20 shadow-2xl flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-[10px] mb-1">Thông báo</p>
                <p className="font-bold text-sm">Người dùng đã khoá tài khoản</p>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
});

export default WorkCard;
