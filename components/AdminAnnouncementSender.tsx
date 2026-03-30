"use client";

import { useState } from "react";
import { createAdminAnnouncement, searchUserNicknames } from "@/actions/notification";
import { useDebouncedCallback } from "use-debounce";

export default function AdminAnnouncementSender() {
  const [message, setMessage] = useState("");
  const [targetNicknames, setTargetNicknames] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useDebouncedCallback(async (keyword: string) => {
    if (keyword.length < 2) {
      setShowSuggestions(false);
      return;
    }
    const res = await searchUserNicknames(keyword);
    if (res.success && res.data && res.data.length > 0) {
      setSuggestions(res.data);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, 300);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTargetNicknames(val);
    const parts = val.split(",");
    const currentPart = parts[parts.length - 1].trim();
    fetchSuggestions(currentPart);
  };

  const handleSelectSuggestion = (nickname: string) => {
    const parts = targetNicknames.split(",");
    parts.pop(); // Remove the partial typo
    
    // Build the new string, properly trimming elements
    const newParts = parts.map(p => p.trim()).filter(Boolean);
    newParts.push(nickname);
    
    setTargetNicknames(newParts.join(", ") + ", ");
    setShowSuggestions(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    setIsSending(true);
    setStatus(null);

    try {
      const result = await createAdminAnnouncement(trimmed, targetNicknames);
      if (result.success) {
        setStatus({ type: "success", text: `Đã gửi thông báo đến ${result.count} người dùng!` });
        setMessage("");
        setTargetNicknames("");
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
      <p className="text-xs text-slate-400 mb-4">Gửi thông báo đến một nhóm người dùng (hoặc <strong>bỏ trống</strong> để gửi toàn bộ hệ thống).</p>

      <form onSubmit={handleSend} className="space-y-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={targetNicknames}
            onChange={handleTargetChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Nhập nickname (các tài khoản ngăn cách bởi dấu phẩy)..."
            className="w-full py-3 pr-3 pl-11 rounded-xl border-2 border-slate-200 focus:border-black focus:outline-none text-sm transition-colors mb-2"
            disabled={isSending}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 mt-[-8px] rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <li
                  key={`${s}-${idx}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(s);
                  }}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-b-0 border-slate-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
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
