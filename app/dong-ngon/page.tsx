"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import WorkFilter from "@/components/WorkFilter";
import TableFilter from "@/components/TableFilter";

// Filter State Type
export interface FilterState {
  category_type: string;
  period: string;
  writing_rule: string;
  sort_date: string;
  status: string;
  limit: string;
}

const defaultFilters: FilterState = {
  category_type: "",
  period: "",
  writing_rule: "",
  sort_date: "newest",
  status: "",
  limit: "10",
};

export default function DongNgonPage() {
  const router = useRouter();
  // Local filter state - resets on page reload
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  
  // Mock Auth State (Set to true to test logged-in behavior)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedWork, setSelectedWork] = useState<any>(null);

  const handleAuthAction = (action: () => void) => {
    if (!isLoggedIn) {
      router.push('/dang-ky');
    } else {
      action();
    }
  };

  // Mock Data
  const allWorks: any[] = [];

  // Filtered and Sorted Works
  const filteredWorks = useMemo(() => {

    let works = [...allWorks];

    // 1. Strict Filtering (AND Logic)
    works = works.filter((work) => {
      // Category
      if (filters.category_type) {
        if (filters.category_type === "Poetry" && work.type !== "Thơ") return false;
        if (filters.category_type === "Prose" && work.type !== "Văn xuôi") return false;
        if (filters.category_type === "Novel" && work.type !== "Tiểu thuyết") return false;
      }

      // Period
      if (filters.period) {
        if (filters.period === "Modern" && work.format !== "Hiện đại") return false;
        if (filters.period === "Ancient" && work.format !== "Cổ đại") return false;
      }

      // Rule
      if (filters.writing_rule) {
        if (filters.writing_rule === "OneChar" && work.rule !== "1 kí tự") return false;
        if (filters.writing_rule === "OneSentence" && work.rule !== "1 câu") return false;
      }

      // Status
      if (filters.status) {
        if (filters.status === "In Progress" && work.status !== "Đang viết") return false;
        if (filters.status === "Completed" && work.status !== "Hoàn thành") return false;
        if (filters.status === "Paused" && work.status !== "Tạm dừng") return false;
      }

      return true;
    });

    // 2. Sorting (Date only)
    works.sort((a, b) => {
      if (filters.sort_date === 'oldest') {
        return a.rawDate.getTime() - b.rawDate.getTime();
      }
      return b.rawDate.getTime() - a.rawDate.getTime();
    });

    // 3. Limit Logic
    const limit = parseInt(filters.limit) || 10;
    return works.slice(0, limit);
  }, [filters]);

  // Handle Tag Click
  const handleTagClick = (type: 'category' | 'period' | 'rule' | 'status', value: string) => {
    // Mapping from display text to filter value
    const mappings: { [key: string]: { [key: string]: string } } = {
      category: { "Thơ": "Poetry", "Văn xuôi": "Prose", "Tiểu thuyết": "Novel" },
      period: { "Hiện đại": "Modern", "Cổ đại": "Ancient" },
      rule: { "1 kí tự": "OneChar", "1 câu": "OneSentence" },
      status: { "Đang viết": "In Progress", "Hoàn thành": "Completed", "Tạm dừng": "Paused" }
    };

    const filterKeyMap: { [key: string]: keyof FilterState } = {
      category: "category_type",
      period: "period",
      rule: "writing_rule",
      status: "status"
    };

    const filterKey = filterKeyMap[type];
    const filterValue = mappings[type][value] || "";

    if (filterValue) {
      setFilters(prev => ({ ...prev, [filterKey]: filterValue }));
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* Header is now global in layout.tsx */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 flex flex-col items-center">
        

        {/* Data Grid & Filter */}
        <div className="w-full max-w-6xl relative">
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <TableFilter filters={filters} onApplyFilters={setFilters} />
              <span className="font-sans font-bold uppercase tracking-wider text-sm">Bộ lọc</span>
              
              {/* Reset Filter Button - Visible when filters are active */}
              {(filters.category_type || filters.period || filters.writing_rule || filters.status) && (
                <button 
                  onClick={() => setFilters(defaultFilters)}
                  className="ml-4 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors bg-red-50 px-2 py-1 rounded-md"
                  title="Xóa tất cả bộ lọc"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Đặt lại
                </button>
              )}
            </div>
            {/* Sort or other controls could go here */}
          </div>

            {filteredWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {filteredWorks.map((work) => (
                  <div 
                    key={work.id} 
                    onClick={() => setSelectedWork(work)}
                    className="border-2 border-black rounded-[2rem] p-8 bg-white hover:shadow-xl transition-shadow flex flex-col h-[320px] justify-between relative group cursor-pointer"
                  >


                    {/* Header */}
                    <div>
                      <h3 className="text-3xl font-bold font-sans line-clamp-2 leading-tight mb-2">
                        {work.title}
                      </h3>
                      <p className="text-base text-gray-500 font-sans">
                        {work.date}
                      </p>
                    </div>

                    {/* Tags Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <span 
                        onClick={() => handleTagClick('period', work.format)}
                        className="border border-black rounded-full px-3 py-2 text-center text-sm font-sans truncate hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        {work.format}
                      </span>
                      <span 
                        onClick={() => handleTagClick('rule', work.rule)}
                        className="border border-black rounded-full px-3 py-2 text-center text-sm font-sans truncate hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        {work.rule}
                      </span>
                      <span 
                        onClick={() => handleTagClick('category', work.type)}
                        className="border border-black rounded-full px-3 py-2 text-center text-sm font-sans truncate hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        {work.type}
                      </span>
                      <span 
                        onClick={() => handleTagClick('status', work.status)}
                        className={`border rounded-full px-3 py-2 text-center text-sm font-sans truncate transition-colors cursor-pointer ${
                          work.status === "Hoàn thành" ? "bg-green-100 border-green-600 text-green-800 hover:bg-green-200" :
                          work.status === "Đang viết" ? "bg-blue-100 border-blue-600 text-blue-800 hover:bg-blue-200" :
                          "bg-yellow-100 border-yellow-600 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {work.status}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                 <button 
                  onClick={() => handleAuthAction(() => alert("Open Create Work Dialog"))}
                  className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black hover:text-black hover:scale-110 transition-all duration-300 bg-white"
                  title="Tạo tác phẩm mới"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                 </button>
                 <p className="mt-6 text-xl font-sans text-gray-400 font-light">Chưa có tác phẩm nào.</p>
                 <p className="text-sm font-sans text-gray-400 mt-1">Hãy là người đầu tiên sáng tạo!</p>
              </div>
            )}
        </div>

      </main>

      {/* Read Work Modal */}
      {selectedWork && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedWork(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6 pr-8">
              <h2 className="text-3xl font-bold font-sans mb-2">{selectedWork.title}</h2>
              <div className="flex items-center gap-4 text-gray-500 font-sans text-sm">
                <span>{selectedWork.date}</span>
                <span>•</span>
                <span>{selectedWork.type}</span>
                <span>•</span>
                <span>{selectedWork.format}</span>
              </div>
            </div>

            {/* Mock Content */}
            <div className="font-sans text-lg leading-relaxed text-gray-800 space-y-4 mb-8 overflow-y-auto flex-1">
              <p>
                Đây là nội dung mô phỏng của tác phẩm "{selectedWork.title}". 
                Trong thực tế, nội dung này sẽ được tải từ cơ sở dữ liệu.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              {selectedWork.type === "Thơ" && (
                <div className="pl-4 border-l-4 border-gray-200 italic my-6 text-gray-600">
                  <p>Gió cuốn mây trôi về phương ấy</p>
                  <p>Để lại nơi đây một khoảng trời</p>
                  <p>Người đi xa vắng hồn cỏ cây</p>
                  <p>Mãi mãi ngàn năm tình chẳng phai.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSelectedWork(null)}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-bold font-sans"
              >
                Đóng
              </button>
              <button 
                onClick={() => handleAuthAction(() => alert(`Editing: ${selectedWork.title}`))}
                className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors font-bold font-sans flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Chỉnh sửa
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
