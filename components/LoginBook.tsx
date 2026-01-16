"use client";

import { useState, useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import Link from "next/link";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";

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

export default function LoginBook() {
  const router = useRouter();
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    identifier: "", // Bút danh or Gmail
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenBook = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const handleSubmit = () => {
    console.log("Login data:", formData);
    
    // 1. Close the book (Flip Forward to Back Cover)
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }

    // 2. Show Success Message on Cover
    setIsSuccess(true);

    // 3. Redirect after 2 seconds
    setTimeout(() => {
      router.push('/');
    }, 2000);
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
          // Shift logic to center the active part
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

        {/* Overlay "Đăng nhập" button - Only visible on Page 2 (Open Book - Right Page) */}
        {currentPage === 1 && (
          <button
            type="button"
            onClick={handleSubmit}
            className="absolute top-[280px] right-[90px] w-[200px] h-[60px] z-50 cursor-pointer pointer-events-auto"
             style={{ opacity: 0 }} // Invisible overlay
          >
            Đăng nhập
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
          useMouseEvents={false} // Disabled to allow input interaction
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

          {/* Page 1 - Left Page (Inputs) */}
          <Page className="rounded-l-2xl shadow-2xl relative overflow-hidden">
            {/* Spine Highlight (Right Edge) */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-10"></div>
            
            <div className="p-10 h-full flex flex-col pt-16 relative z-30">
               {/* Title */}
               <h1 className="text-right text-white text-xl mb-16 leading-relaxed">
                Chào mừng<br />
                <span className="text-2xl">bạn đã quay trở lại!</span>
              </h1>

              <div className="space-y-8">
                <div>
                  <label className="block text-white text-lg mb-2">Bút danh/Gmail</label>
                  <input
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-lg mb-2 text-right">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          </Page>

          {/* Page 2 - Right Page (Button) */}
          <Page className="rounded-r-2xl shadow-2xl relative overflow-hidden">
             {/* Spine Highlight (Left Edge) */}
             <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-10"></div>

            <div className="p-10 h-full flex flex-col items-center justify-center relative z-30">
               
               {/* Centered Login Button */}
               <button
                 type="button"
                 onClick={handleSubmit}
                 className="bg-white text-black text-2xl py-3 px-8 rounded-lg min-w-[200px] hover:bg-gray-100 transition-colors shadow-lg"
               >
                 Đăng nhập
               </button>

               <div className="mt-8">
                 <Link
                   href="/dang-ky"
                   className="text-white/80 text-sm hover:text-white hover:underline"
                 >
                   Chưa có tài khoản?
                 </Link>
               </div>
            </div>
          </Page>

          {/* Page 3 - Back Cover (Success Message) */}
          <Page className="rounded-2xl shadow-2xl flex items-center justify-center">
             <div className="text-center p-10 h-full flex flex-col justify-center items-center">
                  <p className="text-white text-center text-xl leading-relaxed animate-fade-in">
                    Chào mừng bạn<br />
                    quay lại với Đồng Ngôn!
                  </p>
                  <div className="absolute right-0 top-0 bottom-0 w-[40px] bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
             </div>
          </Page>

        </HTMLFlipBook>
      </div>
    </div>
  );
}
