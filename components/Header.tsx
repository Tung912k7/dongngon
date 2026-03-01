"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getNotifications } from "@/actions/notification";

interface HeaderProps {
  user: User | null;
  nickname: string | null;
  role?: string | null;
}

/**
 * Header Component with Sliding Pill Animation
 * Uses Framer Motion's layoutId for smooth pill transition between nav items
 * Mobile: Hamburger menu + Search bar
 * Desktop: Pill navigation + Centered search bar
 */
const Header = ({ user, nickname, role }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Kho tàng", href: "/kho-tang" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

  const isUserSectionActive = pathname === "/profile" || pathname === "/settings" || pathname === "/dang-nhap" || pathname === "/dang-ky";
  
  const MenuLink = ({ href, onClick, children, className = "" }: { href: string; onClick: () => void; children: React.ReactNode; className?: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <Link 
        href={href} 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`block px-6 py-3 text-lg font-normal font-ganh transition-colors ${className}`}
        style={{
          backgroundColor: isHovered ? "black" : "transparent",
          color: isHovered ? "white" : (className.includes("text-") ? undefined : "black"),
        }}
      >
        {children}
      </Link>
    );
  };

  const MenuButton = ({ onClick, children, className = "" }: { onClick: () => void; children: React.ReactNode; className?: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <button 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full block px-6 py-3 text-lg font-normal font-ganh transition-colors text-left ${className}`}
        style={{
          backgroundColor: isHovered ? "black" : "transparent",
          color: isHovered ? "white" : (className.includes("text-") ? undefined : "black"),
        }}
      >
        {children}
      </button>
    );
  };

  const NotificationMenuItemContent = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
      if (!user) return;
      const fetchNotifications = async () => {
        const result = await getNotifications();
        if (result.success && result.notifications) {
          setUnreadCount(result.notifications.filter(n => !n.is_read).length);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex items-center gap-2">
        <span>Thông báo</span>
        {unreadCount > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm border border-white" />
        )}
      </div>
    );
  };

  return (
    <header className="w-full bg-white relative sm:sticky sm:top-0 z-[45]">
      <div className="mx-auto max-w-7xl py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header - Only visible on small screens */}
        <div className="flex flex-col sm:hidden w-full gap-4 mb-2 relative z-50">
          <div className="flex justify-between items-center w-full">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-ganh text-[28px] leading-none font-black tracking-tighter text-black flex items-center gap-1.5 focus:outline-none">
              Đồng ngôn
              <span className="w-2 h-2 rounded-full bg-black mb-1"></span>
            </Link>
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-black active:scale-95 transition-all hover:bg-black hover:text-white group"
              aria-label="Mở menu"
            >
              <div className="flex flex-col gap-[4px] items-center">
                <span className="w-[18px] h-[2px] bg-black group-hover:bg-white transition-colors rounded-full"></span>
                <span className="w-[16px] h-[2px] bg-black group-hover:bg-white transition-colors rounded-full"></span>
                <span className="w-[18px] h-[2px] bg-black group-hover:bg-white transition-colors rounded-full"></span>
              </div>
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="w-full">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 bg-white z-[100] sm:hidden flex flex-col"
            >
              {/* Menu Header */}
              <div className="flex justify-between items-center py-4 px-4 relative z-10 w-full bg-white">
                 <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-ganh text-[28px] leading-none font-black tracking-tighter text-black flex items-center gap-1.5 focus:outline-none">
                    Đồng ngôn
                    <span className="w-2 h-2 rounded-full bg-black mb-1"></span>
                 </Link>
                 <button 
                   onClick={() => setIsMobileMenuOpen(false)}
                   className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center active:scale-95 transition-all hover:bg-black hover:text-white group"
                 >
                   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 6L6 18M6 6l12 12" />
                   </svg>
                 </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col pb-20">
                 <nav className="flex flex-col gap-5">
                    {navLinks.map((link, i) => {
                      const isActive = getIsActive(link.href);
                      return (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              font-ganh text-[40px] leading-tight font-black tracking-tight flex items-center justify-between
                              ${isActive ? "text-black" : "text-gray-300 hover:text-black transition-colors"}
                            `}
                          >
                            {link.name}
                            {isActive && (
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-black ml-4">
                                <path d="M5 12h14m-7-7l7 7-7 7" />
                              </svg>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                 </nav>

                 <div className="h-[2px] w-full bg-black/5 my-8" />

                 <div className="flex flex-col gap-2">
                    {user ? (
                      <>
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <span className="font-black text-2xl uppercase">{nickname?.charAt(0) || "U"}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Người dùng</span>
                              <span className="text-xl font-black font-ganh leading-tight tracking-wide text-black">{nickname}</span>
                           </div>
                        </div>
                        {role === "admin" && (
                          <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold py-3 text-blue-600 flex items-center justify-between group">
                             Hệ thống
                             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold py-3 text-gray-700 hover:text-black flex items-center justify-between group">
                           Hồ sơ cá nhân
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                        <Link href="/notification" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold py-3 text-gray-700 hover:text-black flex items-center justify-between group">
                           <NotificationMenuItemContent />
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                        <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold py-3 text-gray-700 hover:text-black flex items-center justify-between group">
                           Cài đặt
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                        
                        <button onClick={handleLogout} className="mt-8 w-full py-4 rounded-xl border-2 border-red-500 text-red-500 font-bold uppercase tracking-[0.1em] text-sm active:scale-95 transition-all hover:bg-red-500 hover:text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]">
                           Đăng xuất
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-4 mt-auto">
                        <Link href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-black text-white text-center rounded-xl font-bold uppercase tracking-[0.1em] text-sm active:scale-95 transition-all border-2 border-black hover:opacity-90">
                           Đăng nhập
                        </Link>
                        <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-white text-black border-2 border-black text-center rounded-xl font-bold uppercase tracking-[0.1em] text-sm active:scale-95 transition-all hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                           Tạo tài khoản
                        </Link>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden sm:flex justify-center items-center mb-8">
           <nav className="flex items-center gap-10 md:gap-24">
              {navLinks.map((link) => {
                const isActive = getIsActive(link.href);
                const showActiveState = mounted && isActive;
                return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        relative px-4 sm:px-6 py-2 rounded-full transition-colors duration-200 flex items-center justify-center
                        ${showActiveState ? "text-white" : "text-black hover:opacity-70"}
                      `}
                    >
                    {showActiveState && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-black rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`font-ganh font-normal text-xl md:text-2xl tracking-wide leading-none relative z-10 whitespace-nowrap ${showActiveState ? "text-white" : "text-black"}`}>
                      {link.name}
                    </span>
                  </Link>
                );
              })}

              {/* User Section / Dropdown */}
              <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => user ? setIsDropdownOpen(!isDropdownOpen) : router.push("/dang-nhap")}
                  className={`
                    relative px-4 sm:px-6 py-2 rounded-full transition-colors duration-200 flex items-center justify-center gap-2
                    ${mounted && isUserSectionActive ? "text-white" : "text-black hover:opacity-70"}
                  `}
                >
                  {mounted && isUserSectionActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`font-ganh font-normal text-xl md:text-2xl tracking-wide leading-none relative z-10 whitespace-nowrap ${mounted && isUserSectionActive ? "text-white" : "text-black"}`}>
                    {nickname || "Tài khoản"}
                  </span>
                  {user && (
                    <svg 
                      className={`w-4 h-4 relative z-10 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${mounted && isUserSectionActive ? "text-white" : "text-black"}`} 
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                <AnimatePresence>
                  {isDropdownOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-48 bg-white border-2 border-black rounded-2xl shadow-xl py-2 z-50 overflow-hidden flex flex-col"
                    >
                      {role === "admin" && (
                        <MenuLink
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="text-blue-600 border-b border-black/10"
                        >
                          Hệ thống
                        </MenuLink>
                      )}
                      <MenuLink 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="border-b border-black/10"
                      >
                        Hồ sơ
                      </MenuLink>
                      <MenuLink 
                        href="/notification" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="border-b border-black/10"
                      >
                        <NotificationMenuItemContent />
                      </MenuLink>
                      <MenuLink 
                        href="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="border-b border-black/10"
                      >
                        Cài đặt
                      </MenuLink>
                      <MenuButton
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        Đăng xuất
                      </MenuButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
           </nav>
        </div>

        {/* Desktop: Horizontal Line with Centered Search Bar */}
        <div className="hidden sm:flex relative justify-center items-center">
           <div className="absolute inset-0 flex items-center" aria-hidden="true">
             <div className="w-full border-t-2 border-black"></div>
           </div>
           <div className="relative bg-white px-8 z-10">
              <SearchBar />
           </div>
        </div>

        {/* Mobile: Simple horizontal line */}
        <div className="sm:hidden">
          <div className="w-full border-t-2 border-black"></div>
        </div>

      </div>
    </header>
  );
};

export default Header;