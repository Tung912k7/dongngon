"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WorkFilter from "@/components/WorkFilter";
import TableFilter from "@/components/TableFilter";
import CreateWorkModal from "@/components/CreateWorkModal";
import { createClient } from "@/utils/supabase/client";

// Filter State Type
export interface FilterState {
  category_type: string;
  hinh_thuc: string;
  writing_rule: string;
  sort_date: string;
  status: string;
  limit: string;
}

const defaultFilters: FilterState = {
  category_type: "",
  hinh_thuc: "",
  writing_rule: "",
  sort_date: "newest",
  status: "",
  limit: "10",
};

export default function DongNgonPage() {
  const router = useRouter();
  // Local filter state - resets on page reload
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [user, setUser] = useState<any>(null);
  const [allWorks, setAllWorks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorks = async (supabaseClient?: any) => {
    setIsLoading(true);
    const sb = supabaseClient || createClient();
    const { data, error } = await sb
      .from("works")
      .select("id, title, category_type, sub_category, limit_type, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
    }
    
    if (data) {
      const mappedWorks = data.map((work: any) => ({
        ...work,
        type: work.category_type, // "Thơ", "Văn xuôi"
        hinh_thuc: work.sub_category, // Access database column named 'sub_category'
        rule: work.limit_type === "sentence" ? "1 câu" : "1 kí tự",
        status: work.status === "writing" ? "Đang viết" : 
                work.status === "finished" ? "Hoàn thành" : 
                work.status === "pending" ? "Đợi duyệt" : work.status,
        date: new Date(work.created_at).toLocaleDateString("vi-VN"),
        rawDate: new Date(work.created_at)
      }));
      setAllWorks(mappedWorks);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch user session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    fetchWorks(supabase);

    // Subscribe to real-time changes
    const channel = supabase
      .channel("public:works")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "works",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newWork = payload.new;
            const mappedNewWork = {
              ...newWork,
              type: newWork.category_type,
              hinh_thuc: newWork.sub_category,
              rule: newWork.limit_type === "sentence" ? "1 câu" : "1 kí tự",
              status: newWork.status === "writing" ? "Đang viết" : 
                      newWork.status === "finished" ? "Hoàn thành" : 
                      newWork.status === "pending" ? "Đợi duyệt" : newWork.status,
              date: new Date(newWork.created_at).toLocaleDateString("vi-VN"),
              rawDate: new Date(newWork.created_at)
            };
            setAllWorks((prev) => [mappedNewWork, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedWork = payload.new;
            const mappedUpdatedWork = {
              ...updatedWork,
              type: updatedWork.category_type,
              hinh_thuc: updatedWork.sub_category,
              rule: updatedWork.limit_type === "sentence" ? "1 câu" : "1 kí tự",
              status: updatedWork.status === "writing" ? "Đang viết" : 
                      updatedWork.status === "finished" ? "Hoàn thành" : 
                      updatedWork.status === "pending" ? "Đợi duyệt" : updatedWork.status,
              date: new Date(updatedWork.created_at).toLocaleDateString("vi-VN"),
              rawDate: new Date(updatedWork.created_at)
            };
            setAllWorks((prev) => 
              prev.map(w => w.id === updatedWork.id ? mappedUpdatedWork : w)
            );
          } else if (payload.eventType === "DELETE") {
            setAllWorks((prev) => prev.filter(w => w.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAuthAction = (action: () => void) => {
    if (!user) {
      router.push('/dang-ky');
    } else {
      action();
    }
  };

  // Filtered and Sorted Works
  const filteredWorks = useMemo(() => {
    let works = [...allWorks];

    // 1. Strict Filtering (AND Logic)
    works = works.filter((work) => {
      // Category
      if (filters.category_type) {
        const catMap: { [key: string]: string } = { "Poetry": "Thơ", "Prose": "Văn xuôi", "Novel": "Tiểu thuyết" };
        if (work.type !== catMap[filters.category_type]) return false;
      }

      // Hình thức (Internal name hinh_thuc)
      if (filters.hinh_thuc) {
        if (work.hinh_thuc !== filters.hinh_thuc) return false;
      }

      // Rule
      if (filters.writing_rule) {
        const ruleMap: { [key: string]: string } = { "OneChar": "1 kí tự", "OneSentence": "1 câu" };
        if (work.rule !== ruleMap[filters.writing_rule]) return false;
      }

      // Status
      if (filters.status) {
        const statusMap: { [key: string]: string } = { "In Progress": "Đang viết", "Completed": "Hoàn thành", "Paused": "Tạm dừng" };
        if (work.status !== statusMap[filters.status]) return false;
      }

      return true;
    });

    // 2. Sorting (Date only)
    works.sort((a, b) => {
      const timeA = a.rawDate?.getTime() || 0;
      const timeB = b.rawDate?.getTime() || 0;
      if (filters.sort_date === 'oldest') {
        return timeA - timeB;
      }
      return timeB - timeA;
    });

    // 3. Limit Logic
    const limit = parseInt(filters.limit) || 10;
    return works.slice(0, limit);
  }, [allWorks, filters]);

  // Handle Tag Click
  const handleTagClick = (type: 'category' | 'hinh_thuc' | 'rule' | 'status', value: string) => {
    // Mapping from display text to filter value
    const mappings: { [key: string]: { [key: string]: string } } = {
      category: { "Thơ": "Poetry", "Văn xuôi": "Prose", "Tiểu thuyết": "Novel" },
      hinh_thuc: { 
        "Thơ 4 chữ": "Thơ 4 chữ", 
        "Thơ 5 chữ": "Thơ 5 chữ",
        "Thơ 6 chữ": "Thơ 6 chữ",
        "Thơ 7 chữ": "Thơ 7 chữ",
        "Thơ 8 chữ": "Thơ 8 chữ",
        "Thơ tự do": "Thơ tự do",
        "Tùy bút": "Tùy bút",
        "Nhật ký": "Nhật ký",
        "Hồi ký": "Hồi ký",
        "Tản văn": "Tản văn"
      },
      rule: { "1 kí tự": "OneChar", "1 câu": "OneSentence" },
      status: { "Đang viết": "In Progress", "Hoàn thành": "Completed", "Tạm dừng": "Paused" }
    };

    const filterKeyMap: { [key: string]: keyof FilterState } = {
      category: "category_type",
      hinh_thuc: "hinh_thuc",
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
              {(filters.category_type || filters.hinh_thuc || filters.writing_rule || filters.status) && (
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
            {user && <CreateWorkModal onSuccess={() => fetchWorks()} />}
          </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredWorks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {filteredWorks.map((work) => (
                  <Link 
                    key={work.id} 
                    href={`/work/${work.id}`}
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
                        onClick={(e) => { e.preventDefault(); handleTagClick('hinh_thuc', work.hinh_thuc); }}
                        className="border border-black rounded-full px-3 py-2 text-center text-sm font-sans truncate hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        {work.hinh_thuc}
                      </span>
                      <span 
                        onClick={(e) => { e.preventDefault(); handleTagClick('rule', work.rule); }}
                        className="border border-black rounded-full px-3 py-2 text-center text-sm font-sans truncate hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        {work.rule}
                      </span>
                      <span 
                        onClick={(e) => { e.preventDefault(); handleTagClick('category', work.type); }}
                        className="border border-black rounded-full px-3 py-2 text-center text-sm font-sans truncate hover:bg-black hover:text-white transition-colors cursor-pointer"
                      >
                        {work.type}
                      </span>
                      <span 
                        onClick={(e) => { e.preventDefault(); handleTagClick('status', work.status); }}
                        className={`border rounded-full px-3 py-2 text-center text-sm font-sans truncate transition-colors cursor-pointer ${
                          work.status === "Hoàn thành" ? "bg-green-100 border-green-600 text-green-800 hover:bg-green-200" :
                          work.status === "Đang viết" ? "bg-blue-100 border-blue-600 text-blue-800 hover:bg-blue-200" :
                          "bg-yellow-100 border-yellow-600 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {work.status}
                      </span>
                    </div>

                  </Link>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                 {user ? (
                   <CreateWorkModal 
                    onSuccess={() => fetchWorks()}
                    customTrigger={
                     <button 
                      className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black hover:text-black hover:scale-110 transition-all duration-300 bg-white"
                      title="Tạo tác phẩm mới"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                     </button>
                   } />
                 ) : (
                   <button 
                    onClick={() => router.push('/dang-ky')}
                    className="w-24 h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black hover:text-black hover:scale-110 transition-all duration-300 bg-white"
                    title="Đăng ký để tạo tác phẩm"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                   </button>
                 )}
                 <p className="mt-6 text-xl font-sans text-gray-400 font-light">Chưa có tác phẩm nào.</p>
                 <p className="text-sm font-sans text-gray-400 mt-1">Hãy là người đầu tiên sáng tạo!</p>
              </div>
            )}
        </div>

      </main>


    </div>
  );
}
