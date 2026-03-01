import { create } from 'zustand';

interface UserState {
  user: any | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
