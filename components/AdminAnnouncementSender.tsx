"use client";

import { useState } from "react";
import { createAdminAnnouncement } from "@/actions/notification";

export default function AdminAnnouncementSender() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setIsSending(true);
    setStatus(null);

    try {
      const result = await createAdminAnnouncement(trimmed);
      if (result.success) {
        setStatus({ type: "success", text: "Đã gửi thông báo đến tất cả người dùng!" });
        setMessage("");
      } else {
        setStatus({ type: "error", text: result.error || "Không thể gửi thông báo." });
      }
    } catch {
      setStatus({ type: "error", text: "Có lỗi xảy ra." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Gửi thông báo</h2>
      <p className="text-xs text-slate-400 mb-4">Gửi thông báo đến tất cả người dùng (vd: cập nhật tính năng mới)</p>

      <form onSubmit={handleSend} className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập nội dung thông báo..."
          maxLength={500}
          rows={3}
          className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-black focus:outline-none resize-none text-sm transition-colors"
          disabled={isSending}
        />

        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400">{message.length}/500</span>
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? "Đang gửi..." : "Gửi thông báo"}
          </button>
        </div>
      </form>

      {status && (
        <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {status.text}
        </div>
      )}
    </div>
  );
}
