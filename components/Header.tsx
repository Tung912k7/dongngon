"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import localFont from "next/font/local";

// Load custom font
const customFont = localFont({
  src: "../public/fonts/roboto-slab-light.ttf",
  display: "swap",
});

interface HeaderProps {
  user: User | null;
}

/**
 * Header Component with Sliding Pill Animation
 * Uses Framer Motion's layoutId for smooth pill transition between nav items
 */
const Header = ({ user }: HeaderProps) => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Đồng ngôn", href: "/dong-ngon" },
    { name: "Tài khoản", href: user ? "/profile" : "/login" },
  ];

  // Determine which link is active
  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/profile" || href === "/login") {
      return pathname === "/profile" || pathname === "/login";
    }
    return pathname === href;
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Row 1: Navigation with Sliding Pill */}
        <div className="flex justify-center items-center mb-6">
           <nav className="flex items-center gap-2 sm:gap-8 md:gap-16">
              {navLinks.map((link) => {
                const isActive = getIsActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative px-4 sm:px-6 py-2 rounded-full transition-colors duration-200
                      ${isActive ? "text-white" : "text-black hover:opacity-70"}
                    `}
                  >
                    {/* Sliding Pill Background */}
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-black rounded-full"
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30 
                        }}
                      />
                    )}
                    <span className={`${customFont.className} relative z-10 whitespace-nowrap font-bold`}>
                      {link.name}
                    </span>
                  </Link>
                );
              })}
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
