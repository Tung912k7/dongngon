"use client";

import React, { useState, createContext, useContext, useCallback, useMemo } from "react";
import { Contribution } from "@/types/database";
import ContributionSidebar from "./ContributionSidebar";
import InteractionPlaceholder from "./InteractionPlaceholder";
import { m, AnimatePresence } from "framer-motion";

interface FeedContribution extends Contribution {
  user_profile?: {
    pen_name?: string;
    hashtag?: string;
    custom_id?: string;
  };
}

interface ContributionSelectionContextType {
  selectedContribution: FeedContribution | null;
  selectedContributionId: string | undefined;
  onSelectContribution: (contribution: FeedContribution) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ContributionSelectionContext =
  createContext<ContributionSelectionContextType>({
    selectedContribution: null,
    selectedContributionId: undefined,
    onSelectContribution: () => {},
    isSidebarOpen: false,
    toggleSidebar: () => {},
  });

export function useContributionSelection() {
  return useContext(ContributionSelectionContext);
}

export default function WorkPageLayout({
  children,
  workId,
  initialSaved = false,
}: {
  children: React.ReactNode;
  workId?: string;
  initialSaved?: boolean;
}) {
  const [selectedContribution, setSelectedContribution] =
    useState<FeedContribution | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelectContribution = useCallback(
    (contribution: FeedContribution) => {
      setSelectedContribution(contribution);
    },
    []
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const contextValue = useMemo(() => ({
    selectedContribution,
    selectedContributionId: selectedContribution?.id,
    onSelectContribution: handleSelectContribution,
    isSidebarOpen,
    toggleSidebar,
  }), [selectedContribution, handleSelectContribution, isSidebarOpen, toggleSidebar]);

  return (
    <ContributionSelectionContext.Provider value={contextValue}>
      <div className="flex gap-0 max-w-7xl mx-auto px-4 lg:px-6 relative">
        {/* Left Sidebar - Animated */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <m.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`zen-hide flex-shrink-0 ${isAnimating || !isSidebarOpen ? "overflow-hidden" : "overflow-visible"}`}
            >
              <ContributionSidebar 
                selectedContribution={selectedContribution} 
                workId={workId}
                initialSaved={initialSaved}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* Middle Column - Feed */}
        <div className="flex-1 min-w-0 lg:border-x-2 lg:border-black lg:px-8 zen-no-border relative">
          {/* Sidebar Toggle Arrow - Desktop Only */}
          <button
            onClick={toggleSidebar}
            className="zen-hide hidden lg:flex absolute -left-4 top-32 w-8 h-8 bg-black text-white rounded-full items-center justify-center z-40 shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title={isSidebarOpen ? "Đóng bảng điều khiển" : "Mở bảng điều khiển"}
          >
            <m.svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-4 h-4"
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </m.svg>
          </button>

          {children}
        </div>

        {/* Right Sidebar */}
        <div className="zen-hide ml-6">
          <InteractionPlaceholder />
        </div>
      </div>
    </ContributionSelectionContext.Provider>
  );
}

