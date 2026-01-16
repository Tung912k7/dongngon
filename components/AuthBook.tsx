"use client";

import { useState, useRef, forwardRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import Link from "next/link";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { TERMS_CONTENT, REGULATIONS_CONTENT } from "../data/legalContent";

// Load custom fonts
const customFont = localFont({
  src: "../public/fonts/roboto-slab-light.ttf",
  display: "swap",
});

const aquusFont = localFont({
  src: "../public/fonts/hlt-aquus-regular.ttf",
  display: "swap",
});

// Page component
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = "" }, ref) => {
    return (
      <div ref={ref} className={`page bg-[#1a1a1a] h-full ${className}`}>
        {children}
      </div>
    );
  }
);
Page.displayName = "Page";

interface AuthBookProps {
  initialMode: "signup" | "login";
}

export default function AuthBook({ initialMode }: AuthBookProps) {
  const router = useRouter();
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    email: "",
    penName: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    agreedToRegulations: false,
  });

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const [activeModal, setActiveModal] = useState<"terms" | "regulations" | null>(null);

  // Handlers
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSignUpData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenBook = () => {
    if (bookRef.current) {
      if (initialMode === "signup") {
        bookRef.current.pageFlip().flip(1);
      } else {
         // Login is on Page 3 (Left) and 4 (Right)
         // Assuming indexing: 0 (Cover), 1 (UpL), 2 (UpR), 3 (InL), 4 (InR), 5 (Back)
         // We should flip to 3 to show the Login Spread (3-4) ?
         // Actually react-pageflip manages spreads. 1-2 is spread 1. 3-4 is spread 2. 
         // Flipping to 3 should open that spread.
        bookRef.current.pageFlip().flip(3);
      }
    }
  };

  const goToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (bookRef.current) {
        bookRef.current.pageFlip().flip(3);
    }
  };

  const goToSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (bookRef.current) {
        bookRef.current.pageFlip().flip(1);
    }
  };

  const handleSignUpSubmit = () => {
    console.log("Sign up data:", signUpData);
    setSuccessMessage("Chúc bạn sẽ có một hành\ntrình thật tuyệt vời khi ở đây!");
    closeAndFinish();
  };

  const handleLoginSubmit = () => {
    console.log("Login data:", loginData);
    setSuccessMessage("Chào mừng bạn\nquay lại với Đồng Ngôn!");
    closeAndFinish();
  };

  const closeAndFinish = () => {
    // Flip to Back Cover (Page 5)
    if (bookRef.current) {
        // Find last page index? 0, 1, 2, 3, 4, 5
        bookRef.current.pageFlip().flip(5);
    }
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const isSignUpValid =
    signUpData.fullName.trim() !== "" &&
    signUpData.email.trim() !== "" &&
    signUpData.penName.trim() !== "" &&
    signUpData.password.trim() !== "" &&
    signUpData.confirmPassword.trim() !== "" &&
    signUpData.agreedToTerms &&
    signUpData.agreedToRegulations;

  const isLoginValid =
    loginData.identifier.trim() !== "" &&
    loginData.password.trim() !== "";

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  return (
    <div className={`${customFont.className} min-h-screen flex items-center justify-center bg-white p-4`}>
      <div 
        className="relative transition-transform duration-700 ease-in-out"
        style={{
          width: 760,
          height: 600,
          // Page 0 (Cover): Shift Left
          // Page 5 (Back Cover): Shift Right
          // Pages 1-4 (Spreads): Center
          transform: currentPage === 0 ? 'translateX(-190px)' : (currentPage >= 5 ? 'translateX(190px)' : 'translateX(0)'),
        }}
      >

        {/* Overlay "Mở sách" button - Cover (Page 0) */}
        {currentPage === 0 && !isSuccess && (
           <button
             type="button"
             onClick={handleOpenBook}
             className="absolute top-0 left-[380px] w-[380px] h-full z-50 cursor-pointer"
             title="Nhấn để mở sách"
           />
        )}

        {/* Overlay "Ghi Danh" button - Sign Up (Page 2) */}
        {currentPage === 1 && (
           <button
             type="button"
             onClick={handleSignUpSubmit}
             disabled={!isSignUpValid}
             className="absolute bottom-[100px] right-[70px] flex items-center justify-center pointer-events-auto z-50"
             style={{ width: 240, height: 60, opacity: 0, cursor: isSignUpValid ? 'pointer' : 'default' }} 
           >
             Ghi Danh
           </button>
        )}

        {/* Overlay "Đăng Nhập" button - Login (Page 4) */}
        {/* If we are at Login Spread, currentPage should be 3 (Left) */}
        {currentPage === 3 && ( 
           <button
             type="button"
             onClick={handleLoginSubmit}
             disabled={!isLoginValid}
             className="absolute top-[280px] right-[90px] w-[200px] h-[60px] z-50 cursor-pointer pointer-events-auto"
             style={{ opacity: 0, cursor: isLoginValid ? 'pointer' : 'default' }}
           >
             Đăng nhập
           </button>
        )}


        {/* @ts-ignore */}
        <HTMLFlipBook
          ref={bookRef}
          width={380}
          height={600}
          size="fixed"
          minWidth={300}
          maxWidth={500}
          minHeight={400}
          maxHeight={700}
          showCover={true}
          mobileScrollSupport={true}
          className="" 
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showPageCorners={false}
          disableFlipByClick={true}
          useMouseEvents={false}
          swipeDistance={30}
          clickEventForward={true}
          onFlip={onFlip}
          onChangeOrientation={() => {}}
          onChangeState={() => {}}
        >
          {/* Page 0: Cover */}
          <Page className="rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer">
            <div className="text-center p-10 h-full flex flex-col justify-center items-center cursor-pointer" onClick={handleOpenBook}>
                <h1 className={`${aquusFont.className} text-white text-9xl mb-6 uppercase tracking-wider`}>HỒ SƠ</h1>
                <p className="text-white/80 text-lg font-light tracking-wide">Nhấn để mở</p>
                 <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </Page>

          {/* Page 1: Sign Up Left */}
          <Page className="rounded-l-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-10"></div>
            <div className="p-10 h-full flex flex-col pt-16 relative z-30">
               <h1 className="text-right text-white text-xl mb-12 leading-relaxed">
                Chào mừng tới<br />
                <span className="text-2xl">Đồng Ngôn!</span>
              </h1>
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-lg mb-2">Họ và tên</label>
                  <input type="text" name="fullName" value={signUpData.fullName} onChange={handleSignUpChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white text-lg mb-2 text-right">Email</label>
                  <input type="email" name="email" value={signUpData.email} onChange={handleSignUpChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white text-lg mb-2">Bút danh</label>
                  <input type="text" name="penName" value={signUpData.penName} onChange={handleSignUpChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none" />
                </div>
              </div>
            </div>
          </Page>

          {/* Page 2: Sign Up Right */}
          <Page className="rounded-r-2xl shadow-2xl relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-10"></div>
            <div className="p-10 h-full flex flex-col pt-16 relative z-30">
              <div className="space-y-6 mb-16">
                <div>
                  <label className="block text-white text-lg mb-2 text-right">Mật khẩu</label>
                  <input type="password" name="password" value={signUpData.password} onChange={handleSignUpChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none" />
                </div>
                <div>
                  <label className="block text-white text-lg mb-2">Nhập lại mật khẩu</label>
                  <input type="password" name="confirmPassword" value={signUpData.confirmPassword} onChange={handleSignUpChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="agreedToTerms" id="agreedToTerms" checked={signUpData.agreedToTerms} onChange={handleSignUpChange} className="w-5 h-5 rounded cursor-pointer accent-white" />
                    <div className="text-white text-sm select-none">
                      <label htmlFor="agreedToTerms" className="cursor-pointer">Tôi đồng ý với </label>
                      <span className="underline hover:text-gray-300 font-bold cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal("terms"); }}>các điều khoản và điều kiện</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" name="agreedToRegulations" id="agreedToRegulations" checked={signUpData.agreedToRegulations} onChange={handleSignUpChange} className="w-5 h-5 rounded cursor-pointer accent-white" />
                    <div className="text-white text-sm select-none">
                      <label htmlFor="agreedToRegulations" className="cursor-pointer">Tôi đồng ý với </label>
                      <span className="underline hover:text-gray-300 font-bold cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal("regulations"); }}>các quy định của Đồng ngôn</span>
                    </div>
                  </div>
                </div>
              </div>
               <div className="flex flex-col items-center gap-4">
                  <button 
                    type="button" 
                    onClick={handleSignUpSubmit} 
                    disabled={!isSignUpValid}
                    className="bg-white text-black text-2xl py-3 px-8 rounded-lg min-w-[200px] hover:bg-gray-100 transition-colors"
                  >
                    Ghi Danh
                  </button>
                  <a href="#" onClick={goToLogin} className="text-white text-lg hover:underline mt-2">
                    Đã có tài khoản
                  </a>
               </div>
            </div>
          </Page>

          {/* Page 3: Login Left */}
          <Page className="rounded-l-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-10"></div>
            <div className="p-10 h-full flex flex-col pt-16 relative z-30">
               <h1 className="text-right text-white text-xl mb-16 leading-relaxed">
                Chào mừng<br />
                <span className="text-2xl">bạn đã quay trở lại!</span>
              </h1>
              <div className="space-y-8">
                <div>
                  <label className="block text-white text-lg mb-2">Bút danh/Gmail</label>
                  <input type="text" name="identifier" value={loginData.identifier} onChange={handleLoginChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
                <div>
                  <label className="block text-white text-lg mb-2 text-right">Mật khẩu</label>
                  <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400" />
                </div>
              </div>
            </div>
          </Page>

          {/* Page 4: Login Right */}
          <Page className="rounded-r-2xl shadow-2xl relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-10"></div>
            <div className="p-10 h-full flex flex-col items-center justify-center relative z-30">
               <button 
                 type="button" 
                 onClick={handleLoginSubmit} 
                 disabled={!isLoginValid}
                 className="bg-white text-black text-2xl py-3 px-8 rounded-lg min-w-[200px] hover:bg-gray-100 transition-colors shadow-lg"
               >
                 Đăng nhập
               </button>
               <div className="mt-8">
                 <a href="#" onClick={goToSignUp} className="text-white/80 text-sm hover:text-white hover:underline">
                   Chưa có tài khoản?
                 </a>
               </div>
            </div>
          </Page>

          {/* Page 5: Back Cover (Success) */}
          <Page className="rounded-2xl shadow-2xl flex items-center justify-center">
             <div className="text-center p-10 h-full flex flex-col justify-center items-center">
                  <p className="text-white text-center text-xl leading-relaxed animate-fade-in whitespace-pre-wrap">
                    {successMessage}
                  </p>
                  <div className="absolute right-0 top-0 bottom-0 w-[40px] bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
             </div>
          </Page>

        </HTMLFlipBook>

        {/* Modal Overlay */}
        {activeModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-4 text-black text-center">
                {activeModal === "terms" ? "Các Điều Khoản" : "Quy Định Đồng Ngôn"}
              </h2>
              <div className="prose text-gray-700 leading-relaxed mb-6">
                {activeModal === "terms" ? <div dangerouslySetInnerHTML={{ __html: TERMS_CONTENT }} /> : <div dangerouslySetInnerHTML={{ __html: REGULATIONS_CONTENT }} />}
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">Đóng</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
