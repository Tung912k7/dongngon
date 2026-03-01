"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/stores/work-store";
import DeleteWorkButton from "./DeleteWorkButton";
import EditWorkModal from "./EditWorkModal";

interface ProfileWorkCardProps {
  work: Work;
  isOwner?: boolean;
}

export default function ProfileWorkCard({ work, isOwner }: ProfileWorkCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div className="relative group perspective-1000">
      <Link href={`/work/${work.id}`} className="block">
        <motion.div
          whileHover={{ rotateY: -10, x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-[180px] h-[260px] bg-white border-2 border-black rounded-r-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col p-4 transition-all group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          {/* Book Spine Detail */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/5 border-r border-black/10" />
          <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-black/10" />
          
          {/* Status Indicator Bar at top */}
          <div className={`absolute top-0 right-0 left-3 h-1 ${
            work.status === "Hoàn thành" ? "bg-green-500" :
            work.status === "Đang viết" ? "bg-blue-500" :
            "bg-yellow-500"
          }`} />

          {/* Type Badge */}
          <div className="mt-2 ml-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-black/30">
              {work.type}
            </span>
          </div>

          {/* Title */}
          <div className="flex-grow flex items-center justify-center text-center mt-2 px-2">
            <h3 className="text-lg font-bold text-black line-clamp-4 leading-tight tracking-tight uppercase">
              {work.title}
            </h3>
          </div>

          {/* Footer Info */}
          <div className="mt-auto pt-4 border-t border-black/5 ml-2">
            <p className="text-[10px] font-bold text-black truncate mb-0.5">{work.author_nickname}</p>
            <p className="text-[8px] text-gray-400 font-medium uppercase tracking-tighter">{work.date}</p>
          </div>
        </motion.div>
      </Link>

      {/* Actions Menu (3 dots) - Only visible on hover for owner */}
      {isOwner && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-7 h-7 flex items-center justify-center bg-white border border-black rounded-full shadow-sm hover:bg-black hover:text-white transition-all transform active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M12 7.5a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 13.25a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5zM12 19a1.25 1.25 0 110-1.5 1.25 1.25 0 010 1.5z" />
            </svg>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute right-0 mt-2 w-32 bg-white border-2 border-black rounded-xl shadow-xl py-1 overflow-hidden pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[10px] font-bold text-black hover:bg-gray-50 transition-colors uppercase tracking-widest"
                >
                  SỬA TÊN
                </button>
                <div className="h-[1px] bg-gray-100 mx-2" />
                <DeleteWorkButton 
                  workId={work.id.toString()} 
                  workTitle={work.title} 
                  variant="menuItem"
                  paddingClass="px-4 py-2"
                  onAction={() => setIsMenuOpen(false)}
                />
              </motion.div>
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
