"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Work } from "@/types/database";
import DeleteWorkButton from "./DeleteWorkButton";
import EditWorkModal from "./EditWorkModal";
import { formatDate } from "@/utils/date";

interface WorkCardProps {
  work: Work;
  isOwner?: boolean;
}

export default function WorkCard({ work, isOwner }: WorkCardProps) {
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
    <div className="relative group w-36 h-48">
      {/* Card Content - Entire card is a link */}
      <Link
        href={`/work/${work.id}`}
        className="absolute inset-0 bg-black rounded-lg flex flex-col items-center justify-center p-4 hover:opacity-90 transition-opacity z-0 gap-2"
      >
        <span className="text-white font-bold text-center text-sm line-clamp-3">
          {work.title}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
          {formatDate(work.created_at)}
        </span>
      </Link>

      {/* Actions Menu Button - Floating on top */}
      {isOwner && (
        <div className="absolute top-1 z-20" style={{ right: '0px' }} ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
            title="Tùy chọn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-7 h-7"
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
    </div>
  );
}
