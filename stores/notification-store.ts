import { create } from "zustand";
import { getNotifications } from "@/actions/notification";
import type { Notification } from "@/types/database";

interface NotificationState {
  unreadCount: number;
  isFetching: boolean;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  isFetching: false,
  setUnreadCount: (count) => set({ unreadCount: count }),
  fetchUnreadCount: async () => {
    if (get().isFetching) return;

    set({ isFetching: true });
    try {
      const result = await getNotifications();
      if (result.success && result.notifications) {
        const count = result.notifications.filter((n: Notification) => !n.is_read).length;
        set({ unreadCount: count });
      }
    } catch (error) {
      console.error("[Notification Store] Fetch error:", error);
    } finally {
      set({ isFetching: false });
    }
  },
}));
