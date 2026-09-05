"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertCircle,
  FileCheck,
  MessageSquare,
  Bell,
  ArrowLeft,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Grievances Desk", href: "/admin/grievances", icon: AlertCircle },
    { name: "Applications", href: "/admin/applications", icon: FileCheck },
    { name: "Citizen Suggestions", href: "/admin/feedback", icon: MessageSquare },
    { name: "Gazette & Notices", href: "/admin/notices", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#041211] text-gray-900 dark:text-gray-100">
      {/* Top Advisory Bar */}
      <div className="bg-[#064E4A] text-white text-xs py-2 px-4 border-b border-teal-800">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-300" />
            <span className="font-bold">Lakshmeshwar TMC • Civic Administration Workspace</span>
            <span className="hidden sm:inline text-teal-200">|</span>
            <span className="hidden sm:inline text-teal-100">
              Phase 2 Operational Mode (Authentication deferred to Phase 3)
            </span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1 text-teal-200 hover:text-white transition font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Portal</span>
          </Link>
        </div>
      </div>

      {/* Admin Header & Nav Tabs */}
      <div className="bg-white dark:bg-[#061817] border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-20">
        <div className="max-w-[1380px] mx-auto px-4 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? "bg-[#064E4A] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-[#064E4A] dark:hover:text-teal-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Lakshmeshwar Municipal Council Desk</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1380px] mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
