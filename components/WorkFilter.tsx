"use client";

import { useState, useEffect } from "react";
import { FilterState } from "@/app/dong-ngon/page";

interface WorkFilterProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

export default function WorkFilter({ filters, onApply }: WorkFilterProps) {
  // Local state for filters (synced from parent on open)
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

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
    <div className="flex flex-wrap gap-4 p-4 bg-white border border-black rounded-lg shadow-sm items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Loại văn bản</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleLocalChange("category_type", e.target.value)}
          value={localFilters.category_type}
        >
          <option value="">Tất cả</option>
          <option value="Poetry">Thơ</option>
          <option value="Prose">Văn xuôi</option>
          <option value="Novel">Tiểu thuyết</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Hình thức</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleLocalChange("period", e.target.value)}
          value={localFilters.period}
        >
          <option value="">Tất cả</option>
          <option value="Modern">Hiện đại</option>
          <option value="Ancient">Cổ đại</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider">Quy tắc viết</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleLocalChange("writing_rule", e.target.value)}
          value={localFilters.writing_rule}
        >
          <option value="">Tất cả</option>
          <option value="OneChar">1 kí tự</option>
          <option value="OneSentence">1 câu</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Ngày tạo</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleLocalChange("sort_date", e.target.value)}
          value={localFilters.sort_date}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Tiến độ</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleLocalChange("status", e.target.value)}
          value={localFilters.status}
        >
          <option value="">Tất cả</option>
          <option value="In Progress">Đang viết</option>
          <option value="Completed">Hoàn thành</option>
          <option value="Paused">Tạm dừng</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Số lượng</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleLocalChange("limit", e.target.value)}
          value={localFilters.limit}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-black text-white text-sm font-bold uppercase rounded-md hover:opacity-80 transition-opacity h-[38px]"
        >
          Áp dụng
        </button>
        <button
          onClick={() => {
            const defaultFilters = {
              category_type: "",
              period: "",
              writing_rule: "",
              sort_date: "newest",
              status: "",
              limit: "10",
            };
            setLocalFilters(defaultFilters);
            onApply(defaultFilters);
          }}
          className="px-4 py-2 border border-black text-black text-sm font-bold uppercase rounded-md hover:bg-gray-100 transition-colors h-[38px] whitespace-nowrap"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}
