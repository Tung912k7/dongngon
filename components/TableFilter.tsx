"use client";

import { useState, useRef, useEffect } from "react";
import WorkFilter from "./WorkFilter";
import { motion, AnimatePresence } from "framer-motion";
import { FilterState } from "@/app/dong-ngon/page";

interface TableFilterProps {
  id?: string;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

export default function TableFilter({ id, filters, onApplyFilters }: TableFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleApply = (newFilters: FilterState) => {
    onApplyFilters(newFilters);
    setIsOpen(false);
  };

  return (
    <div id={id} className="relative inline-block z-20" ref={filterRef}>
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center mr-2"
          title="Bộ lọc"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isOpen ? "black" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 min-w-[300px]"
            >
              <WorkFilter filters={filters} onApply={handleApply} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
