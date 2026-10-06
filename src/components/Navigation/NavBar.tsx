"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Info, PhoneCall, User, UserPlus, LogOut, Menu, X, Bell, Newspaper, CalendarDays, Landmark, Briefcase, Sparkles, Languages } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "./NotificationBell";

export const NavBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useAccessibility();
  const { citizen: currentUser, logout: handleLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Proactively prefetch common navigation routes on mount so transitions are instant
  useEffect(() => {
    ["/services", "/notices", "/news", "/events", "/schemes", "/ask-civsetu", "/contact", "/dashboard", "/login"].forEach(
      (path) => {
        try {
          router.prefetch(path);
        } catch {}
      }
    );
  }, [router]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    {
      name: t.nav.home,
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: t.nav.services,
      href: "/services",
      icon: Briefcase,
      isActive: pathname.startsWith("/services") || pathname.startsWith("/citizen-services"),
    },
    {
      name: t.nav.announcements,
      href: "/notices",
      icon: Bell,
      isActive: pathname.startsWith("/notices"),
    },
    {
      name: t.nav.news,
      href: "/news",
      icon: Newspaper,
      isActive: pathname.startsWith("/news"),
    },
    {
      name: t.nav.events,
      href: "/events",
      icon: CalendarDays,
      isActive: pathname.startsWith("/events"),
    },
    {
      name: t.nav.schemes,
      href: "/schemes",
      icon: Landmark,
      isActive: pathname.startsWith("/schemes"),
    },
    {
      name: t.nav.askCivsetu,
      href: "/ask-civsetu",
      icon: Sparkles,
      isActive: pathname.startsWith("/ask-civsetu"),
    },
    {
      name: t.nav.aboutUs,
      href: "/about",
      icon: Info,
      isActive: pathname === "/about",
    },
    {
      name: t.nav.contactUs,
      href: "/contact",
      icon: PhoneCall,
      isActive: pathname === "/contact",
    },
  ];

  return (
    <nav className="bg-white dark:bg-[#061817] shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-[1380px] mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Desktop Navigation Links */}
        <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHomeActive = item.href === "/" && item.isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs 2xl:text-sm font-semibold transition-all ${
                  isHomeActive
                    ? "bg-[#064E4A] text-white shadow-sm hover:bg-[#0B6B63]"
                    : item.isActive
                    ? "bg-teal-50 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-300 font-bold"
                    : "text-gray-800 dark:text-gray-200 hover:text-[#064E4A] dark:hover:text-teal-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 shrink-0" />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile & Tablet Hamburger Button */}
        <div className="flex xl:hidden items-center gap-1.5">
          {currentUser && <NotificationBell citizenId={currentUser.id} />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Right Side: Desktop Language Selector + Citizen Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Language Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <Languages className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 ml-1 mr-0.5" />
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 text-xs font-bold rounded-md transition ${
                language === "en"
                  ? "bg-[#064E4A] text-white shadow-xs"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#064E4A] dark:hover:text-teal-300"
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("kn")}
              className={`px-2 py-1 text-xs font-bold rounded-md transition font-kannada ${
                language === "kn"
                  ? "bg-[#064E4A] text-white shadow-xs"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#064E4A] dark:hover:text-teal-300"
              }`}
              title="ಕನ್ನಡ (Kannada)"
            >
              ಕನ್ನಡ
            </button>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 py-1 text-xs font-bold rounded-md transition font-hindi ${
                language === "hi"
                  ? "bg-[#064E4A] text-white shadow-xs"
                  : "text-gray-700 dark:text-gray-300 hover:text-[#064E4A] dark:hover:text-teal-300"
              }`}
              title="हिंदी (Hindi)"
            >
              हिंदी
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <NotificationBell citizenId={currentUser.id} />
              <Link
                href="/dashboard"
                prefetch={true}
                className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 px-3 py-2 rounded-lg text-sm font-bold transition-all"
                title="Citizen Portal Dashboard"
              >
                <User className="w-4 h-4" />
                <span className="max-w-[130px] truncate">{currentUser.fullName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-2 rounded-lg text-sm font-semibold transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/register"
                prefetch={true}
                className="hidden sm:flex items-center gap-1.5 border border-[#064E4A] dark:border-teal-400 text-[#064E4A] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 px-3.5 py-2 rounded-lg text-sm font-bold transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.nav.register || "Register"}</span>
              </Link>
              <Link
                href="/login"
                prefetch={true}
                className="flex items-center gap-2 bg-[#B98519] hover:bg-[#9E7013] text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow"
              >
                <User className="w-4 h-4" />
                <span>{t.nav.login}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-[#071d1b] space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={item.isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium ${
                  item.isActive
                    ? "bg-[#064E4A] text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Mobile Language Switcher */}
          <div className="pt-2 pb-1 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Select Language / ಭಾಷೆ / भाषा:</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`py-1.5 text-xs font-semibold rounded text-center transition ${
                  language === "en"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("kn")}
                className={`py-1.5 text-xs font-semibold rounded text-center transition font-kannada ${
                  language === "kn"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`py-1.5 text-xs font-semibold rounded text-center transition font-hindi ${
                  language === "hi"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {currentUser ? (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300 rounded-md text-sm font-bold"
              >
                <User className="w-4 h-4" />
                <span className="truncate">{currentUser.fullName}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 rounded-md text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.nav.logout}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <Link
                href="/register"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#064E4A] dark:border-teal-400 text-[#064E4A] dark:text-teal-300 rounded-md text-sm font-bold"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.nav.register || "Register"}</span>
              </Link>
              <Link
                href="/login"
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#B98519] hover:bg-[#9E7013] text-white rounded-md text-sm font-bold"
              >
                <User className="w-4 h-4" />
                <span>{t.nav.login}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
