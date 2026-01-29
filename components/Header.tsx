"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

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
    { name: "Đồng ngôn", href: "/dong-ngon" },
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

  return (
    <header className="w-full bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Header - Only visible on small screens */}
        <div className="flex sm:hidden items-center gap-4 mb-4">
          {/* Hamburger Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Toggle menu"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          
          {/* Mobile Search Bar */}
          <div className="flex-1">
            <SearchBar />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              />
              
              {/* Slide-out Menu */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-xl sm:hidden"
              >
                <div className="p-6">
                  {/* Close Button */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mb-8 p-2 hover:opacity-70 transition-opacity"
                    aria-label="Close menu"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  
                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => {
                      const isActive = getIsActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          prefetch={false}
                          className={`
                            font-ganh text-xl tracking-wide py-3 px-4 rounded-lg transition-colors
                            ${isActive ? "bg-black text-white" : "text-black hover:bg-gray-100"}
                          `}
                        >
                          {link.name}
                        </Link>
                      );
                    })}
                    
                    <div className="border-t border-gray-200 my-2" />
                    
                    {user ? (
                      <>
                        {role === "admin" && (
                          <Link
                            href="/admin"
                            className="font-ganh text-xl tracking-wide py-3 px-4 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Hệ thống
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          className={`
                            font-ganh text-xl tracking-wide py-3 px-4 rounded-lg transition-colors
                            ${pathname === "/profile" ? "bg-black text-white" : "text-black hover:bg-gray-100"}
                          `}
                        >
                          Hồ sơ
                        </Link>
                        <Link
                          href="/settings"
                          className={`
                            font-ganh text-xl tracking-wide py-3 px-4 rounded-lg transition-colors
                            ${pathname === "/settings" ? "bg-black text-white" : "text-black hover:bg-gray-100"}
                          `}
                        >
                          Cài đặt
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="font-ganh text-xl tracking-wide py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/dang-nhap"
                        className="font-ganh text-xl tracking-wide py-3 px-4 rounded-lg text-black hover:bg-gray-100 transition-colors"
                      >
                        Đăng nhập
                      </Link>
                    )}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden sm:flex justify-center items-center mb-6">
           <nav className="flex items-center gap-2 sm:gap-8 md:gap-16">
              {navLinks.map((link) => {
                const isActive = getIsActive(link.href);
                const showActiveState = mounted && isActive;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
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
                      className="absolute right-0 mt-3 w-48 bg-white border-2 border-black rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
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
                      >
                        Hồ sơ
                      </MenuLink>
                      <MenuLink 
                        href="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="border-t border-black/10"
                      >
                        Cài đặt
                      </MenuLink>
                      <MenuButton
                        onClick={handleLogout}
                        className="text-red-600 border-t border-black/10"
                      >
                        Đăng xuất
                      </MenuButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </nav>
        </div>

        {/* Desktop: Horizontal Line with Centered Search Bar */}
        <div className="hidden sm:flex relative justify-center items-center">
           <div className="absolute inset-0 flex items-center" aria-hidden="true">
             <div className="w-full border-t-2 border-black"></div>
           </div>
           <div className="relative bg-white px-4 z-10">
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