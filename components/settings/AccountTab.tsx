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
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wide mb-2">Bảo mật tài khoản</h3>
        <p className="text-gray-500">Quản lý mật khẩu và các thiết lập bảo mật khác.</p>
      </div>

      <div className="p-6 border-2 border-black/10 rounded-2xl bg-gray-50 space-y-4">
        <h4 className="font-bold text-lg">Mật khẩu</h4>
        <p className="text-sm text-gray-600">
          Bạn nên sử dụng mật khẩu mạnh và duy nhất cho tài khoản này.
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
          className="px-6 py-3 bg-white border-2 border-black text-black font-bold uppercase tracking-wider rounded-xl hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          {loading ? "Đang gửi..." : "Gửi email đổi mật khẩu"}
        </button>
      </div>

      <div className="p-6 border-2 border-red-100 bg-red-50 rounded-2xl space-y-4">
        <h4 className="font-bold text-lg text-red-600">Vùng nguy hiểm</h4>
        <p className="text-sm text-red-500">
          Xóa tài khoản là hành động không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
        </p>
        <button className="px-6 py-3 bg-white border-2 border-red-200 text-red-500 font-bold uppercase tracking-wider rounded-xl hover:bg-red-500 hover:text-white transition-all">
          Xóa tài khoản
        </button>
      </div>
    </div>
  );
}
