import { create } from 'zustand';

import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  nickname: string | null;
  role: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setNickname: (nickname: string | null) => void;
  setRole: (role: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  nickname: null,
  role: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setNickname: (nickname) => set({ nickname }),
  setRole: (role) => set({ role }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

