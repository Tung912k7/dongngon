"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Work } from "@/stores/work-store";
import DeleteWorkButton from "./DeleteWorkButton";
import EditWorkModal from "./EditWorkModal";

interface WorkLibraryItemProps {
  work: Work;
  isOwner?: boolean;
}

export default function WorkLibraryItem({ work, isOwner }: WorkLibraryItemProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showPrivateNotice, setShowPrivateNotice] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full relative group">
      <Link
        href={`/work/${work.id}`}
        className="flex items-center gap-4 p-4 sm:p-6 bg-white border-2 border-black rounded-2xl hover:bg-gray-50 transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        {/* Status indicator */}
        <div className={`w-2 h-10 rounded-full flex-shrink-0 ${
          work.status === "Hoàn thành" ? "bg-green-500" :
          work.status === "Đang viết" ? "bg-blue-500" :
          "bg-yellow-500"
        }`} title={work.status} />

        {/* Content */}
        <div className="flex-grow min-w-0 pr-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-1">
            <h3 className="text-lg font-bold text-black truncate tracking-tight">{work.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {work.type}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {work.hinh_thuc}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
             <span 
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 if (work.is_author_private && !isOwner) {
                   setShowPrivateNotice(true);
                 } else {
                   router.push(`/profile?id=${work.created_by}`);
                 }
               }}
               className="hover:text-black hover:underline cursor-pointer transition-colors"
               title={`Xem hồ sơ của ${work.author_nickname}`}
             >
               {work.author_nickname}
             </span>
             <span>•</span>
             <span>{work.date}</span>
             <span>•</span>
             <span className="bg-black/5 px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter">
                {work.age_rating === 'all' || work.age_rating === 'All' ? 'Mọi độ tuổi' : work.age_rating}
             </span>
          </div>
        </div>
      </Link>

      <AnimatePresence>
        {showPrivateNotice && (
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPrivateNotice(false);
            }}
          >
            <div className="bg-black/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                 </svg>
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-[8px] opacity-60">Thông báo</p>
                <p className="font-bold text-xs uppercase tracking-tight">Người dùng đã khoá tài khoản</p>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Actions Menu */}
      {isOwner && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M12 7.5a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 13.25a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 19a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5z" />
            </svg>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <m.div
                initial={{ opacity: 0, scale: 0.95, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 10 }}
                className="absolute right-0 top-10 w-40 bg-white border-2 border-black rounded-xl shadow-lg py-1 z-30"
              >
                <div className="px-1 flex flex-col">
                   <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-black hover:bg-gray-50 transition-colors uppercase tracking-widest"
                   >
                    CHỈNH SỬA
                   </button>
                   <div className="h-[1px] bg-gray-100 mx-2" />
                   <DeleteWorkButton 
                    workId={work.id.toString()} 
                    workTitle={work.title} 
                    variant="menuItem"
                    paddingClass="px-4 py-2"
                    onAction={() => setIsMenuOpen(false)}
                   />
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      {isOwner && (
        <EditWorkModal 
          work={work} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </div>
  );
}
