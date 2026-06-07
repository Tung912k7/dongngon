"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Work } from "@/stores/work-store";
import WorkLibraryItem from "./WorkLibraryItem";
import CreateWorkModal from "./CreateWorkModal";
import { LinkedButton } from "./PrimaryButton";

interface ProfileWorksSectionProps {
  createdWorks: Work[];
  contributedWorksList: Work[];
  savedWorksList: Work[];
  isOwner: boolean;
}

type TabId = "created" | "contributed" | "saved";

export default function ProfileWorksSection({
  createdWorks,
  contributedWorksList,
  savedWorksList,
  isOwner,
}: ProfileWorksSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("created");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const tabs = useMemo(() => {
    const list: { id: TabId; label: string; count: number }[] = [
      { id: "created", label: "tác phẩm đã tạo", count: createdWorks.length },
      { id: "contributed", label: "đóng góp của tôi", count: contributedWorksList.length },
    ];
    if (isOwner) {
      list.push({ id: "saved", label: "tác phẩm đã lưu", count: savedWorksList.length });
    }
    return list;
  }, [createdWorks.length, contributedWorksList.length, savedWorksList.length, isOwner]);

  const activeTabTotalCount = useMemo(() => {
    if (activeTab === "created") return createdWorks.length;
    if (activeTab === "contributed") return contributedWorksList.length;
    return savedWorksList.length;
  }, [activeTab, createdWorks.length, contributedWorksList.length, savedWorksList.length]);

  const filteredWorks = useMemo(() => {
    let list: Work[] = [];
    if (activeTab === "created") list = createdWorks;
    else if (activeTab === "contributed") list = contributedWorksList;
    else if (activeTab === "saved") list = savedWorksList;

    return list.filter((work) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (work.author_nickname || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || work.type === selectedCategory;
      const matchesStatus = !selectedStatus || work.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [
    activeTab,
    createdWorks,
    contributedWorksList,
    savedWorksList,
    searchQuery,
    selectedCategory,
    selectedStatus,
  ]);

  const categories = [
    { label: "tất cả", value: "" },
    { label: "thơ", value: "Thơ" },
    { label: "văn xuôi", value: "Văn xuôi" },
  ];

  const statuses = [
    { label: "tất cả", value: "" },
    { label: "đang viết", value: "Đang viết" },
    { label: "hoàn thành", value: "Hoàn thành" },
    { label: "đợi duyệt", value: "Đợi duyệt" },
  ];

  // Reset local filters when changing tabs
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStatus("");
  };

  return (
    <div className="w-full font-be-vietnam">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-[#eae6e1] pb-2 mb-8 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-ganh font-bold transition-all relative flex items-center shrink-0 cursor-pointer lowercase tracking-tight focus:outline-none ${
                isActive ? "text-deep-teal" : "text-ink-charcoal/60 hover:text-ink-charcoal"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-1.5 px-2 py-0.5 text-[9px] rounded-full border font-be-vietnam font-semibold transition-all ${
                  isActive
                    ? "bg-[#134e4a]/10 border-[#134e4a]/20 text-deep-teal"
                    : "bg-[#faf8f5] border-[#eae6e1] text-ink-charcoal/40"
                }`}
              >
                {tab.count}
              </span>
              {isActive && (
                <m.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-deep-teal z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar / Filters (Only visible if the active tab is not empty) */}
      {activeTabTotalCount > 0 && (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-[#fcfaf8] border border-[#eae6e1] rounded-2xl p-4 mb-8 shadow-sm transition-all duration-300">
          {/* Search Box */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tác phẩm..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-[#eae6e1] bg-white rounded-full focus:outline-none focus:ring-1 focus:ring-deep-teal focus:border-deep-teal text-ink-charcoal placeholder-ink-charcoal/30 transition-all shadow-sm"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-charcoal/30 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z"
                />
              </svg>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-6 justify-start lg:justify-end text-xs">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-charcoal/40">
                thể loại:
              </span>
              <div className="flex gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer lowercase ${
                      selectedCategory === cat.value
                        ? "bg-[#134e4a]/10 border-[#134e4a]/30 text-deep-teal"
                        : "bg-white border-[#eae6e1] text-ink-charcoal/60 hover:bg-[#faf8f5] hover:border-deep-teal/20"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-charcoal/40">
                trạng thái:
              </span>
              <div className="flex gap-1.5">
                {statuses.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => setSelectedStatus(st.value)}
                    className={`px-3 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer lowercase ${
                      selectedStatus === st.value
                        ? "bg-[#134e4a]/10 border-[#134e4a]/30 text-deep-teal"
                        : "bg-white border-[#eae6e1] text-ink-charcoal/60 hover:bg-[#faf8f5] hover:border-deep-teal/20"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Works List Container */}
      <div className="bg-[#fcfaf8] border border-[#eae6e1] rounded-2xl p-6 md:p-10 shadow-sm mb-8 transition-all duration-300">
        <div className="flex justify-between items-end mb-8 border-b border-[#eae6e1] pb-4">
          <h2 className="text-2xl md:text-3xl font-ganh font-bold tracking-tight text-nowrap text-deep-teal lowercase">
            {activeTab === "created"
              ? "tác phẩm đã tạo"
              : activeTab === "contributed"
                ? "đóng góp của tôi"
                : "tác phẩm đã lưu"}
          </h2>
          {activeTab === "created" && isOwner && createdWorks.length > 0 && <CreateWorkModal />}
          {activeTab === "contributed" && isOwner && contributedWorksList.length > 0 && (
            <LinkedButton
              href="/kho-tang"
              className="!rounded-full !px-5 !py-2.5 !text-[10px] !uppercase !tracking-widest shadow-sm border border-[#eae6e1] bg-white text-ink-charcoal hover:bg-[#faf8f5] hover:border-deep-teal/20 transition-all font-bold"
            >
              đóng góp thêm
            </LinkedButton>
          )}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <m.div
              key={`${activeTab}-${searchQuery}-${selectedCategory}-${selectedStatus}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {filteredWorks.length > 0 ? (
                filteredWorks.map((work) => (
                  <WorkLibraryItem
                    key={work.id}
                    work={work}
                    isOwner={activeTab === "created" && isOwner}
                    initialSaved={activeTab === "saved"}
                  />
                ))
              ) : (
                /* Empty States */
                <div className="w-full py-16 border border-dashed border-[#eae6e1] rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-6 bg-[#faf8f5]/40 transition-all duration-300">
                  <div className="w-12 h-12 border border-dashed border-[#eae6e1] rounded-xl flex items-center justify-center bg-white shadow-sm transition-transform duration-300 hover:scale-105">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 opacity-30"
                    >
                      {activeTab === "created" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      ) : activeTab === "contributed" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      )}
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-black/40 lowercase mt-2">
                    {searchQuery || selectedCategory || selectedStatus
                      ? "không tìm thấy tác phẩm phù hợp với bộ lọc"
                      : activeTab === "created"
                        ? isOwner
                          ? "bạn chưa tạo tác phẩm nào"
                          : "tác giả chưa có tác phẩm công khai nào"
                        : activeTab === "contributed"
                          ? isOwner
                            ? "bạn chưa đóng góp vào tác phẩm nào"
                            : "chưa có đóng góp công khai nào"
                          : "bạn chưa lưu tác phẩm nào"}
                  </p>
                  {/* Empty state action triggers */}
                  {!searchQuery && !selectedCategory && !selectedStatus && (
                    <>
                      {activeTab === "created" && isOwner && <CreateWorkModal />}
                      {activeTab === "contributed" && isOwner && (
                        <LinkedButton
                          href="/kho-tang"
                          className="!px-6 !py-3 !rounded-full !text-xs !lowercase !tracking-wider border border-[#eae6e1] bg-white text-black/80 hover:bg-black/5 active:scale-[0.98] transition-all font-ganh font-bold mt-4 cursor-pointer"
                        >
                          đóng góp ngay
                        </LinkedButton>
                      )}
                    </>
                  )}
                </div>
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
