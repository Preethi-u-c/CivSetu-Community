"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MapPin,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Bell,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Settings,
  ChevronRight,
  Sliders,
} from "lucide-react";

interface SummaryCounts {
  totalCitizens: number;
  totalWards: number;
  totalComplaints: number;
  openComplaints: number;
  escalatedComplaints: number;
  resolvedComplaints: number;
  activeAuthorities: number;
  publishedNotices: number;
}

interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeVariant?: "info" | "warning" | "success" | "danger";
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<SummaryCounts | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCounts(data.data.counts);
          setRecentActivity(data.data.recentActivity || []);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const statCards = [
    {
      title: "Total Citizens",
      value: counts?.totalCitizens ?? 0,
      description: "Registered civic profiles in Lakshmeshwar",
      icon: Users,
      href: "/admin/citizens",
      color: "from-teal-600/20 to-teal-800/10 border-teal-700/40 text-teal-400",
      pill: "Verified Citizens",
    },
    {
      title: "Total Wards",
      value: counts?.totalWards ?? 23,
      description: "Official municipal administrative wards",
      icon: MapPin,
      href: "/admin/wards",
      color: "from-amber-600/20 to-amber-800/10 border-amber-700/40 text-amber-400",
      pill: "23 Wards Active",
    },
    {
      title: "Total Complaints",
      value: counts?.totalComplaints ?? 0,
      description: "Lifetime grievances registered in portal",
      icon: FileText,
      href: "/admin/complaints",
      color: "from-blue-600/20 to-blue-800/10 border-blue-700/40 text-blue-400",
      pill: "Grievances Lodged",
    },
    {
      title: "Open Complaints",
      value: counts?.openComplaints ?? 0,
      description: "Grievances under active departmental action",
      icon: Clock,
      href: "/admin/complaints?status=In Progress",
      color: "from-amber-500/20 to-orange-800/10 border-amber-600/40 text-amber-300",
      pill: "Pending SLA",
    },
    {
      title: "Escalated Complaints",
      value: counts?.escalatedComplaints ?? 0,
      description: "Breached grievances escalated to Taluk/District",
      icon: AlertTriangle,
      href: "/admin/complaints?status=Escalated",
      color: "from-rose-600/20 to-rose-900/10 border-rose-700/40 text-rose-400",
      pill: "High Priority",
    },
    {
      title: "Resolved Complaints",
      value: counts?.resolvedComplaints ?? 0,
      description: "Completed grievances with resolution notes",
      icon: CheckCircle2,
      href: "/admin/complaints?status=Resolved",
      color: "from-emerald-600/20 to-emerald-800/10 border-emerald-700/40 text-emerald-400",
      pill: "Closed & Audited",
    },
    {
      title: "Active Authorities",
      value: counts?.activeAuthorities ?? 0,
      description: "Municipal officers across 4 governance tiers",
      icon: ShieldCheck,
      href: "/admin/authorities",
      color: "from-purple-600/20 to-purple-800/10 border-purple-700/40 text-purple-400",
      pill: "Officers Active",
    },
    {
      title: "Published Notices",
      value: counts?.publishedNotices ?? 0,
      description: "Gazette circulars active on public portal",
      icon: Bell,
      href: "/admin/notices",
      color: "from-cyan-600/20 to-cyan-800/10 border-cyan-700/40 text-cyan-400",
      pill: "Public Directives",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Administrative Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-teal-300 mt-1">
            Real-time status across Lakshmeshwar Town Municipal Council operations, citizens, and civic workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 text-xs font-bold border border-gray-300 dark:border-teal-700/60 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-bold shadow-md transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Deep Analytics</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-5 rounded-2xl bg-white dark:bg-gradient-to-br ${card.color} border shadow-sm hover:shadow-md hover:scale-[1.01] transition flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-teal-950/60 border border-gray-200 dark:border-teal-800/80">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-teal-950/80 text-gray-600 dark:text-teal-200 border border-gray-200 dark:border-teal-800/60">
                    {card.pill}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-teal-300">
                  {card.title}
                </h3>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-teal-900/60 animate-pulse rounded" />
                  ) : (
                    card.value.toLocaleString()
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-teal-800/40 flex items-center justify-between text-[11px] text-gray-500 dark:text-teal-300 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition">
                <span>{card.description}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Action Shortcuts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions */}
        <div className="bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-teal-800/60">
            <Sliders className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Quick Administration</h2>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/admin/citizens"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-gray-200 dark:border-teal-800/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Manage Citizen Profiles</p>
                  <p className="text-[11px] text-gray-500 dark:text-teal-300">Search, verify wards and complaint histories</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-300 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/admin/wards"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-gray-200 dark:border-teal-800/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">23 Municipal Wards</p>
                  <p className="text-[11px] text-gray-500 dark:text-teal-300">Monitor ward populations and complaint loads</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/admin/escalation-settings"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-gray-200 dark:border-teal-800/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Escalation & SLA Rules</p>
                  <p className="text-[11px] text-gray-500 dark:text-teal-300">Local Authority → Taluk → District tiers</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600 dark:group-hover:text-rose-300 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 hover:bg-teal-50 dark:hover:bg-teal-900/40 border border-gray-200 dark:border-teal-800/60 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">System Governance</p>
                  <p className="text-[11px] text-gray-500 dark:text-teal-300">Address, helpline 1912 & emergency controls</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Activity Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-teal-800/60">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Administrative Activity</h2>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-teal-300">Audit timeline</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-teal-950/40 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-teal-300 text-xs">
              No recent operational events recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-teal-800/40">
              {recentActivity.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.badgeVariant === "success"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : item.badgeVariant === "danger"
                              ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800"
                              : item.badgeVariant === "warning"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-teal-200 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-teal-400 shrink-0 font-mono">
                    {new Date(item.timestamp).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
