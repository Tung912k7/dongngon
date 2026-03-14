"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification";
import type { Notification } from "@/types/database";
import { useNotificationStore } from "@/stores/notification-store";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const result = await getNotifications();
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        const unread = result.notifications.filter(n => !n.is_read).length;
        useNotificationStore.getState().setUnreadCount(unread);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      await markAsRead(notif.id);
      fetchUnreadCount();
    }
    
    if (notif.work_id) {
      router.push(`/work/${notif.work_id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllAsRead();
    fetchUnreadCount();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 max-w-4xl py-12 animate-fade-in min-h-[60vh] flex flex-col">
      {/* Title */}
      <div className="mb-14 text-center">
        <h1 className="text-5xl font-bold uppercase tracking-tight mb-3">THÔNG BÁO</h1>
        <div className="w-12 h-2.5 bg-black mx-auto"></div>
        <p className="text-gray-500 mt-6 font-bold uppercase tracking-widest text-xs">
          Tất cả hoạt động và thông báo liên quan đến bạn
        </p>
      </div>

      <div className="flex justify-end mb-4">
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-white bg-black hover:bg-gray-800 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      <div className="bg-white border-[3px] border-black rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest text-gray-400 text-sm">Đang tải...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 stroke-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <p className="font-bold uppercase tracking-widest">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-gray-100 flex flex-col">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-6 cursor-pointer hover:bg-gray-50/50 transition-colors flex gap-6 sm:items-center items-start group ${!notif.is_read ? 'bg-blue-50/20' : ''}`}
              >
                {/* Icon Marker */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-105 ${!notif.is_read ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'}`}>
                  {notif.type === 'announcement' ? (
                    <svg className={`w-6 h-6 ${!notif.is_read ? 'text-red-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  ) : notif.type === 'contribution' ? (
                    <svg className={`w-6 h-6 ${!notif.is_read ? 'text-black' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  ) : (
                    <svg className={`w-6 h-6 ${!notif.is_read ? 'text-blue-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`text-lg transition-colors ${!notif.is_read ? 'font-bold text-black' : 'text-gray-600'}`}>
                    {notif.content}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-2 uppercase tracking-widest font-bold">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                  </p>
                </div>

                {/* Actions / Status */}
                <div className="flex-shrink-0 flex sm:flex-col items-center justify-center gap-2">
                  {!notif.is_read ? (
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-3 h-3 bg-transparent rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
