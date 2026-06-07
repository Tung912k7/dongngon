"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function AccountTab({ userEmail }: { userEmail: string }) {
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });

    if (error) {
      toast.error("Không thể gửi email: " + error.message);
    } else {
      toast.success("Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 font-be-vietnam">
      <div className="space-y-4">
        <h3 className="font-ganh text-2xl md:text-3xl tracking-tight font-bold text-deep-teal lowercase">
          bảo mật tài khoản
        </h3>
        <p className="text-[11px] text-ink-charcoal/50 font-medium tracking-wide leading-relaxed">
          Quản lý mật khẩu và các thiết lập an toàn cho tài khoản của bạn.
        </p>
      </div>

      <div className="p-8 md:p-10 border border-[#eae6e1] rounded-2xl bg-white space-y-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-1.5 h-1.5 bg-[#134e4a] rounded-full" />
          <h4 className="font-ganh text-lg font-bold text-[#1c1b1a] lowercase">mật khẩu</h4>
        </div>
        <p className="text-[11px] text-ink-charcoal/50 font-medium tracking-wide leading-relaxed max-w-lg">
          Để đảm bảo an toàn, chúng mình khuyên bạn nên sử dụng mật khẩu mạnh (trên 12 ký tự) và duy
          nhất cho tài khoản này.
        </p>

        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className="px-6 py-3 bg-[#134e4a] hover:bg-[#003633] text-white font-bold uppercase tracking-wider text-[10px] rounded-full transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? "Đang xử lý..." : "Gửi email đổi mật khẩu ngay"}
        </button>
      </div>

      <div className="p-8 md:p-10 border border-red-200 rounded-2xl bg-red-50/10 space-y-6 relative overflow-hidden group shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <h4 className="font-ganh text-2xl tracking-tight text-red-650 font-bold lowercase">
            vùng nguy hiểm
          </h4>
        </div>
        <p className="text-[11px] text-red-500/80 font-medium leading-relaxed max-w-md">
          Việc xóa tài khoản là{" "}
          <span className="text-red-700 underline underline-offset-4 decoration-1 font-bold">
            hành động vĩnh viễn
          </span>
          . Tất cả tác phẩm, đóng góp và thông tin của bạn sẽ bị xóa khỏi hệ thống.
        </p>
        <button className="px-6 py-3 bg-white border border-red-200 text-red-650 hover:bg-red-650 hover:text-white font-bold uppercase tracking-wider text-[10px] rounded-full transition-all shadow-sm">
          Xác nhận xóa tài khoản
        </button>
      </div>
    </div>
  );
}
