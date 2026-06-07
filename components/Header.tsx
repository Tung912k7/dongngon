"use client";

import { logger } from "@/lib/logger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { AnimatePresence, m } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";
import { useZenStore } from "@/stores/zen-store";
import { useShallow } from "zustand/react/shallow";
import dynamic from "next/dynamic";

import { getRandomActiveWork } from "@/actions/randomWork";
import { toast } from "sonner";

const SearchModal = dynamic(() => import("@/components/SearchModal"), { ssr: false });

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    filter: "blur(2px)",
    transition: { duration: 0.2 },
  },
};

interface HeaderProps {
  user?: User | null;
  nickname?: string | null;
  role?: string | null;
}

/**
 * Header Component with Sliding Pill Animation
 * Uses Framer Motion's layoutId for smooth pill transition between nav items
 * Mobile: Hamburger menu
 * Desktop: Pill navigation
 */
const Header = (_props: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user, setUser, nickname, setNickname, role, setRole } = useUserStore(
    useShallow((state) => ({
      user: state.user,
      setUser: state.setUser,
      nickname: state.nickname,
      setNickname: state.setNickname,
      role: state.role,
      setRole: state.setRole,
    }))
  );

  const { unreadCount, fetchUnreadCount } = useNotificationStore(
    useShallow((state) => ({
      unreadCount: state.unreadCount,
      fetchUnreadCount: state.fetchUnreadCount,
    }))
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const isZenMode = useZenStore((state) => state.isZenMode);

  const handleWriteNow = useCallback(async () => {
    setIsRedirecting(true);
    try {
      const res = await getRandomActiveWork();
      if (res.error) {
        toast.error(res.error);
      } else if (res.workId) {
        router.push(`/work/${res.workId}`);
      } else {
        toast.info("Hiện không có tác phẩm nào đang mở viết.");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tìm tác phẩm.");
    } finally {
      setIsRedirecting(false);
    }
  }, [router]);

  const loadUserProfile = useCallback(
    async (userOverride?: User | null) => {
      const currentUser =
        userOverride === undefined
          ? // NOTE: getSession() is intentionally used here for client-side UI only.
            // It reads from local storage without server verification — acceptable for
            // displaying user info. All mutating operations use getUser() in server actions.
            ((await supabase.auth.getSession()).data.session?.user ?? null)
          : userOverride;

      if (!currentUser) {
        setUser(null);
        setNickname(null);
        setRole(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        logger.error("[Header] Profile fetch error", error, {
          code: error.code,
          message: error.message,
        });
      }

      const { data: privateData } = await supabase
        .from("user_private_data")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      setUser(currentUser);
      setNickname(
        profile?.nickname ||
          currentUser.user_metadata?.nickname ||
          currentUser.user_metadata?.full_name ||
          currentUser.email?.split("@")[0] ||
          "Thành viên"
      );
      setRole(privateData?.role || currentUser.user_metadata?.role || "user");
    },
    [supabase, setUser, setNickname, setRole]
  );

  // Fetch unread notification count at Header level
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    void loadUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUserProfile(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile, supabase]);

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

  // Close dropdown on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Kho tàng", href: "/kho-tang" },
    { name: "Thành tích", href: "/rankings" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNickname(null);
    setRole(null);
    router.push("/");
    router.refresh();
  };

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

  const isUserSectionActive =
    pathname === "/profile" ||
    pathname === "/settings" ||
    pathname === "/dang-nhap" ||
    pathname === "/dang-ky";

  const MenuLink = ({
    href,
    onClick,
    children,
    className = "",
  }: {
    href: string;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`block px-4 py-2 mx-1 my-0.5 text-[14px] font-sans font-medium text-ink-charcoal hover:text-deep-teal hover:bg-deep-teal/[0.04] focus-visible:ring-1 focus-visible:ring-deep-teal focus-visible:outline-none rounded-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${className}`}
      >
        {children}
      </Link>
    );
  };

  const MenuButton = ({
    onClick,
    children,
    className = "",
  }: {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 mx-1 my-0.5 text-[14px] font-sans font-medium text-ink-charcoal hover:text-deep-teal hover:bg-deep-teal/[0.04] focus-visible:ring-1 focus-visible:ring-deep-teal focus-visible:outline-none rounded-md transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${className}`}
      >
        {children}
      </button>
    );
  };

  const NotificationMenuItemContent = () => {
    return (
      <div className="flex items-center gap-2">
        <span>Thông báo</span>
        {unreadCount > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm border border-white" />
        )}
      </div>
    );
  };

  if (isZenMode) {
    return null;
  }

  return (
    <m.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="sticky top-0 z-[45] bg-transparent pt-4 px-4 w-full"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-3 flex items-center justify-between bg-white/85 backdrop-blur-lg rounded-full border border-[#eae6e1] shadow-[0_8px_30px_rgba(28,27,26,0.05),inset_0_1px_2px_rgba(255,255,255,0.9)]">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-ganh text-2xl sm:text-3xl leading-none font-bold tracking-wide text-deep-teal flex items-center focus:outline-none hover:opacity-85 transition-opacity"
          >
            Đồng ngôn
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = getIsActive(link.href);
            const showActiveState = mounted && isActive;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                      relative transition-all duration-200 flex items-center justify-center py-1.5
                      ${showActiveState ? "text-deep-teal font-semibold" : "text-on-surface-variant hover:text-deep-teal hover:opacity-100"}
                    `}
              >
                {showActiveState && (
                  <m.div
                    layoutId="active-line"
                    className="absolute bottom-[-2px] left-0 right-0 h-[2.5px] bg-deep-teal rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap font-sans text-[14.5px] tracking-wide font-medium">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Items */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            title="Tìm kiếm tác phẩm (Cmd+K)"
            className="hover:text-deep-teal transition-colors text-on-surface-variant flex items-center p-1.5 rounded-full hover:bg-surface-container-low focus:outline-none cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Viết Ngay */}
          <button
            onClick={handleWriteNow}
            disabled={isRedirecting}
            className="group font-sans font-semibold text-[14px] bg-deep-teal hover:bg-ink-charcoal text-white pl-5 pr-2.5 py-2 rounded-full transition-[transform,background-color] duration-[200ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>{isRedirecting ? "Đang tìm..." : "Viết Ngay"}</span>
            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-45 group-hover:bg-white/25">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </span>
          </button>

          {/* User Session Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() =>
                user ? setIsDropdownOpen(!isDropdownOpen) : router.push("/dang-nhap")
              }
              className={`
                relative transition-all duration-300 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-surface-container-low cursor-pointer
                ${mounted && isUserSectionActive ? "text-deep-teal bg-deep-teal/[0.04]" : "text-on-surface-variant"}
              `}
            >
              <span
                className={`font-sans text-[14.5px] font-medium whitespace-nowrap ${unreadCount > 0 ? "underline decoration-red-500 decoration-2 underline-offset-4" : ""}`}
              >
                {nickname || "Tài khoản"}
              </span>
              {user && (
                <svg
                  className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            <AnimatePresence>
              {isDropdownOpen && user && (
                <m.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformOrigin: "top right" }}
                  className="absolute right-0 mt-3 w-48 bg-[#FAF8F5]/90 backdrop-blur-xl border border-mist-grey/40 p-1.5 rounded-2xl shadow-[0_12px_32px_rgba(28,27,26,0.08)] z-50 overflow-hidden"
                >
                  <div className="bg-[#fcfaf8] rounded-[calc(16px-4px)] py-1.5 overflow-hidden flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                    {role === "admin" && (
                      <MenuLink
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-blue-600 border-b border-mist-grey/20"
                      >
                        Hệ thống
                      </MenuLink>
                    )}
                    <MenuLink
                      href={`/profile?id=${user?.id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="border-b border-mist-grey/20"
                    >
                      Hồ sơ
                    </MenuLink>
                    <MenuLink
                      href="/notification"
                      onClick={() => setIsDropdownOpen(false)}
                      className="border-b border-mist-grey/20"
                    >
                      <NotificationMenuItemContent />
                    </MenuLink>
                    <MenuLink
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="border-b border-mist-grey/20"
                    >
                      Cài đặt
                    </MenuLink>
                    <MenuButton onClick={handleLogout} className="text-red-600">
                      Đăng xuất
                    </MenuButton>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile/Medium Action Hamburger */}
        <div className="flex lg:hidden items-center gap-3">
          {/* Search on Mobile only */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden hover:text-deep-teal transition-colors text-on-surface-variant flex items-center p-1.5 rounded-full hover:bg-surface-container-low focus:outline-none cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((s) => !s)}
            className="relative w-10 h-10 rounded-full border border-ink-charcoal/[0.08] bg-white flex items-center justify-center text-ink-charcoal transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] shadow-sm group min-touch focus:outline-none cursor-pointer"
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            <div className="relative w-5 h-5 flex flex-col justify-center items-center">
              <span
                className={`absolute h-[1.5px] bg-ink-charcoal group-hover:bg-deep-teal transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMobileMenuOpen
                    ? "w-[16px] rotate-45 translate-y-0"
                    : "w-[16px] -translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-[1.5px] bg-ink-charcoal group-hover:bg-deep-teal transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMobileMenuOpen ? "w-0 opacity-0 scale-0" : "w-[12px] opacity-100"
                }`}
              />
              <span
                className={`absolute h-[1.5px] bg-ink-charcoal group-hover:bg-deep-teal transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMobileMenuOpen
                    ? "w-[16px] -rotate-45 translate-y-0"
                    : "w-[16px] translate-y-[4px]"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="navigation"
            aria-label="Menu chính"
            className="fixed inset-0 bg-surface/95 backdrop-blur-3xl z-[100] lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center py-4 px-6 relative z-10 w-full bg-transparent">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-ganh text-3xl leading-none font-bold tracking-wide text-deep-teal flex items-center focus:outline-none"
              >
                Đồng ngôn
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
                className="w-10 h-10 rounded-full border border-ink-charcoal/[0.08] bg-white flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] shadow-sm text-ink-charcoal min-touch hover:bg-surface-container-low cursor-pointer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col pb-20 justify-between">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => {
                  const isActive = getIsActive(link.href);
                  return (
                    <m.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          font-ganh text-3xl sm:text-4xl lg:text-[40px] leading-tight font-bold tracking-tight flex items-center justify-between active:scale-[0.98] transition-transform duration-200
                          ${isActive ? "text-deep-teal" : "text-on-surface-variant/50 hover:text-deep-teal"}
                        `}
                      >
                        {link.name}
                        {isActive && (
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-deep-teal ml-4"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14m-7-7l7 7-7 7" />
                          </svg>
                        )}
                      </Link>
                    </m.div>
                  );
                })}

                {/* Viết Ngay Button in Mobile Navigation */}
                <m.div variants={itemVariants}>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleWriteNow();
                    }}
                    disabled={isRedirecting}
                    className="w-full text-left font-ganh text-3xl sm:text-4xl lg:text-[40px] leading-tight font-bold tracking-tight text-primary hover:text-literary-gold transition-[colors,transform] duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>{isRedirecting ? "Đang tìm..." : "Viết Ngay"}</span>
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14m-7-7l7 7-7 7" />
                    </svg>
                  </button>
                </m.div>
              </nav>

              <div className="mt-auto">
                <div className="h-[1px] w-full bg-mist-grey/50 my-6" />

                <div className="flex flex-col gap-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full border border-mist-grey flex items-center justify-center bg-white shadow-sm">
                          <span className="font-semibold text-xl uppercase text-deep-teal font-ganh">
                            {nickname?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-semibold">
                            Thành viên
                          </span>
                          <span
                            className={`text-lg font-bold font-ganh leading-tight tracking-wide text-on-surface ${unreadCount > 0 ? "underline decoration-red-500 decoration-2 underline-offset-4" : ""}`}
                          >
                            {nickname}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-blue-600 font-semibold p-3 bg-white/60 rounded-xl border border-ink-charcoal/[0.08] text-center hover:bg-white active:scale-[0.98] transition-transform duration-200"
                          >
                            Hệ thống
                          </Link>
                        )}
                        <Link
                          href={`/profile?id=${user?.id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-on-surface-variant hover:text-on-surface font-medium p-3 bg-white/60 rounded-xl border border-ink-charcoal/[0.08] text-center hover:bg-white active:scale-[0.98] transition-transform duration-200"
                        >
                          Hồ sơ
                        </Link>
                        <Link
                          href="/notification"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-on-surface-variant hover:text-on-surface font-medium p-3 bg-white/60 rounded-xl border border-ink-charcoal/[0.08] text-center hover:bg-white active:scale-[0.98] transition-transform duration-200"
                        >
                          Thông báo {unreadCount > 0 && `(${unreadCount})`}
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-on-surface-variant hover:text-on-surface font-medium p-3 bg-white/60 rounded-xl border border-ink-charcoal/[0.08] text-center hover:bg-white active:scale-[0.98] transition-transform duration-200"
                        >
                          Cài đặt
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="mt-6 w-full py-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl font-semibold text-sm transition-[transform,colors] duration-200 active:scale-[0.98] cursor-pointer text-center"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 mt-auto">
                      <Link
                        href="/dang-nhap"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-3 bg-primary text-white text-center rounded-full font-semibold text-sm transition-all hover:bg-ink-charcoal shadow-sm active:scale-[0.98]"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/dang-ky"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-3 bg-white text-on-surface border border-mist-grey/60 text-center rounded-full font-semibold text-sm transition-all hover:bg-surface-container-low shadow-sm active:scale-[0.98]"
                      >
                        Tạo tài khoản
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </m.header>
  );
};

export default Header;
