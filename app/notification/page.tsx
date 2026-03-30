"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getNotifications, markAsRead, markAllAsRead, deleteNotifications } from "@/actions/notification";
import type { Notification } from "@/types/database";
import { useNotificationStore } from "@/stores/notification-store";

import NotificationModal from "@/components/NotificationModal";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  
  // Bulk selection states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    if (isEditing) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(notif.id)) next.delete(notif.id);
        else next.add(notif.id);
        return next;
      });
      return;
    }

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

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    const result = await deleteNotifications(Array.from(selectedIds));
    if (result.success) {
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      setIsEditing(false);
      // Re-fetch unread count after deletion
      fetchUnreadCount();
    } else {
      alert("Đã xảy ra lỗi khi xoá thông báo.");
    }
    setIsDeleting(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
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

      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          {isEditing && (
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleSelectAll}
                className="px-4 py-2 border-2 border-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
              >
                {selectedIds.size === notifications.length ? "Bỏ chọn tất" : "Chọn tất cả"}
              </button>
              <button 
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0 || isDeleting}
                className="text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-2 border-2 border-red-600 rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
              >
                {isDeleting ? "Đang xoá..." : `Xoá (${selectedIds.size})`}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          {!isEditing && unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-white bg-black border-2 border-black hover:bg-gray-800 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}
          
          {!isEditing && (
             <button
                onClick={() => setIsEditing(true)}
                disabled={notifications.length === 0}
                title="Xoá thông báo"
                className="p-2 border-2 border-black rounded-full hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors disabled:opacity-50 text-gray-800"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
             </button>
          )}

          {isEditing && (
            <button 
              onClick={() => { setIsEditing(false); setSelectedIds(new Set()); }}
              className="px-6 py-2 text-white bg-black border-2 border-black hover:bg-gray-800 rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
            >
               Xong
            </button>
          )}
        </div>
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
            {notifications.map((notif) => {
              const isReport = notif.content.startsWith("Báo cáo vi phạm từ [");

              return (
              <div 
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-6 cursor-pointer hover:bg-gray-50/50 transition-colors flex gap-4 sm:gap-6 sm:items-center items-start group ${!notif.is_read ? 'bg-blue-50/20' : ''}`}
              >
                {/* Checkbox (Editing Mode) */}
                {isEditing && (
                  <div className="flex-shrink-0 flex items-center justify-center pt-2 sm:pt-0">
                    <div 
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.has(notif.id) ? 'bg-black border-black' : 'border-gray-300 bg-white'}`}
                    >
                      {selectedIds.has(notif.id) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </div>
                  </div>
                )}

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
                    {isReport ? "Báo cáo vi phạm từ cộng đồng" : notif.content}
                  </p>
                  
                  {isReport && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Disable detail view opening when doing bulk selection
                        if (isEditing) {
                           handleNotificationClick(notif);
                           return;
                        }
                        setSelectedReport(notif.content);
                        if (!notif.is_read) {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                          markAsRead(notif.id);
                          fetchUnreadCount();
                        }
                      }}
                      className="mt-1 text-sm font-bold text-blue-600 hover:text-blue-800 underline uppercase tracking-wider disabled:opacity-50 disabled:no-underline"
                    >
                      Xem chi tiết
                    </button>
                  )}

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
            )})}
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Chi tiết Báo cáo"
        message={selectedReport || ""}
        type="info"
      />
    </div>
  );
}
