"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  deleteNotifications,
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "@/actions/notification";
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
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const [result] = await Promise.all([
        getNotifications(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        const unread = result.notifications.filter((n) => !n.is_read).length;
        useNotificationStore.getState().setUnreadCount(unread);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    if (isEditing) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(notif.id)) next.delete(notif.id);
        else next.add(notif.id);
        return next;
      });
      return;
    }

    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      await markAsRead(notif.id);
      fetchUnreadCount();
    }

    if (notif.work_id) {
      router.push(`/work/${notif.work_id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllAsRead();
    fetchUnreadCount();
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    const result = await deleteNotifications(Array.from(selectedIds));
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
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
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 max-w-4xl py-12 animate-fade-in min-h-[60vh] flex flex-col font-be-vietnam">
      {/* Title */}
      <div className="mb-14 text-center">
        <h1 className="text-5xl font-ganh font-bold text-deep-teal tracking-tight mb-3 lowercase">
          thông báo
        </h1>
        <div className="w-12 h-[1px] bg-[#eae6e1] mx-auto"></div>
        <p className="text-ink-charcoal/50 mt-6 font-medium tracking-wide text-xs">
          Tất cả hoạt động và thông báo liên quan đến bạn
        </p>
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 border border-[#eae6e1] bg-white rounded-full font-bold uppercase tracking-wider text-[10px] transition-all hover:bg-[#faf8f5] hover:border-deep-teal/20 cursor-pointer text-ink-charcoal"
              >
                {selectedIds.size === notifications.length ? "Bỏ chọn tất" : "Chọn tất cả"}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0 || isDeleting}
                className="text-white bg-red-650 disabled:opacity-50 px-5 py-2 border border-red-650/10 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all hover:bg-red-700 cursor-pointer"
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
              className="text-[#faf8f5] bg-[#134e4a] border border-[#134e4a] px-5 py-2 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all hover:bg-[#003633] cursor-pointer"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              disabled={notifications.length === 0}
              title="Xoá thông báo"
              className="p-2.5 border border-[#eae6e1] bg-white rounded-full transition-all hover:bg-red-50/50 hover:text-red-650 hover:border-red-200 disabled:opacity-50 text-ink-charcoal/80 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          )}

          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedIds(new Set());
              }}
              className="px-5 py-2 text-[#faf8f5] bg-[#134e4a] border border-[#134e4a] rounded-full font-bold uppercase tracking-wider text-[10px] transition-all hover:bg-[#003633] cursor-pointer"
            >
              Xong
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#fcfaf8] border border-[#eae6e1] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="divide-y divide-[#eae6e1]/60 flex flex-col animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                  {/* Icon/Avatar Placeholder */}
                  <div className="w-8 h-8 rounded-md bg-black/10 flex-shrink-0" />
                  {/* Content Placeholder */}
                  <div className="flex-grow space-y-2">
                    <div className="h-3.5 w-3/4 bg-black/10 rounded-sm" />
                    <div className="h-3 w-1/2 bg-black/10 rounded-sm" />
                  </div>
                </div>
                {/* Time Placeholder */}
                <div className="h-3 w-16 bg-black/10 rounded-sm flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-ink-charcoal/40">
            <svg
              className="w-16 h-16 mx-auto mb-4 stroke-[#eae6e1]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <p className="font-bold uppercase tracking-widest text-xs">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-[#eae6e1]/60 flex flex-col">
            {notifications.map((notif) => {
              const isReport = notif.content.startsWith("Báo cáo vi phạm từ [");

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-6 cursor-pointer hover:bg-[#faf8f5] transition-colors flex gap-4 sm:gap-6 sm:items-center items-start group ${!notif.is_read ? "bg-[#134e4a]/[0.02]" : ""}`}
                >
                  {/* Checkbox (Editing Mode) */}
                  {isEditing && (
                    <div className="flex-shrink-0 flex items-center justify-center pt-2 sm:pt-0">
                      <div
                        className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${selectedIds.has(notif.id) ? "bg-[#134e4a] border-[#134e4a] text-white" : "border-[#eae6e1] bg-white group-hover:border-[#134e4a]/30"}`}
                      >
                        {selectedIds.has(notif.id) && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Icon Marker */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${!notif.is_read ? "border-[#134e4a]/20 bg-[#134e4a]/5 text-deep-teal" : "border-[#eae6e1] bg-[#faf8f5] text-ink-charcoal/40"}`}
                  >
                    {notif.type === "announcement" ? (
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    ) : notif.type === "contribution" ? (
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p
                      className={`text-base transition-colors ${!notif.is_read ? "font-semibold text-[#1c1b1a]" : "text-ink-charcoal/75"}`}
                    >
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
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
                            );
                            markAsRead(notif.id);
                            fetchUnreadCount();
                          }
                        }}
                        className="mt-1 text-xs font-bold text-deep-teal hover:text-[#003633] underline lowercase tracking-wider font-ganh disabled:opacity-50 disabled:no-underline cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                    )}

                    <p className="text-[10px] text-ink-charcoal/40 mt-2 font-medium tracking-wide">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>

                  {/* Actions / Status */}
                  <div className="flex-shrink-0 flex sm:flex-col items-center justify-center gap-2">
                    {!notif.is_read ? (
                      <div className="w-1.5 h-1.5 bg-red-650 rounded-full" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-transparent rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
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
