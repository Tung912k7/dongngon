"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function WorkFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white border border-black rounded-lg shadow-sm items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Loại văn bản</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleFilterChange("category_type", e.target.value)}
          defaultValue={searchParams.get("category_type") || ""}
        >
          <option value="">Tất cả</option>
          <option value="Poetry">Thơ</option>
          <option value="Prose">Văn xuôi</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Hình thức</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleFilterChange("period", e.target.value)}
          defaultValue={searchParams.get("period") || ""}
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
          onChange={(e) => handleFilterChange("writing_rule", e.target.value)}
          defaultValue={searchParams.get("writing_rule") || ""}
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
          onChange={(e) => handleFilterChange("sort_date", e.target.value)}
          defaultValue={searchParams.get("sort_date") || "newest"}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Tiến độ</label>
        <select
          className="p-2 border border-black rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black w-full"
          onChange={(e) => handleFilterChange("status", e.target.value)}
          defaultValue={searchParams.get("status") || ""}
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
          onChange={(e) => handleFilterChange("limit", e.target.value)}
          defaultValue={searchParams.get("limit") || "10"}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>
  );
}
