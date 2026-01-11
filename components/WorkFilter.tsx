"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function WorkFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 mb-6">
      <select
        className="p-2 border rounded-md"
        onChange={(e) => handleFilterChange("category_type", e.target.value)}
        defaultValue={searchParams.get("category_type") || ""}
      >
        <option value="">Tất cả Thể loại</option>
        <option value="Poetry">Thơ</option>
        <option value="Prose">Văn xuôi</option>
      </select>

      <select
        className="p-2 border rounded-md"
        onChange={(e) => handleFilterChange("period", e.target.value)}
        defaultValue={searchParams.get("period") || ""}
      >
        <option value="">Tất cả Thời kỳ</option>
        <option value="Modern">Hiện đại</option>
        <option value="Ancient">Cổ đại</option>
      </select>
    </div>
  );
}
