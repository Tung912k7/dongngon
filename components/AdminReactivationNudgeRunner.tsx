"use client";

import { useState } from "react";
import { runReactivationNudgesNow } from "@/actions/notification";

type ActionStatus =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

export default function AdminReactivationNudgeRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<ActionStatus>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setStatus(null);

    try {
      const result = await runReactivationNudgesNow();

      if (result.success) {
        setStatus({
          type: "success",
          text: `Đã đưa ${result.queuedCount ?? 0} thông báo nhắc quay lại vào hàng đợi.`,
        });
      } else {
        setStatus({
          type: "error",
          text: result.error || "Không thể chạy reactivation nudge.",
        });
      }
    } catch {
      setStatus({ type: "error", text: "Có lỗi xảy ra." });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Chạy Reactivation Nudge</h2>
      <p className="text-xs text-slate-400 mb-4">
        Kích hoạt thủ công enqueue_reactivation_nudges để nhắc người dùng quay lại.
      </p>

      <button
        type="button"
        onClick={handleRun}
        disabled={isRunning}
        className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isRunning ? "Đang chạy..." : "Chạy ngay"}
      </button>

      {status && (
        <div
          className={`mt-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}
