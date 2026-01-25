"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
// Load custom font handled in layout.tsx via global style


interface HeaderProps {
  user: User | null;
  nickname: string | null;
  role?: string | null;
}

/**
 * Header Component with Sliding Pill Animation
 * Uses Framer Motion's layoutId for smooth pill transition between nav items
 */
const Header = ({ user, nickname, role }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Đồng ngôn", href: "/dong-ngon" },
  ];

  if (!mounted) {
    return (
      <header className="w-full bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            <div className="p-2 -ml-2 w-12 h-12" />
            <div className="flex-1 max-w-sm">
              <SearchBar />
            </div>
          </div>
        </div>
        <div className="w-full border-b border-black"></div>
      </header>
    );
  }

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            {/* Hamburger Menu Icon */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 hover:opacity-70 transition-opacity"
              aria-label="Toggle menu"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-black"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-sm">
              <SearchBar />
            </div>
          </div>
        </div>
        {/* Horizontal Line */}
        <div className="w-full border-b border-black"></div>
      </header>

      {/* Full-screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col p-4 sm:p-6"
          >
            {/* Close Button */}
            <div className="flex justify-start">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -ml-2 hover:opacity-70 transition-opacity"
                aria-label="Close menu"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-black"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-8 -mt-20">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl sm:text-4xl font-montserrat font-normal text-black hover:opacity-70 transition-opacity"
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Account Section */}
              <div className="flex flex-col items-center gap-8">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-3xl sm:text-4xl font-montserrat font-normal text-black hover:opacity-70 transition-opacity"
                    >
                      {nickname || "Hồ sơ"}
                    </Link>
                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-3xl sm:text-4xl font-montserrat font-normal text-blue-600 hover:opacity-70 transition-opacity"
                      >
                        Hệ thống
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-3xl sm:text-4xl font-montserrat font-normal text-red-600 hover:opacity-70 transition-opacity"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    href="/dang-nhap"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl sm:text-4xl font-montserrat font-normal text-black hover:opacity-70 transition-opacity"
                  >
                    Tài khoản
                  </Link>
                )}
              </div>
            </nav>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
