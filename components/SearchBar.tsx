"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    
    if (pathname !== "/kho-tang") {
      router.push(`/kho-tang?${params.toString()}`);
    } else {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, 300);

  return (
    <div className="relative w-full md:w-[300px] group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-300 pointer-events-none z-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm tác phẩm..."
        maxLength={100}
        className="w-full border border-black/10 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:ring-1 focus:ring-black font-ganh bg-white/80 backdrop-blur-md text-base transition-all duration-300 placeholder:text-gray-400 text-black shadow-sm hover:shadow-md focus:shadow-lg"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  );
};

export default SearchBar;