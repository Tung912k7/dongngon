"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { TERMS_CONTENT, REGULATIONS_CONTENT } from "../data/legalContent";

// --- Components ---
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};

const InputField = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  name 
}: { 
  label: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  type?: string;
  name: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-6 group">
      <label className="block text-black text-lg mb-2 font-bold font-sans">{label}</label>
      <div className="relative">
        <input 
          type={inputType} 
          name={name}
          value={value} 
          onChange={onChange}
          className="w-full px-5 py-3 border-[3px] border-black bg-white text-black text-lg focus:outline-none transition-all rounded-[1rem] pr-12"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:opacity-70 transition-opacity p-1"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Checkbox = ({ 
  label, 
  checked, 
  onChange,
  name
}: { 
  label: React.ReactNode; 
  checked: boolean; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}) => (
  <div className="flex items-center gap-4 mb-3 group cursor-pointer">
    <div className="relative flex items-center">
      <input 
        id={name}
        type="checkbox" 
        name={name}
        checked={checked} 
        onChange={onChange} 
        className="peer h-7 w-7 cursor-pointer appearance-none rounded-none border-[3px] border-black checked:bg-black transition-all" 
      />
      <svg
        className="absolute h-5 w-5 pointer-events-none hidden peer-checked:block text-white left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <div className="text-black text-base font-sans select-none">
      <label htmlFor={name} className="cursor-pointer font-bold">{label}</label>
    </div>
  </div>
);

// --- Login Form ---

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ identifier: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const isValid = useMemo(() => data.identifier.trim() !== "" && data.password.trim() !== "", [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      const supabase = createClient();
      let emailToUse = data.identifier;

      // Handle pen name login
      if (!data.identifier.includes("@")) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .ilike("nickname", data.identifier) // Case-insensitive lookup
            .single();

          if (profileError) {
            console.error("Pen name lookup failed:", profileError);
            if (profileError.code === "PGRST116") {
              alert("Bút danh này chưa được đăng ký.");
            } else if (profileError.message.includes("column \"email\" does not exist")) {
              alert("Hệ thống chưa hỗ trợ đăng nhập bằng bút danh. Vui lòng sử dụng Email.\n(Lỗi: Thiếu cột 'email' trong bảng profiles)");
            } else {
              alert(`Lỗi khi tìm kiếm bút danh: ${profileError.message}`);
            }
            setLoading(false);
            return;
          }

          if (!profileData?.email) {
            alert("Bút danh tồn tại nhưng không có email liên kết. Vui lòng sử dụng Email.");
            setLoading(false);
            return;
          }
          emailToUse = profileData.email;
        } catch (lookupErr) {
          console.error("Unexpected lookup error:", lookupErr);
          alert("Lỗi hệ thống khi tìm kiếm bút danh.");
          setLoading(false);
          return;
        }
      }

      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: data.password,
      });

      if (error) {
        alert(error.message || "Lỗi đăng nhập.");
        setLoading(false);
        return;
      }

      if (user) {
         router.push("/");
         router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in max-w-md mx-auto -mt-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-aquus font-bold text-black mb-2 italic">Hồ sơ</h1>
        <div className="h-0.5 w-12 bg-black mx-auto" />
      </div>
      
      <div className="space-y-2">
        <InputField 
          label="Bút danh / Email" 
          name="identifier" 
          value={data.identifier} 
          onChange={handleChange} 
        />
        <InputField 
          label="Mật khẩu" 
          name="password" 
          type="password" 
          value={data.password} 
          onChange={handleChange} 
        />
      </div>

      <div className="text-center mt-10">
        <button 
          type="submit" 
          disabled={!isValid || loading}
          className="px-10 py-2.5 bg-white border-[3px] border-black text-black text-2xl rounded-xl hover:bg-black hover:text-white disabled:cursor-not-allowed transition-all font-sans font-bold"
        >
          {loading ? "..." : "Đăng nhập"}
        </button>
      </div>

      <div className="text-center mt-8">
        <Link href="/dang-ky" className="text-gray-500 hover:opacity-70 transition-opacity text-sm uppercase tracking-widest">
          Chưa có tài khoản?
        </Link>
      </div>
    </form>
  );
}

