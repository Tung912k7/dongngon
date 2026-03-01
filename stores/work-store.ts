import { create } from 'zustand';
import { FilterState } from '@/app/kho-tang/types';

export interface Work {
  id: string;
  title: string;
  category_type?: string;
  sub_category?: string;
  limit_type?: string;
  status: string;
  created_at?: string;
  author_nickname: string;
  privacy?: string;
  created_by?: string;
  age_rating?: string;
  license?: string;
  // Mapped fields for UI
  type: string;
  hinh_thuc: string;
  rule: string;
  date: string;
  rawDate: Date;
  is_author_private?: boolean;
}

interface WorkState {
  allWorks: Work[];
  filters: FilterState;
  currentPage: number;
  isLoading: boolean;
  setAllWorks: (works: Work[]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setCurrentPage: (page: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  category_type: "",
  hinh_thuc: "",
  writing_rule: "",
  sort_date: "newest",
  status: "",
  limit: "10",
};

export const useWorkStore = create<WorkState>((set) => ({
  allWorks: [],
  filters: defaultFilters,
  currentPage: 1,
  isLoading: false,
  setAllWorks: (works) => set({ allWorks: works }),
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      currentPage: 1 // Reset to page 1 on filter changes
    })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (isLoading) => set({ isLoading }),
  resetFilters: () => set({ filters: defaultFilters, currentPage: 1 }),
}));
