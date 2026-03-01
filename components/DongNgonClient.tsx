"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { useWorkStore, Work } from "@/stores/work-store";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { sanitizeTitle, sanitizeNickname } from "@/utils/sanitizer";
import dynamic from "next/dynamic";
const TableFilter = dynamic(() => import("@/components/TableFilter"), { ssr: false });
const CreateWorkModal = dynamic(() => import("@/components/CreateWorkModal"), { ssr: false });
import { TagButton } from "@/components/TagButton";
import { createClient } from "@/utils/supabase/client";
import { FilterState } from "../app/kho-tang/types";
import Pagination from "@/components/Pagination";
import { WorkGridSkeleton } from "@/components/WorkCardSkeleton";
import { useVirtualizer } from "@tanstack/react-virtual";
import WorkCard from "@/components/WorkCard";

const defaultFilters: FilterState = {
  category_type: "",
  hinh_thuc: "",
  writing_rule: "",
  sort_date: "newest",
  status: "",
  limit: "10",
};

export default function DongNgonClient({ 
  initialWorks, 
  initialUser 
}: { 
  initialWorks: any[]; 
  initialUser: any;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Zustand stores
  const { 
    user, 
    setUser 
  } = useUserStore();
  
  const { 
    allWorks, 
    filters, 
    currentPage, 
    isLoading,
    setAllWorks,
    setFilters,
    setCurrentPage,
    setIsLoading 
  } = useWorkStore();
  
  // Unified initialization logic to prevent re-render loops
  const isHydrated = useRef(false);
  useEffect(() => {
    if (isHydrated.current) return;
    
    // 1. Hydrate Stores with a single direct set call to minimize notifies
    const updates: any = {};
    if (initialUser && !user) updates.user = initialUser;
    if (Object.keys(updates).length > 0) {
        useUserStore.setState(updates);
    }

    const workUpdates: any = {};
    if (initialWorks && allWorks.length === 0) workUpdates.allWorks = initialWorks;
    
    // Initial Filters from URL
    const urlFilters = {
      category_type: searchParams.get("category") || "",
      hinh_thuc: searchParams.get("form") || "",
      writing_rule: searchParams.get("rule") || "",
      sort_date: (searchParams.get("sort") as any) || "newest",
      status: searchParams.get("status") || "",
      limit: searchParams.get("limit") || "10",
    };
    workUpdates.filters = urlFilters;
    workUpdates.currentPage = parseInt(searchParams.get("page") || "1");

    useWorkStore.setState(workUpdates);
    
    isHydrated.current = true;
  }, []); 

  // Stable URL sync - only runs when filters/currentPage changes
  useEffect(() => {
    if (!isHydrated.current) return;
    
    const params = new URLSearchParams();
    if (filters.category_type) params.set("category", filters.category_type);
    if (filters.hinh_thuc) params.set("form", filters.hinh_thuc);
    if (filters.writing_rule) params.set("rule", filters.writing_rule);
    if (filters.sort_date !== "newest") params.set("sort", filters.sort_date);
    if (filters.status) params.set("status", filters.status);
    if (filters.limit !== "10") params.set("limit", filters.limit);
    if (currentPage > 1) params.set("page", currentPage.toString());
    
    const query = searchParams.get("query");
    if (query) params.set("query", query);

    const newPath = `/kho-tang${params.toString() ? `?${params.toString()}` : ""}`;
    if (window.location.search !== `?${params.toString()}` && params.toString() !== "") {
        window.history.replaceState(null, "", newPath);
    }
  }, [filters, currentPage, searchParams]);

  const fetchWorks = useCallback(async (supabaseClient?: any, searchQuery?: string) => {
    // We should not set loading if we are already loading or if it's the first mount hydration
    setIsLoading(true);
    const sb = supabaseClient || createClient();
    
    let query = sb
      .from("works")
      .select("id, title, category_type, sub_category, limit_type, status, created_at, author_nickname, privacy, created_by, age_rating")
      .order("created_at", { ascending: false });

    if (user) {
      query = query.or(`privacy.eq.Public,created_by.eq.${user.id}`);
    } else {
      query = query.eq("privacy", "Public");
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,author_nickname.ilike.%${searchQuery}%`);
    }

    try {
      const { data, error } = await query;
      if (error) {
        console.error("Supabase fetch error (details):", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        console.error("Supabase fetch error (stringified):", JSON.stringify(error));
      } else if (data) {
        const mappedWorks = data.map((work: any) => ({
          ...work,
          title: sanitizeTitle(work.title),
          author_nickname: sanitizeNickname(work.author_nickname),
          type: work.category_type,
          hinh_thuc: work.sub_category,
          rule: work.limit_type === "sentence" ? "1 câu" : "1 kí tự",
          age_rating: work.age_rating,
          status: work.status === "writing" ? "Đang viết" : 
                  work.status === "finished" ? "Hoàn thành" : 
                  work.status === "pending" ? "Đợi duyệt" : work.status,
          date: formatDate(work.created_at || new Date().toISOString()),
          rawDate: new Date(work.created_at || new Date().toISOString()),
          is_author_private: (Array.isArray(work.profiles) ? work.profiles[0]?.is_private : (work.profiles as any)?.is_private) || false
        }));
        setAllWorks(mappedWorks);
      }
    } catch (err) {
      console.error("Fetch implementation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, setAllWorks, setIsLoading]);

  const q = searchParams.get("query") || "";
  const isFirstMount = useRef(true);

  // Fetch works based on query or user change
  useEffect(() => {
    const supabase = createClient();
    if (!isFirstMount.current) {
        fetchWorks(supabase, q);
    }
  }, [q, fetchWorks]); 

  // Stable User Sync (Avoids triggering loop)
  useEffect(() => {
    const supabase = createClient();
    const syncUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && !user) {
        setUser(currentUser);
      }
    };
    syncUser();
    
    // Set first mount finished after potential hydration or first render
    if (isFirstMount.current) {
        isFirstMount.current = false;
    }
  }, [user, setUser]);

  // 2. Handle real-time subscription (Stable: no allWorks dependency)
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel("public:works")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "works",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newWork = payload.new;
            
            // Fetch author privacy status for new items to ensure popup works
            const fetchAndMap = async () => {
              const { data: authorData } = await supabase
                .from("profiles")
                .select("is_private")
                .eq("id", newWork.created_by)
                .single();

              const privacy = newWork.privacy?.toLowerCase();
              const isPublic = privacy === 'public';
              const isOwner = user && newWork.created_by === user.id;
              
              if (!isPublic && !isOwner) return;
              
              const mappedNewWork: Work = {
                ...newWork,
                id: newWork.id,
                title: sanitizeTitle(newWork.title),
                author_nickname: sanitizeNickname(newWork.author_nickname),
                type: newWork.category_type,
                hinh_thuc: newWork.sub_category,
                rule: newWork.limit_type === "sentence" ? "1 câu" : "1 kí tự",
                age_rating: newWork.age_rating,
                status: newWork.status === "writing" ? "Đang viết" : 
                        newWork.status === "finished" ? "Hoàn thành" : 
                        newWork.status === "pending" ? "Đợi duyệt" : newWork.status,
                date: formatDate(newWork.created_at),
                rawDate: new Date(newWork.created_at),
                is_author_private: authorData?.is_private || false
              };
              
              useWorkStore.setState((state) => ({
                allWorks: [mappedNewWork, ...state.allWorks]
              }));
            };

            fetchAndMap();
          } else if (payload.eventType === "UPDATE") {
            const updatedWork = payload.new;
            const mappedUpdatedWork: Work = {
              ...updatedWork,
              id: updatedWork.id,
              title: sanitizeTitle(updatedWork.title),
              author_nickname: sanitizeNickname(updatedWork.author_nickname),
              type: updatedWork.category_type,
              hinh_thuc: updatedWork.sub_category,
              rule: updatedWork.limit_type === "sentence" ? "1 câu" : "1 kí tự",
              age_rating: updatedWork.age_rating,
              status: updatedWork.status === "writing" ? "Đang viết" : 
                      updatedWork.status === "finished" ? "Hoàn thành" : 
                      updatedWork.status === "pending" ? "Đợi duyệt" : updatedWork.status,
              date: formatDate(updatedWork.created_at),
              rawDate: new Date(updatedWork.created_at)
            };

            useWorkStore.setState((state) => ({
              allWorks: state.allWorks.map(w => w.id === updatedWork.id ? mappedUpdatedWork : w)
            }));

          } else if (payload.eventType === "DELETE") {
            useWorkStore.setState((state) => ({
              allWorks: state.allWorks.filter(w => w.id !== payload.old.id)
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]); // Only depend on current user for privacy filtering rules

  const handleTagClick = useCallback((type: 'category' | 'hinh_thuc' | 'rule' | 'status', value: string) => {
    const filterKeyMap: { [key: string]: keyof FilterState } = {
      category: "category_type",
      hinh_thuc: "hinh_thuc",
      rule: "writing_rule",
      status: "status"
    };

    const filterKey = filterKeyMap[type];
    if (value) {
      setFilters({ [filterKey]: value });
    }
  }, [setFilters]);

  const { paginatedWorks, totalPages } = useMemo(() => {
    let works = [...allWorks];
    works = works.filter((work) => {
      if (filters.category_type) {
        if (work.type !== filters.category_type) return false;
      }
      if (filters.hinh_thuc) {
        if (work.hinh_thuc !== filters.hinh_thuc) return false;
      }
      if (filters.writing_rule) {
        if (work.rule !== filters.writing_rule) return false;
      }
      if (filters.status) {
        if (work.status !== filters.status) return false;
      }
      
      const privacy = work.privacy?.toLowerCase();
      const isPublic = privacy === 'public';
      const isOwner = user && work.created_by === user.id;
      return isPublic || isOwner;
    });

    works.sort((a, b) => {
      const timeA = new Date(a.rawDate || '').getTime();
      const timeB = new Date(b.rawDate || '').getTime();
      if (filters.sort_date === 'oldest') return timeA - timeB;
      return timeB - timeA;
    });

    const limit = parseInt(filters.limit) || 10;
    const totalItems = works.length;
    const totalPages = Math.ceil(totalItems / limit);
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const start = (safePage - 1) * limit;
    
    return {
      paginatedWorks: works.slice(start, start + limit),
      totalPages
    };
  }, [allWorks, filters, currentPage, user]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setCurrentPage]);

const parentRef = useRef<HTMLDivElement>(null);

  const columns = 3;
  const rows = useMemo(() => {
    const r = [];
    for (let i = 0; i < paginatedWorks.length; i += columns) {
      r.push(paginatedWorks.slice(i, i + columns));
    }
    return r;
  }, [paginatedWorks]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 380,
    overscan: 2,
  });

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col items-center">
        <div className="w-full max-w-6xl relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <TableFilter 
                filters={filters} 
                onApplyFilters={(newFilters: Partial<FilterState>) => {
                  setFilters(newFilters);
                  setCurrentPage(1);
                }} 
              />
              <span className="font-bold uppercase tracking-wider text-sm">Bộ lọc</span>
              {(filters.category_type || filters.hinh_thuc || filters.writing_rule || filters.status) && (
                <button 
                  onClick={() => {
                    setFilters(defaultFilters);
                    setCurrentPage(1);
                  }}
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
            {user ? (
              <CreateWorkModal onSuccess={() => fetchWorks(undefined, q)} />
            ) : (
              <button
                onClick={() => router.push('/dang-nhap')}
                className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 bg-white text-black hover:bg-black hover:text-white cursor-pointer"
                title="Tạo tác phẩm mới"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2.5" 
                  stroke="currentColor"
                  className="w-5 h-5 transition-colors"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-10">
              <WorkGridSkeleton count={filters.limit ? parseInt(filters.limit) : 6} />
            </div>
          ) : paginatedWorks.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedWorks.map((work) => (
                    <div key={work.id} className="flex justify-center sm:justify-start">
                        <WorkCard 
                        work={work} 
                        isOwner={user && work.created_by === user.id} 
                        hideMenu={true}
                        />
                    </div>
                ))}
              </div>

              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                 {user ? (
                   <CreateWorkModal 
                    onSuccess={() => fetchWorks(undefined, q)}
                    customTrigger={
                     <button className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all bg-white" title="Tạo tác phẩm mới">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 sm:w-12 sm:h-12">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                     </button>
                   } />
                 ) : (
                   <button onClick={() => router.push('/dang-ky')} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all bg-white" title="Đăng ký để tạo tác phẩm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 sm:w-12 sm:h-12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                   </button>
                 )}
                 <p className="mt-6 text-lg sm:text-xl text-gray-400 font-light text-center px-4">Chưa có tác phẩm nào.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
