import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { Work } from "@/stores/work-store";
import DeleteWorkButton from "./DeleteWorkButton";
import { formatDate } from "@/utils/date";
import { toast } from "sonner";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins || 1}m trước`;
  } else if (diffHours < 24) {
    return `${diffHours}h trước`;
  } else {
    return `${diffDays}n trước`;
  }
}

interface WorkCardProps {
  work: Work;
  isOwner?: boolean;
  hideMenu?: boolean;
  variant?: "default" | "home";
  layout?: "grid" | "list";
  initialSaved?: boolean;
  onPreview?: (work: Work, initialSaved: boolean) => void;
  onEdit?: (work: Work) => void;
  index?: number;
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
  index,
}: WorkCardProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPrivateNotice, setShowPrivateNotice] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHome = variant === "home";
  const isList = layout === "list";

  const category = work.category_type || work.type || "";
  const isPoetry = category === "Thơ";
  const isProse = category === "Văn xuôi" || category === "Văn";

  const badgeStyles = isProse
    ? "bg-[#EDF3EC] text-[#346538] border border-[#D4E5D5]/40"
    : isPoetry
      ? "bg-[#E1F3FE] text-[#1F6C9F] border border-[#C7E3F7]/40"
      : "bg-[#FBF3DB] text-[#956400] border border-[#F0E4C0]/40";

  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [contributors, setContributors] = useState<string[]>(work.contributors || []);

  useEffect(() => {
    setIsSaved(initialSaved);
  }, [initialSaved]);

  useEffect(() => {
    if (work.contributors) {
      setContributors(work.contributors);
      return;
    }

    const fetchContributors = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("contributions")
          .select("author_nickname")
          .eq("work_id", work.id);

        if (!error && data) {
          const unique = Array.from(
            new Set(
              data.map((c: { author_nickname: string | null }) => c.author_nickname).filter(Boolean)
            )
          ) as string[];
          setContributors(unique);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchContributors();
  }, [work.id, work.contributors]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { toggleSaveWork } = await import("@/actions/save-work");
      const res = await toggleSaveWork(work.id.toString());
      if (res.success) {
        setIsSaved(res.saved ?? false);
        toast.success(res.saved ? "Đã lưu tác phẩm" : "Đã bỏ lưu tác phẩm");
      } else {
        toast.error(res.error || "Không thể thực hiện tác vụ");
      }
    } catch {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsSaving(false);
    }
  };

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
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: index ? Math.min(index * 0.05, 0.3) : 0,
      }}
      className="w-full relative"
    >
      {isList ? (
        <div
          onClick={handleCardClick}
          className="group relative w-full py-6 border-b border-black/[0.06] hover:bg-black/[0.01] px-2 flex flex-col transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex justify-between items-start w-full gap-4">
            {/* Bên trái: Tiêu đề & Tags */}
            <div className="flex-grow flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold font-ganh leading-[36px] text-black group-hover:text-literary-gold underline decoration-transparent group-hover:decoration-literary-gold/35 decoration-[1.5px] underline-offset-4 transition-all duration-300 line-clamp-2 break-words">
                {work.title}
              </h2>
              <div className="h-[36px] flex items-center gap-3 text-xs sm:text-sm flex-wrap overflow-hidden">
                <span className="font-black uppercase tracking-[0.2em] text-black/60">
                  {work.type}
                </span>
                <span className="text-black/20">•</span>
                <span className="font-bold uppercase tracking-widest text-black/50">
                  {work.age_rating?.toLowerCase() === "all" ? "Mọi độ tuổi" : work.age_rating}
                </span>
                {work.rule && (
                  <>
                    <span className="text-black/20">•</span>
                    <span className="font-black uppercase tracking-tighter text-black/60">
                      {work.rule}
                    </span>
                  </>
                )}
                <span className="text-black/20">•</span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${work.status === "Hoàn thành" ? "bg-green-600" : work.status === "Đang viết" ? "bg-blue-600" : "bg-yellow-600"}`}
                  />
                  <span className="font-bold uppercase tracking-widest text-black/60">
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
                <div className="h-[36px] flex items-center text-xs sm:text-sm font-bold text-black/50 uppercase tracking-widest">
                  {formatDate(work.created_at || new Date().toISOString())}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleCardClick}
          className="group relative w-full bg-white rounded-[12px] p-6 sm:p-8 flex flex-col justify-between min-h-[300px] border border-black/[0.10] cursor-pointer overflow-hidden font-be-vietnam transition-[border-color,box-shadow] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-black/25 hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
        >
          {/* Top Header: Metadata & Bookmark icon */}
          <div className="flex justify-between items-center mb-6">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-[4px] ${badgeStyles}`}
            >
              {work.hinh_thuc || work.type}
            </span>

            <button
              onClick={handleBookmarkClick}
              disabled={isSaving}
              aria-label={isSaved ? "Bỏ lưu tác phẩm" : "Lưu tác phẩm"}
              className={`text-gray-400 hover:text-black transition-colors ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isSaved ? "text-black" : ""}
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </button>
          </div>

          {/* Center: Title & Description */}
          <div className="flex-grow">
            <h2 className="text-xl sm:text-2xl font-bold font-ganh text-black mb-3 leading-snug group-hover:text-literary-gold underline decoration-transparent group-hover:decoration-literary-gold/35 decoration-[1.5px] underline-offset-4 transition-all duration-300 line-clamp-2">
              {work.title}
            </h2>
            <p className="font-be-vietnam italic text-gray-600 text-sm mb-6 line-clamp-3">
              {work.description || "Chưa có mô tả cho tác phẩm này."}
            </p>
          </div>

          {/* Bottom: Contributors & Updated Time */}
          <div className="mt-auto pt-5 border-t border-black/5 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              {(contributors.length > 0 ? contributors : [work.author_nickname])
                .slice(0, 3)
                .map((name: string, i: number) => (
                  <div key={i} className="relative group/avatar">
                    <div className="h-6 w-6 rounded-[4px] border border-black/[0.08] bg-black/[0.03] text-black/70 flex items-center justify-center text-[10px] font-bold select-none transition-colors duration-200 hover:bg-black/[0.06] hover:text-black">
                      {name.substring(0, 1).toUpperCase()}
                    </div>
                    {/* CSS Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-black text-white text-[9px] uppercase tracking-widest font-semibold rounded-[4px] opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-black">
                      {name}
                    </span>
                  </div>
                ))}
              {(contributors.length > 0 ? contributors : [work.author_nickname]).length > 3 && (
                <div className="relative group/avatar">
                  <div className="h-6 w-6 rounded-[4px] border border-black/[0.08] bg-black/[0.03] text-black/50 flex items-center justify-center text-[9px] font-bold select-none">
                    +{(contributors.length > 0 ? contributors : [work.author_nickname]).length - 3}
                  </div>
                  {/* Tooltip listing remaining contributors */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-black text-white text-[9px] uppercase tracking-widest font-semibold rounded-[4px] opacity-0 group-hover/avatar:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30 shadow-md before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-black">
                    {(contributors.length > 0 ? contributors : [work.author_nickname])
                      .slice(3)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            <span className="text-[11px] text-black/40 font-medium">
              {formatTimeAgo(work.created_at || new Date().toISOString())}
            </span>
          </div>
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
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                className="absolute right-0 mt-1 w-36 bg-white border-2 border-black rounded shadow-lg py-1 overflow-hidden"
                style={{ right: "0", left: "auto", transformOrigin: "top right" }}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
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
