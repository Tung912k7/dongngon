"use client";

import { useState, useEffect } from "react";
import { FilterState } from "@/app/kho-tang/types";
import { PROSE_SUBCATEGORIES } from "@/data/workTypes";

interface WorkFilterProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export default function WorkFilter({ filters, onApply }: WorkFilterProps) {
  // Local state for filters (synced from parent on open)
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const FilterApplyButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="px-4 py-2 text-sm font-medium rounded-md transition-all h-[38px] border border-gray-800 flex items-center justify-center"
        style={{
          backgroundColor: isHovered ? "black" : "white",
          color: isHovered ? "white" : "black",
        }}
      >
        {children}
      </button>
    );
  };

  // Sync local state when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleLocalChange = (key: keyof FilterState, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onApply(localFilters);
  };

  return (
    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 p-5 md:p-6 bg-white border-2 border-black rounded items-end w-full">
      <div className="flex flex-col gap-1.5 w-full md:w-auto">
        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] whitespace-nowrap">Loại văn bản</label>
        <select
          className="p-2.5 border-2 border-black rounded bg-white text-sm font-bold text-black focus:outline-none focus:bg-neutral-50 transition-all w-full"
          onChange={(e) => handleLocalChange("category_type", e.target.value)}
          value={localFilters.category_type}
        >
          <option value="">Tất cả</option>
          <option value="Thơ">Thơ</option>
          <option value="Văn xuôi">Văn xuôi</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-auto">
        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] whitespace-nowrap">Hình thức</label>
        <select
          className="p-2.5 border-2 border-black rounded bg-white text-sm font-bold text-black focus:outline-none focus:bg-neutral-50 transition-all w-full"
          onChange={(e) => handleLocalChange("hinh_thuc", e.target.value)}
          value={localFilters.hinh_thuc}
        >
          <option value="">Tất cả</option>
          <optgroup label="Thơ">
            <option value="Thơ 4 chữ">Tứ ngôn</option>
            <option value="Thơ 5 chữ">Ngũ ngôn</option>
            <option value="Thơ 6 chữ">Lục ngôn</option>
            <option value="Thơ 7 chữ">Thất ngôn</option>
            <option value="Thơ 8 chữ">Bát ngôn</option>
            <option value="Thơ tự do">Tự do</option>
          </optgroup>
          <optgroup label="Văn xuôi">
            {PROSE_SUBCATEGORIES.map((subCategory) => (
              <option key={subCategory} value={subCategory}>{subCategory}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-auto">
        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Quy tắc viết</label>
        <select
          className="p-2.5 border-2 border-black rounded bg-white text-sm font-bold text-black focus:outline-none focus:bg-neutral-50 transition-all w-full"
          onChange={(e) => handleLocalChange("writing_rule", e.target.value)}
          value={localFilters.writing_rule}
        >
          <option value="">Tất cả</option>
          <option value="1 câu">1 câu</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-auto">
        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] whitespace-nowrap">Ngày tạo</label>
        <select
          className="p-2.5 border-2 border-black rounded bg-white text-sm font-bold text-black focus:outline-none focus:bg-neutral-50 transition-all w-full"
          onChange={(e) => handleLocalChange("sort_date", e.target.value)}
          value={localFilters.sort_date}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-auto">
        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] whitespace-nowrap">Tiến độ</label>
        <select
          className="p-2.5 border-2 border-black rounded bg-white text-sm font-bold text-black focus:outline-none focus:bg-neutral-50 transition-all w-full"
          onChange={(e) => handleLocalChange("status", e.target.value)}
          value={localFilters.status}
        >
          <option value="">Tất cả</option>
          <option value="Đang viết">Đang viết</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đợi duyệt">Đợi duyệt</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5 w-full md:w-auto">
        <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] whitespace-nowrap">Số lượng</label>
        <select
          className="p-2.5 border-2 border-black rounded bg-white text-sm font-bold text-black focus:outline-none focus:bg-neutral-50 transition-all w-full"
          onChange={(e) => handleLocalChange("limit", e.target.value)}
          value={localFilters.limit}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>

      <div className="flex gap-2 col-span-2 md:col-span-1 w-full md:w-auto mt-4 md:mt-0">
        <button 
          onClick={applyFilters}
          className="w-1/2 md:w-auto px-6 py-2.5 border-2 border-black bg-black text-white rounded text-sm font-black uppercase tracking-widest transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none whitespace-nowrap"
        >
          Áp dụng
        </button>
        <button
          onClick={() => {
            const defaultFilters = {
              category_type: "",
              hinh_thuc: "",
              writing_rule: "",
              sort_date: "newest",
              status: "",
              limit: "10",
            };
            setLocalFilters(defaultFilters);
            onApply(defaultFilters);
          }}
          className="w-1/2 md:w-auto px-6 py-2.5 border-2 border-black bg-white text-black rounded text-sm font-black uppercase tracking-widest transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none whitespace-nowrap"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}

