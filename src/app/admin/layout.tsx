"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShieldCheck,
  FileText,
  Tags,
  Bell,
  Bookmark,
  GitFork,
  BarChart3,
  Settings,
  LogOut,
  Landmark,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) {
          if (isMounted) {
            router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
          return;
        }
        const data = await res.json();
        if (data.success && data.authenticated && data.admin) {
          if (isMounted) {
            setAdmin(data.admin);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        console.error("Admin auth check error:", err);
        if (isMounted) {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    router.replace("/admin/login");
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#041211] text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-800/40 border border-teal-600 flex items-center justify-center animate-pulse">
            <Landmark className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-teal-200 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Verifying administrative authorization...</span>
          </div>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Civic Registry",
      items: [
        { name: "Citizens", href: "/admin/citizens", icon: Users },
        { name: "Wards (23)", href: "/admin/wards", icon: MapPin },
        { name: "Authorities", href: "/admin/authorities", icon: ShieldCheck },
      ],
    },
    {
      label: "Grievance Operations",
      items: [
        { name: "Complaints", href: "/admin/complaints", icon: FileText },
        { name: "Complaint Categories", href: "/admin/complaint-categories", icon: Tags },
        { name: "Escalation Settings", href: "/admin/escalation-settings", icon: GitFork },
      ],
    },
    {
      label: "Gazette & Bulletins",
      items: [
        { name: "Notices", href: "/admin/notices", icon: Bell },
        { name: "Notice Categories", href: "/admin/notice-categories", icon: Bookmark },
      ],
    },
    {
      label: "Configuration",
      items: [
        { name: "System Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F4] dark:bg-[#041211] text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Top Banner */}
      <header className="bg-[#042F2E] text-white text-xs py-2 px-4 border-b border-teal-900/60 sticky top-0 z-40">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 rounded hover:bg-teal-800 text-teal-200 hover:text-white transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wide">
                LAKSHMESHWAR TOWN MUNICIPAL COUNCIL • ADMINISTRATIVE PORTAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/authority/dashboard"
              className="hidden md:flex items-center gap-1 text-teal-300 hover:text-white transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Authority Desk</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1 text-teal-200 hover:text-white transition"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#064E4A] text-white border-r border-teal-900/40 p-4 shrink-0 shadow-lg justify-between">
          <div>
            {/* Council Branding */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-teal-700/60">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-inner">
                <Landmark className="w-5 h-5 text-amber-300" />
              </div>
              <div className="leading-tight">
                <h2 className="font-bold text-sm tracking-wide text-white">CivSetu Admin</h2>
                <p className="text-[11px] text-teal-200">Lakshmeshwar TMC</p>
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-4">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-teal-300/80">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin/dashboard"
                        ? pathname === "/admin" || pathname === "/admin/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? "bg-teal-950/80 text-amber-300 shadow-inner border border-teal-600/40"
                            : "text-teal-100 hover:text-white hover:bg-teal-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-teal-300"}`} />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Admin User Chip & Logout */}
          <div className="pt-4 border-t border-teal-700/60 space-y-3">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-teal-900/60 border border-teal-800">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-xs font-bold">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-white">
                  {admin?.fullName || "System Administrator"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {admin?.role || "SYSTEM_ADMIN"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-900/40 hover:bg-red-950/60 text-teal-200 hover:text-red-300 text-xs font-bold border border-teal-800 hover:border-red-800/60 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-[#064E4A] text-white flex flex-col p-4 shadow-2xl justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-teal-700/60">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-300" />
                    <span className="font-bold text-sm">CivSetu Admin</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded hover:bg-teal-800 text-teal-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-4">
                  {navGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                      <div className="px-2 text-[10px] uppercase font-bold text-teal-300">
                        {group.label}
                      </div>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          item.href === "/admin/dashboard"
                            ? pathname === "/admin" || pathname === "/admin/dashboard"
                            : pathname.startsWith(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                              isActive
                                ? "bg-teal-950 text-amber-300 border border-teal-600/40"
                                : "text-teal-100 hover:bg-teal-800"
                            }`}
                          >
                            <Icon className="w-4 h-4 text-amber-400" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-teal-700/60 mt-4 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/60 text-red-300 text-xs font-bold border border-red-800/60"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
