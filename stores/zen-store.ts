import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ZenState {
  isZenMode: boolean;
  toggleZenMode: () => void;
  setZenMode: (isZen: boolean) => void;
}

export const useZenStore = create<ZenState>()(
  persist(
    (set) => ({
      isZenMode: false,
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      setZenMode: (isZen: boolean) => set({ isZenMode: isZen }),
    }),
    {
      name: 'zen-storage',
    }
  )
);

