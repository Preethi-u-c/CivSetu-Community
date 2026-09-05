"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, PhoneCall, User, Menu, X } from "lucide-react";
import { useAccessibility } from "@/context/AccessibilityContext";

export const NavBar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useAccessibility();
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

        {/* Right Side: Login Button (Civic Gold Pill) */}
        <div className="flex items-center">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#B98519] hover:bg-[#9E7013] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow"
          >
            <User className="w-4 h-4" />
            <span>{t.nav.login}</span>
          </Link>
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
        </div>
      )}
    </nav>
  );
};
