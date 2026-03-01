"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/stores/work-store";
import DeleteWorkButton from "./DeleteWorkButton";
import EditWorkModal from "./EditWorkModal";
import { formatDate } from "@/utils/date";

interface WorkCardProps {
  work: Work;
  isOwner?: boolean;
  hideMenu?: boolean;
}

export default function WorkCard({ work, isOwner, hideMenu }: WorkCardProps) {
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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} 
      className="w-full"
    >
      <Link
        href={`/work/${work.id}`}
        className="border sm:border-2 border-black/80 sm:border-black rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 bg-white hover:shadow-xl transition-shadow flex flex-col min-h-[220px] sm:h-[360px] relative group cursor-pointer w-full text-left"
      >
        {/* Main Content Area */}
        <div className="w-full flex-grow flex flex-col items-start gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold line-clamp-2 leading-tight mb-2 text-gray-900">
            {work.title}
          </h1>
          
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h2 className="text-gray-500 font-medium text-base sm:text-lg flex items-center gap-1">
              Bởi: 
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
            </h2>
            <h2 className="flex items-center gap-2 text-gray-400 text-sm sm:text-base font-normal">
              <span>{formatDate(work.created_at || new Date().toISOString())}</span>
              <span>•</span>
              <span>{work.age_rating === 'all' || work.age_rating === 'All' ? 'Mọi độ tuổi' : work.age_rating}</span>
            </h2>
          </div>
        </div>

        {/* Bottom Tags Row - Exactly as per snippet, no extra line */}
        <div className="flex flex-wrap gap-2 mt-auto flex-shrink-0">
          <span className="border border-black rounded-full px-4 py-2 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap transition-colors cursor-pointer tag tracking-tight !px-3 !py-1 !text-xs !font-medium bg-white text-black">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                work.status === "Hoàn thành" ? "bg-green-500" :
                work.status === "Đang viết" ? "bg-blue-500" :
                "bg-yellow-500"
              }`} />
              {work.status}
            </span>
          </span>
          {work.type && (
            <span className="border border-black rounded-full px-4 py-2 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap transition-colors cursor-pointer tag tracking-tight !px-3 !py-1 !text-xs !font-medium bg-white text-black">
              {work.type}
            </span>
          )}
          {work.hinh_thuc && (
            <span className="border border-black rounded-full px-4 py-2 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap transition-colors cursor-pointer tag tracking-tight !px-3 !py-1 !text-xs !font-medium bg-white text-black">
              {work.hinh_thuc === 'all' ? 'Tất cả' : work.hinh_thuc}
            </span>
          )}
          {work.rule && (
            <span className="border border-black rounded-full px-4 py-2 text-center text-sm overflow-hidden text-ellipsis whitespace-nowrap transition-colors cursor-pointer tag tracking-tight !px-3 !py-1 !text-xs !font-medium bg-white text-black">
              {work.rule}
            </span>
          )}
        </div>
      </Link>

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
              className="w-6 h-6"
            >
              <path
                d="M12 7.5a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 13.25a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 19a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5z"
              />
            </svg>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-1 w-36 bg-white border-2 border-black rounded-xl shadow-lg py-1 overflow-hidden"
                style={{ right: '0', left: 'auto' }}
              >
                <div className="px-1 flex flex-col">
                   <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditOpen(true);
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      {isOwner && (
        <EditWorkModal 
          work={work} 
          isOpen={isEditOpen} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}

      <AnimatePresence>
        {showPrivateNotice && (
          <motion.div
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
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                 </svg>
              </div>
              <div>
                <p className="font-black uppercase tracking-[0.2em] text-[10px] mb-1">Thông báo</p>
                <p className="font-bold text-sm">Người dùng đã khoá tài khoản</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
