"use client";

import { useState, useRef, forwardRef } from "react";
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

// Page component for react-pageflip (must use forwardRef)
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

export default function SignUpBook() {
  const router = useRouter();
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    penName: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    agreedToRegulations: false,
  });

  const [activeModal, setActiveModal] = useState<"terms" | "regulations" | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenBook = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const handleSubmit = () => {
    console.log("Sign up data:", formData);
    
    // 1. Close the book (Flip Forward to Back Cover)
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }

    // 2. Show Success Message on Cover
    setIsSuccess(true);

    // 3. Redirect after 3 seconds
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  return (
    <div className={`${customFont.className} min-h-screen flex items-center justify-center bg-white p-4`}>
      <div 
        className="relative transition-transform duration-700 ease-in-out"
        style={{
          width: 760, // Full visual spread width
          height: 600,
          // Closed (Page 0): Shift left 190px to center the Right Page (Cover)
          // Open (Page 1): No shift (0px) to center the Spine (Spread)
          // Closed Back (Page 3): Shift right 190px to center the Left Page (Back Cover)
          transform: currentPage === 0 ? 'translateX(-190px)' : currentPage > 1 ? 'translateX(190px)' : 'translateX(0)',
        }}
      >

        {/* Overlay "Mở sách" button - Only visible on Page 0 (Cover) */}
        {currentPage === 0 && !isSuccess && (
           <button
             type="button"
             onClick={handleOpenBook}
             className="absolute top-0 left-[380px] w-[380px] h-full z-50 cursor-pointer"
             title="Nhấn để mở sách"
           />
        )}

        {/* Overlay "Ghi Danh" button - Only visible on Page 2 (Open Book - Right Page) */}
        {currentPage === 1 && (
          <button
            type="button"
            onClick={handleSubmit}
            className="absolute bottom-[100px] right-[70px] flex items-center justify-center pointer-events-auto z-50"
            style={{ width: 240, height: 60, opacity: 0 }} // Invisible overlay covers the visual button
          >
            Ghi Danh
          </button>
        )}

        {/* @ts-ignore - react-pageflip types */}
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
          style={{}}
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
          {/* Page 0 - Cover */}
          <Page className="rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer">
            <div className="text-center p-10 h-full flex flex-col justify-center items-center cursor-pointer" onClick={handleOpenBook}>
                <h1 className={`${aquusFont.className} text-white text-9xl mb-6 uppercase tracking-wider`}>HỒ SƠ</h1>
                <p className="text-white/80 text-lg font-light tracking-wide">Nhấn để mở</p>
                 {/* Visual hint spine */}
                 <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
            </div>
          </Page>

          {/* Page 1 - Left Page (Name, Email, PenName) */}
          <Page className="rounded-l-2xl shadow-2xl relative overflow-hidden">
            {/* Spine Highlight (Right Edge) - Reduced width */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-10"></div>
            
            <div className="p-10 h-full flex flex-col pt-16 relative z-30">
               {/* Title */}
               <h1 className="text-right text-white text-xl mb-12 leading-relaxed">
                Chào mừng tới<br />
                <span className="text-2xl">Đồng Ngôn!</span>
              </h1>

              <div className="space-y-6">
                <div>
                  <label className="block text-white text-lg mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-lg mb-2 text-right">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-lg mb-2">Bút danh</label>
                  <input
                    type="text"
                    name="penName"
                    value={formData.penName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Page>

          {/* Page 2 - Right Page (Password, Button) */}
          <Page className="rounded-r-2xl shadow-2xl relative overflow-hidden">
             {/* Spine Highlight (Left Edge) - Reduced width */}
             <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-10"></div>

            <div className="p-10 h-full flex flex-col pt-16 relative z-30">
              <div className="space-y-6 mb-16">
                <div>
                  <label className="block text-white text-lg mb-2 text-right">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-lg mb-2">Nhập lại mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      id="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded cursor-pointer accent-white"
                    />
                    <div className="text-white text-sm select-none">
                      <label htmlFor="agreedToTerms" className="cursor-pointer">Tôi đồng ý với </label>
                      <span 
                        className="underline hover:text-gray-300 font-bold cursor-pointer" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation();
                          setActiveModal("terms"); 
                        }}
                      >
                        các điều khoản và điều kiện
                      </span>
                    </div>
                  </div>

                  {/* Regulations Checkbox */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="agreedToRegulations"
                      id="agreedToRegulations"
                      checked={formData.agreedToRegulations}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded cursor-pointer accent-white"
                    />
                    <div className="text-white text-sm select-none">
                      <label htmlFor="agreedToRegulations" className="cursor-pointer">Tôi đồng ý với </label>
                      <span 
                        className="underline hover:text-gray-300 font-bold cursor-pointer" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation();
                          setActiveModal("regulations"); 
                        }}
                      >
                        các quy định của Đồng ngôn
                      </span>
                    </div>
                  </div>
                </div>
              </div>

               {/* Center Button and Link */}
               <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-white text-black text-2xl py-3 px-8 rounded-lg min-w-[200px] hover:bg-gray-100 transition-colors"
                  >
                    Đăng ký
                  </button>
                  
                  <Link
                    href="/dang-nhap"
                    className="text-white text-lg hover:underline mt-2"
                  >
                    Đã có tài khoản
                  </Link>
               </div>
            </div>
          </Page>


          {/* Page 3 - Back Cover (Success Message) */}
          <Page className="rounded-2xl shadow-2xl flex items-center justify-center">
             <div className="text-center p-10 h-full flex flex-col justify-center items-center">
                  <p className="text-white text-center text-xl leading-relaxed animate-fade-in">
                    Chúc bạn sẽ có một hành<br />
                    trình thật tuyệt vời khi ở đây!
                  </p>
                  {/* Visual hint spine (Right side for back cover inner/outer?) 
                      If this is the Left Page of the closed book, the spine is on the Right.
                  */}
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
                {activeModal === "terms" ? (
                  <div dangerouslySetInnerHTML={{ __html: TERMS_CONTENT }} />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: REGULATIONS_CONTENT }} />
                )}
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
