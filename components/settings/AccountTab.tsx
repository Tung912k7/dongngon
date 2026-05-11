"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AccountTab({ userEmail }: { userEmail: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordReset = async () => {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    
    // Send password reset email to the user
    // Note: This usually requires a redirect URL to a password reset page.
    // For now we just trigger the email.
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });

    if (error) {
      setMessage({ type: 'error', text: "Không thể gửi email: " + error.message });
    } else {
      setMessage({ type: 'success', text: "Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư." });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-ganh text-2xl md:text-3xl uppercase tracking-tight font-black">Bảo mật tài khoản</h3>
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
          Quản lý mật khẩu và các thiết lập an toàn cho tài khoản của bạn.
        </p>
      </div>

      <div className="p-8 md:p-10 border-2 border-black rounded-[2.5rem] bg-white space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-2 h-2 bg-black rounded-full" />
          <h4 className="font-black text-lg uppercase tracking-tight">Mật khẩu</h4>
        </div>
        <p className="text-[11px] text-black/50 font-bold uppercase tracking-widest leading-relaxed max-w-lg">
          Để đảm bảo an toàn, chúng mình khuyên bạn nên sử dụng mật khẩu mạnh (trên 12 ký tự) và duy nhất cho tài khoản này.
        </p>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm font-bold ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className="px-10 py-5 bg-black border-2 border-black text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Gửi email đổi mật khẩu ngay"}
        </button>
      </div>

      <div className="p-8 md:p-10 border-4 border-red-500 rounded-[3rem] bg-red-50 space-y-6 relative overflow-hidden group">
        <div className="flex items-center gap-4 mb-2">
          <h4 className="font-ganh text-2xl uppercase tracking-tight text-red-600 font-black">Vùng nguy hiểm</h4>
        </div>
        <p className="text-[11px] text-red-500/70 font-bold uppercase tracking-widest leading-relaxed max-w-md">
          Việc xóa tài khoản là <span className="text-red-600 underline underline-offset-4 decoration-2">hành động vĩnh viễn</span>. Tất cả tác phẩm, đóng góp và thông tin của bạn sẽ bị xóa khỏi hệ thống.
        </p>
        <button className="px-10 py-5 bg-white border-2 border-red-500 text-red-600 font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-[8px_8px_0px_0px_rgba(239,68,68,0.2)] hover:bg-red-500 hover:text-white transition-all">
          Xác nhận xóa tài khoản
        </button>
      </div>
    </div>
  );
}
