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
  layout?: "grid" | "list";
  initialSaved?: boolean;
  onPreview?: (work: Work, initialSaved: boolean) => void;
  onEdit?: (work: Work) => void;
}

const WorkCard = memo(function WorkCard({
  work,
  isOwner,
  hideMenu,
  variant = "default",
  layout = "grid",
  initialSaved = false,
  onPreview,
  onEdit,
}: WorkCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPrivateNotice, setShowPrivateNotice] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = variant === "home";
  const isList = layout === "list";

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
      {isList ? (
        <div
          onClick={handleCardClick}
          className="group relative w-full pt-[36px] pb-[36px] flex flex-col transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="flex justify-between items-start w-full gap-4">
            {/* Bên trái: Tiêu đề & Tags */}
            <div className="flex-grow flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold font-ganh leading-[36px] text-black hover:text-literary-gold transition-colors line-clamp-2 break-words">
                {work.title}
              </h2>
              <div className="h-[36px] flex items-center gap-3 text-xs sm:text-sm flex-wrap overflow-hidden">
                <span className="font-black uppercase tracking-[0.2em] text-black/70">
                  {work.type}
                </span>
                <span className="text-black/30">•</span>
                <span className="font-bold uppercase tracking-widest text-black/60">
                  {work.age_rating?.toLowerCase() === "all" ? "Mọi độ tuổi" : work.age_rating}
                </span>
                {work.rule && (
                  <>
                    <span className="text-black/30">•</span>
                    <span className="font-black uppercase tracking-tighter text-black/70">
                      {work.rule}
                    </span>
                  </>
                )}
                <span className="text-black/30">•</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${work.status === "Hoàn thành" ? "bg-green-600" : work.status === "Đang viết" ? "bg-blue-600" : "bg-yellow-600"}`} />
                  <span className="font-bold uppercase tracking-widest text-black/70">
                    {work.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bên phải: Tác giả & Ngày */}
            <div className="flex-shrink-0 flex flex-col items-end text-right min-w-[120px]">
              <div
                className="h-[36px] flex items-center cursor-pointer group/author"
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
                <span className="font-ganh text-base sm:text-lg font-bold text-black hover:text-literary-gold transition-colors">
                  {work.author_nickname}
                </span>
              </div>
              {!isHome && (
                <div className="h-[36px] flex items-center text-xs sm:text-sm font-bold text-black/60 uppercase tracking-widest">
                  {formatDate(work.created_at || new Date().toISOString())}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleCardClick}
          className={`group relative w-full bg-transparent pt-[36px] px-5 sm:px-7 pb-[36px] flex flex-col min-h-[288px] sm:h-[360px] transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1`}
          style={{
            backgroundImage: "linear-gradient(transparent 95%, rgba(0,0,0,0.1) 95%)",
            backgroundSize: "100% 2.25rem",
          }}
        >
          {/* Remove inner border */}

          {/* Top Header: Metadata & Geometric Accent */}
          <div className={`flex justify-between items-start mb-[36px] ${isHome ? "h-[36px]" : "h-[72px]"}`}>
            <div className="flex flex-col">
              <div className="h-[36px] flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-black flex-shrink-0" />
                <span
                  className={`text-xs sm:text-sm uppercase tracking-[0.2em] ${isHome ? "font-bold text-black" : "font-black text-black/70"}`}
                >
                  {work.type}
                </span>
              </div>
              {!isHome && (
                <div className="h-[36px] flex items-center text-xs sm:text-sm font-bold text-black/60 uppercase tracking-widest pl-4.5">
                  {formatDate(work.created_at || new Date().toISOString())}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`h-[36px] flex items-center text-xs sm:text-sm font-bold uppercase tracking-widest ${isHome ? "text-black" : "text-black"}`}
              >
                {work.age_rating?.toLowerCase() === "all" ? "Mọi độ tuổi" : work.age_rating}
              </span>
              {work.rule && !isHome && (
                <span className="h-[36px] flex items-center text-xs sm:text-sm font-black uppercase tracking-tighter text-black/70">
                  {work.rule}
                </span>
              )}
            </div>
          </div>

          {/* Center: High-Impact Title */}
          <div className="flex-grow">
            <h2
              className={`text-xl sm:text-2xl md:text-3xl font-ganh leading-[36px] tracking-tight text-black line-clamp-3 break-words
              ${isHome ? "font-bold uppercase group-hover:text-black" : "font-bold group-hover:text-literary-gold transition-colors duration-500"}
            `}
            >
              {work.title}
            </h2>
          </div>

          {/* Bottom: Status & Author Signature */}
          <div className="mt-auto pt-[36px] flex flex-col sm:flex-row sm:items-center justify-between gap-0">
            <div className="h-[36px] flex items-center gap-2.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  work.status === "Hoàn thành"
                    ? "bg-green-600"
                    : work.status === "Đang viết"
                      ? "bg-blue-600"
                      : "bg-yellow-600"
                }`}
              />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-black/70">
                {work.status}
              </span>
            </div>

            <div
              className="h-[36px] flex items-center relative group/author self-start sm:self-auto"
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
                className={`font-ganh text-lg sm:text-xl font-bold transition-colors duration-300
                 ${isHome ? "group-hover/author:text-black" : "group-hover/author:text-literary-gold"}
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
      )}

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