// --- Sign Up Form ---

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<"terms" | "regulations" | null>(null);
  const [data, setData] = useState({
    fullName: "",
    email: "",
    penName: "",
    password: "",
    agreedToTerms: false,
    agreedToRegulations: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const isValid = useMemo(() => 
    data.fullName.trim() !== "" &&
    data.email.trim() !== "" &&
    data.penName.trim() !== "" &&
    data.password.trim() !== "" &&
    data.agreedToTerms &&
    data.agreedToRegulations,
  [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    try {
      const supabase = createClient();
      
      // 0. Check Blacklist for Pen Name
      const { checkBlacklist } = await import("@/utils/blacklist");
      const violation = await checkBlacklist(data.penName);
      if (violation) {
        alert(`Bút danh "${data.penName}" chứa từ không cho phép (${violation}). Vui lòng chọn tên khác.`);
        setLoading(false);
        return;
      }

      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            nickname: data.penName,
          }
        }
      });

      if (authError) {
        alert(authError.message || "Lỗi đăng ký tài khoản.");
        setLoading(false);
        return;
      }

      if (!authError) {
        console.log("Đã tạo tài khoản và Trigger sẽ tự động tạo hồ sơ!");
      }

      if (authData.user) {
        alert("Đăng ký thành công! Hãy kiểm tra email (nếu có yêu cầu xác nhận) và đăng nhập để bắt đầu.");
        router.push("/dang-nhap");
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi trong quá trình đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in">
        {/* Left Side: Form */}
        <div className="w-full flex justify-center lg:justify-end -mt-12">
          <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <div className="text-center mb-6">
              <h1 className="text-5xl font-aquus font-bold text-black mb-2">Ghi danh</h1>
            </div>
          
          <div className="space-y-4">
            <InputField label="Họ và tên" name="fullName" value={data.fullName} onChange={handleChange} />
            <InputField label="Gmail" name="email" type="email" value={data.email} onChange={handleChange} />
            <InputField label="Bút danh" name="penName" value={data.penName} onChange={handleChange} />
            <InputField label="Mật khẩu" name="password" type="password" value={data.password} onChange={handleChange} />
          </div>

          <div className="mt-8 space-y-2">
            <Checkbox 
              label={
                <>
                  Tôi đồng ý với các{" "}
                  <span 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal("terms"); }}
                    className="underline hover:text-gray-600 transition-colors"
                  >
                    điều khoản
                  </span>
                </>
              } 
              name="agreedToTerms"
              checked={data.agreedToTerms} 
              onChange={handleChange} 
            />
            <Checkbox 
              label={
                <>
                  Tôi đồng ý với các{" "}
                  <span 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal("regulations"); }}
                    className="underline hover:text-gray-600 transition-colors"
                  >
                    quy định
                  </span>
                </>
              } 
              name="agreedToRegulations"
              checked={data.agreedToRegulations} 
              onChange={handleChange} 
            />
          </div>

            <div className="text-center mt-8">
              <button 
                type="submit" 
                disabled={!isValid || loading}
                className="px-10 py-2.5 bg-white border-[3px] border-black text-black text-2xl rounded-xl hover:bg-black hover:text-white disabled:cursor-not-allowed transition-all font-sans font-bold"
              >
                {loading ? "..." : "Đăng ký"}
              </button>
            </div>

            <div className="text-center mt-6">
              <Link href="/dang-nhap" className="text-gray-500 hover:opacity-70 transition-opacity text-sm uppercase tracking-widest">
                Đã có tài khoản?
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side: Illustration */}
        <div className="hidden lg:flex relative h-full items-center">
          <div className="absolute right-[-25%] w-[125%] aspect-square pointer-events-none translate-y-[-5%]">
            {/* Love Hand Background */}
            <img 
              src="/lovehand.png" 
              alt="Love Hand" 
              className="w-full h-full object-contain"
            />
            {/* Cow Centered in Heart */}
            <div className="absolute top-[48%] left-[52%] -translate-x-1/2 -translate-y-1/2 w-52 h-52 flex items-center justify-center">
              <img 
                src="/cow.png" 
                alt="Cow" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay (Shared) - Portaled to Body */}
      {activeModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto relative border-[3px] border-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-aquus font-bold text-black uppercase">
                  {activeModal === "terms" ? "Các Điều Khoản" : "Quy Định Đồng Ngôn"}
                </h2>
                <div className="h-0.5 w-10 bg-black mx-auto mt-2" />
              </div>
              
              <div className="prose prose-sm max-w-none text-black leading-relaxed mb-8 font-sans">
                {activeModal === "terms" ? <div dangerouslySetInnerHTML={{ __html: TERMS_CONTENT }} /> : <div dangerouslySetInnerHTML={{ __html: REGULATIONS_CONTENT }} />}
              </div>
              
              <button 
                onClick={() => setActiveModal(null)} 
                className="w-full bg-white border-[3px] border-black text-black py-3 text-sm font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-all uppercase rounded-xl"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
