"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { Work } from "@/stores/work-store";
import dynamic from "next/dynamic";
const TableFilter = dynamic(() => import("@/components/TableFilter"), { ssr: false });
const CreateWorkModal = dynamic(() => import("@/components/CreateWorkModal"), { ssr: false });
import { createClient } from "@/utils/supabase/client";
import { FilterState } from "../app/kho-tang/types";
import Pagination from "@/components/Pagination";
import { WorkGridSkeleton } from "@/components/WorkCardSkeleton";
import WorkCard from "@/components/WorkCard";

const defaultFilters: FilterState = {
  category_type: "",
  hinh_thuc: "",
  writing_rule: "",
  sort_date: "newest",
  status: "",
  limit: "10",
};

type AuthUser = {
  id: string;
};

export default function DongNgonClient({
  initialWorks,
  initialUser,
  totalCount,
  totalPages,
  currentPage,
}: {
  initialWorks: Work[];
  initialUser: AuthUser | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Zustand stores
  const { user, setUser } = useUserStore();

  // Read filters from URL (server is the source of truth)
  const filters: FilterState = useMemo(() => ({
    category_type: searchParams.get("category") || "",
    hinh_thuc: searchParams.get("form") || "",
    writing_rule: searchParams.get("rule") || "",
    sort_date: searchParams.get("sort") || "newest",
    status: searchParams.get("status") || "",
    limit: searchParams.get("limit") || "10",
  }), [searchParams]);

  const q = searchParams.get("query") || "";

  // Initialize user store from server-provided data
  const isHydrated = useRef(false);
  useEffect(() => {
    if (isHydrated.current) return;
    if (initialUser && !user) {
      useUserStore.setState({ user: initialUser });
    }
    isHydrated.current = true;
  }, [initialUser, user]);

  // Keep user synced with auth state changes (login/logout)
  useEffect(() => {
    const syncUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && !user) {
        setUser(currentUser);
      }
    };
    syncUser();
  }, [user, setUser, supabase]);

  // Navigate with filters — triggers server re-fetch via URL change
  const navigateWithFilters = useCallback((
    newFilters: Partial<FilterState>,
    newPage?: number,
    newQuery?: string,
  ) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();

    if (merged.category_type) params.set("category", merged.category_type);
    if (merged.hinh_thuc) params.set("form", merged.hinh_thuc);
    if (merged.writing_rule) params.set("rule", merged.writing_rule);
    if (merged.sort_date !== "newest") params.set("sort", merged.sort_date);
    if (merged.status) params.set("status", merged.status);
    if (merged.limit !== "10") params.set("limit", merged.limit);

    const page = newPage ?? 1;
    if (page > 1) params.set("page", page.toString());

    const query = newQuery ?? q;
    if (query) params.set("query", query);

    const queryString = params.toString();
    router.push(`/kho-tang${queryString ? `?${queryString}` : ""}`);
  }, [filters, q, router]);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    navigateWithFilters(newFilters, 1);
  }, [navigateWithFilters]);

  const handleResetFilters = useCallback(() => {
    navigateWithFilters(defaultFilters, 1, "");
  }, [navigateWithFilters]);

  const handlePageChange = useCallback((newPage: number) => {
    navigateWithFilters({}, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigateWithFilters]);

  const handleCreateSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  // Realtime subscription — refresh page data on changes
  useEffect(() => {
    const channel = supabase
      .channel("public:works")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "works",
        },
        () => {
          // On any INSERT, UPDATE, or DELETE → let the server refetch
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  // Determine if any filters are active
  const hasActiveFilters = filters.category_type || filters.hinh_thuc ||
    filters.writing_rule || filters.status;

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col items-center">
        <div className="w-full max-w-6xl relative">

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <TableFilter
                filters={filters}
                onApplyFilters={handleApplyFilters}
              />
              <span className="font-bold uppercase tracking-wider text-sm">Bộ lọc</span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
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

            {/* Total count indicator */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 hidden sm:block">
                {totalCount} tác phẩm
              </span>
              {user ? (
                <CreateWorkModal onSuccess={handleCreateSuccess} />
              ) : (
                <button
                  onClick={() => router.push('/dang-nhap')}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 bg-white text-black hover:bg-literary-gold hover:text-white cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
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
          </div>

          {initialWorks.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialWorks.map((work) => (
                    <div key={work.id} className="flex justify-center sm:justify-start">
                        <WorkCard
                        work={work}
                        isOwner={!!user && work.created_by === user.id}
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
                    onSuccess={handleCreateSuccess}
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
