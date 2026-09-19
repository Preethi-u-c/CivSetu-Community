"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, PhoneCall, User, UserPlus, LogOut, Menu, X } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useAuth } from "@/context/AuthContext";

export const NavBar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useAccessibility();
  const { citizen: currentUser, logout: handleLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: t.nav.home,
      href: "/",
      icon: Home,
      isActive: pathname === "/",
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
        <div className="hidden md:flex items-center gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isHomeActive = item.href === "/" && item.isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isHomeActive
                    ? "bg-[#064E4A] text-white shadow-sm hover:bg-[#0B6B63]"
                    : item.isActive
                    ? "bg-teal-50 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-300 font-bold"
                    : "text-gray-800 dark:text-gray-200 hover:text-[#064E4A] dark:hover:text-teal-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Right Side: Authenticated Citizen Dropdown / Logout OR Register & Login */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
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
                className="hidden sm:flex items-center gap-1.5 border border-[#064E4A] dark:border-teal-400 text-[#064E4A] dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 px-3.5 py-2 rounded-lg text-sm font-bold transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.nav.register || "Register"}</span>
              </Link>
              <Link
                href="/login"
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
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 bg-white dark:bg-[#071d1b] space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-600 rounded-md text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex gap-2">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#064E4A] dark:border-teal-400 text-[#064E4A] dark:text-teal-300 rounded-md text-sm font-bold"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.nav.register || "Register"}</span>
              </Link>
              <Link
                href="/login"
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
