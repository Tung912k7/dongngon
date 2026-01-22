"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import OnboardingModal from "./OnboardingModal";
// Load custom font handled in layout.tsx via global style


interface HeaderProps {
  user: User | null;
  nickname: string | null;
  role?: string | null;
  hasSeenTour?: boolean;
}

/**
 * Header Component with Sliding Pill Animation
 * Uses Framer Motion's layoutId for smooth pill transition between nav items
 */
const Header = ({ user, nickname, role, hasSeenTour }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Đồng ngôn", href: "/dong-ngon" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Determine which link is active
  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

  const isUserSectionActive = pathname === "/profile" || pathname === "/settings" || pathname === "/dang-nhap" || pathname === "/dang-ky";

  return (
    <header className="w-full bg-white sticky top-0 z-50">
      {user && !hasSeenTour && <OnboardingModal />}
      <div className="mx-auto max-w-7xl py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Row 1: Navigation with Sliding Pill */}
        <div className="flex justify-center items-center mb-6">
           <nav className="flex items-center gap-2 sm:gap-8 md:gap-16">
              {navLinks.map((link) => {
                const isActive = getIsActive(link.href);
                return (
                  <Link
                    key={link.href}
                    id={link.href === "/dong-ngon" ? "tour-feed" : undefined}
                    href={link.href}
                    className={`
                      relative px-4 sm:px-6 py-2 rounded-full transition-colors duration-200 flex items-center justify-center
                      ${isActive ? "text-white" : "text-black hover:opacity-70"}
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-black rounded-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="font-montserrat font-normal text-xl md:text-2xl tracking-wide leading-none relative z-10 whitespace-nowrap">
                      {link.name}
                    </span>
                  </Link>
                );
              })}

              {/* User Section / Dropdown */}
              <div className="relative" ref={dropdownRef} id="tour-profile">
                <button
                  onClick={() => user ? setIsDropdownOpen(!isDropdownOpen) : router.push("/dang-nhap")}
                  className={`
                    relative px-4 sm:px-6 py-2 rounded-full transition-colors duration-200 flex items-center justify-center gap-2
                    ${isUserSectionActive ? "text-white" : "text-black hover:opacity-70"}
                  `}
                >
                  {isUserSectionActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-black rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="font-montserrat font-normal text-xl md:text-2xl tracking-wide leading-none relative z-10 whitespace-nowrap">
                    {nickname || "Tài khoản"}
                  </span>
                  {user && (
                    <svg 
                      className={`w-4 h-4 relative z-10 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
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
                        <Link 
                          href="/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-6 py-3 text-xl font-normal font-montserrat text-blue-600 hover:bg-blue-600 hover:text-white transition-colors border-b border-black/10"
                        >
                          Hệ thống
                        </Link>
                      )}
                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-6 py-3 text-xl font-normal font-montserrat text-black hover:bg-black hover:text-white transition-colors"
                      >
                        Hồ sơ
                      </Link>
                      <Link 
                        href="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-6 py-3 text-xl font-normal font-montserrat text-black hover:bg-black hover:text-white transition-colors border-t border-black/10"
                      >
                        Cài đặt
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-3 text-xl font-normal font-montserrat text-red-600 hover:bg-red-600 hover:text-white transition-colors border-t border-black/10"
                      >
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </nav>
        </div>

        {/* Row 2: Horizontal Line with Centered Search Bar */}
        <div className="relative flex justify-center items-center">
           {/* The horizontal line */}
           <div className="absolute inset-0 flex items-center" aria-hidden="true">
             <div className="w-full border-t-2 border-black"></div>
           </div>
           
           {/* The Search Bar (on top of line) */}
           <div className="relative bg-white px-4 z-10">
              <SearchBar />
           </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
