"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { User } from "@supabase/supabase-js";
import { Work } from "@/stores/work-store";
import dynamic from "next/dynamic";
const TableFilter = dynamic(() => import("@/components/TableFilter"), { ssr: false });
const CreateWorkModal = dynamic(() => import("@/components/CreateWorkModal"), { ssr: false });
import { createClient } from "@/utils/supabase/client";
import { FilterState } from "../app/kho-tang/types";
import Pagination from "@/components/Pagination";
import WorkCard from "@/components/WorkCard";
const WorkPreviewModal = dynamic(() => import("@/components/WorkPreviewModal"), { ssr: false });
const EditWorkModal = dynamic(() => import("@/components/EditWorkModal"), { ssr: false });
import { useState } from "react";

const defaultFilters: FilterState = {
  category_type: "",
  hinh_thuc: "",
  writing_rule: "",
  sort_date: "newest",
  status: "",
  limit: "10",
};

// Removed redundant AuthUser type definition

export default function DongNgonClient({
  initialWorks,
  initialUser,
  totalCount,
  totalPages,
  currentPage,
  initialSavedWorkIds = [],
}: {
  initialWorks: Work[];
  initialUser: User | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  initialSavedWorkIds?: string[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const shouldCreate = searchParams.get("create") === "true";

  // Modal states
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [workInitialSaved, setWorkInitialSaved] = useState(false);

  // Zustand stores
  const user = useUserStore((state) => state.user);

  // Read filters from URL (server is the source of truth)
  const filters: FilterState = useMemo(
    () => ({
      category_type: searchParams.get("category") || "",
      hinh_thuc: searchParams.get("form") || "",
      writing_rule: searchParams.get("rule") || "",
      sort_date: searchParams.get("sort") || "newest",
      status: searchParams.get("status") || "",
      limit: searchParams.get("limit") || "10",
    }),
    [searchParams]
  );

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

  // Navigate with filters — triggers server re-fetch via URL change
  const navigateWithFilters = useCallback(
    (newFilters: Partial<FilterState>, newPage?: number, newQuery?: string) => {
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
    },
    [filters, q, router]
  );

  const handleApplyFilters = useCallback(
    (newFilters: FilterState) => {
      navigateWithFilters(newFilters, 1);
    },
    [navigateWithFilters]
  );

  const handleResetFilters = useCallback(() => {
    navigateWithFilters(defaultFilters, 1, "");
  }, [navigateWithFilters]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      navigateWithFilters({}, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigateWithFilters]
  );

  const handleCreateSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  const handlePreviewWork = useCallback((work: Work, initialSaved: boolean) => {
    setSelectedWork(work);
    setWorkInitialSaved(initialSaved);
    setIsPreviewOpen(true);
  }, []);

  const handleEditWork = useCallback((work: Work) => {
    setSelectedWork(work);
    setIsEditOpen(true);
  }, []);

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
  const hasActiveFilters =
    filters.category_type || filters.hinh_thuc || filters.writing_rule || filters.status || q;

  return (
    <div className="min-h-screen text-black bg-[#FBFBFA]">
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 pt-16 md:pt-24 pb-12 flex flex-col items-center">
        <div className="w-full relative">
          {/* Editorial Header Section */}
          <div className="w-full mb-12 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-black" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                KHO TÀNG
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-ganh font-bold text-black leading-[1.1] tracking-tight lowercase">
              kho tàng tác phẩm
            </h1>
            <p className="font-be-vietnam text-sm md:text-base text-black/55 max-w-2xl mt-4 font-light leading-relaxed">
              Mỗi tác phẩm là một ngôi sao sáng trong vũ trụ rộng lớn và vô tận
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center py-4 border-y border-black/5 mb-12 gap-4 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <TableFilter filters={filters} onApplyFilters={handleApplyFilters} />
              <span className="font-bold uppercase tracking-wider text-xs">Bộ lọc</span>

              {q && (
                <div className="ml-2 flex items-center gap-1.5 px-3 py-1 bg-deep-teal/[0.04] border border-deep-teal/15 text-deep-teal text-xs font-semibold rounded-full">
                  <span>Tìm kiếm: &quot;{q}&quot;</span>
                  <button
                    onClick={() => navigateWithFilters({}, 1, "")}
                    className="hover:bg-deep-teal/10 p-0.5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                    title="Xóa tìm kiếm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-3 h-3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="ml-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-black/60 hover:text-black hover:underline transition-colors cursor-pointer"
                  title="Xóa tất cả bộ lọc"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Đặt lại
                </button>
              )}
            </div>

            {/* Total count indicator */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 bg-black/[0.03] px-3 py-1.5 rounded-[4px] border border-black/5 hidden sm:block">
                {totalCount} tác phẩm
              </span>
              {user ? (
                <CreateWorkModal
                  onSuccess={handleCreateSuccess}
                  defaultOpen={shouldCreate}
                  customTrigger={
                    <button
                      className="px-4 py-2.5 bg-black text-white hover:bg-black/85 text-[10px] font-bold uppercase tracking-widest rounded-[6px] flex items-center gap-2 transition-all cursor-pointer"
                      title="Tạo tác phẩm mới"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Tạo tác phẩm
                    </button>
                  }
                />
              ) : (
                <button
                  onClick={() => router.push("/dang-nhap")}
                  className="px-4 py-2.5 bg-black text-white hover:bg-black/85 text-[10px] font-bold uppercase tracking-widest rounded-[6px] flex items-center gap-2 transition-all cursor-pointer"
                  title="Đăng ký hoặc Đăng nhập"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tạo tác phẩm
                </button>
              )}
            </div>
          </div>

          {initialWorks.length > 0 ? (
            <div className="flex flex-col gap-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Dotted border card for creating a new work */}
                {user ? (
                  <CreateWorkModal
                    onSuccess={handleCreateSuccess}
                    customTrigger={
                      <button className="w-full min-h-[300px] border border-dashed border-black/15 hover:border-black/35 bg-[#FBFBFA]/40 hover:bg-[#FBFBFA]/85 rounded-[12px] flex flex-col justify-center items-center p-8 text-center cursor-pointer transition-all duration-300 group">
                        <div className="mb-4 text-black/30 group-hover:text-black transition-colors">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                        <span className="font-ganh font-bold text-lg text-black block mb-2">
                          Tạo tác phẩm mới
                        </span>
                        <span className="font-be-vietnam text-xs text-black/55 max-w-[200px] leading-relaxed">
                          Làm người tiên phong, dẫn dắt nhịp độ của các tác phẩm
                        </span>
                      </button>
                    }
                  />
                ) : (
                  <button
                    onClick={() => router.push("/dang-nhap")}
                    className="w-full min-h-[300px] border border-dashed border-black/15 hover:border-black/35 bg-[#FBFBFA]/40 hover:bg-[#FBFBFA]/85 rounded-[12px] flex flex-col justify-center items-center p-8 text-center cursor-pointer transition-all duration-300 group"
                  >
                    <div className="mb-4 text-black/30 group-hover:text-black transition-colors">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <span className="font-ganh font-bold text-lg text-black block mb-2">
                      Tạo tác phẩm mới
                    </span>
                    <span className="font-be-vietnam text-xs text-black/55 max-w-[200px] leading-relaxed">
                      Làm người tiên phong, dẫn dắt nhịp độ của các tác phẩm
                    </span>
                  </button>
                )}

                {initialWorks.map((work, index) => (
                  <WorkCard
                    key={work.id}
                    work={work}
                    isOwner={!!user && work.created_by === user.id}
                    hideMenu={true}
                    layout="grid"
                    initialSaved={initialSavedWorkIds.includes(work.id.toString())}
                    onPreview={handlePreviewWork}
                    onEdit={handleEditWork}
                    index={index}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 animate-fade-in w-full">
              {user ? (
                <CreateWorkModal
                  onSuccess={handleCreateSuccess}
                  customTrigger={
                    <button
                      className="min-h-[200px] w-full max-w-md border border-dashed border-black/15 hover:border-black/35 bg-[#FBFBFA]/40 hover:bg-[#FBFBFA]/85 rounded-[12px] flex flex-col justify-center items-center p-8 text-center cursor-pointer transition-all duration-300 group"
                      title="Tạo tác phẩm mới"
                    >
                      <div className="mb-4 text-black/30 group-hover:text-black transition-colors">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                      <span className="font-ganh font-bold text-lg text-black block mb-2">
                        Chưa có tác phẩm nào
                      </span>
                      <span className="font-be-vietnam text-xs text-black/55 max-w-[240px] leading-relaxed">
                        Hãy làm người tiên phong!
                      </span>
                    </button>
                  }
                />
              ) : (
                <button
                  onClick={() => router.push("/dang-nhap")}
                  className="min-h-[200px] w-full max-w-md border border-dashed border-black/15 hover:border-black/35 bg-[#FBFBFA]/40 hover:bg-[#FBFBFA]/85 rounded-[12px] flex flex-col justify-center items-center p-8 text-center cursor-pointer transition-all duration-300 group"
                  title="Đăng nhập để tạo tác phẩm"
                >
                  <div className="mb-4 text-black/30 group-hover:text-black transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <span className="font-ganh font-bold text-lg text-black block mb-2">
                    Chưa có tác phẩm nào
                  </span>
                  <span className="font-be-vietnam text-xs text-black/55 max-w-[240px] leading-relaxed">
                    Đăng nhập hoặc đăng ký để tạo câu chuyện mới tại đây.
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Shared Modals */}
      {selectedWork && (
        <>
          <WorkPreviewModal
            work={selectedWork}
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            isOwner={!!user && selectedWork.created_by === user.id}
            initialSaved={workInitialSaved}
          />
          <EditWorkModal
            work={selectedWork}
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
          />
        </>
      )}
    </div>
  );
}
