"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  FileCheck,
  MessageSquare,
  Bell,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
} from "lucide-react";

interface DashboardStats {
  counts: {
    totalGrievances: number;
    pendingGrievances: number;
    resolvedGrievances: number;
    totalApplications: number;
    pendingApplications: number;
    totalFeedback: number;
    publishedNotices: number;
  };
  visitorStats: {
    totalVisitors: number;
    uniqueVisitors: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentGrievances, setRecentGrievances] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, grvRes, appsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/grievances"),
        fetch("/api/applications"),
      ]);

      const statsJson = await statsRes.json();
      const grvJson = await grvRes.json();
      const appsJson = await appsRes.json();

      if (statsJson.success) setStats(statsJson.data);
      if (grvJson.success) setRecentGrievances(grvJson.data.slice(0, 4));
      if (appsJson.success) setRecentApps(appsJson.data.slice(0, 4));
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            Municipal Operational Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Lakshmeshwar Town Municipal Council (Gadag Dist.) • Real-Time Civic Oversight
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/70 dark:bg-teal-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300">Grievances</span>
            <AlertCircle className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">
            {stats?.counts.totalGrievances ?? 0}
          </p>
          <p className="text-[11px] text-teal-700 dark:text-teal-400 mt-0.5 font-medium">
            {stats?.counts.pendingGrievances ?? 0} Pending Redressal
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">
            {stats?.counts.resolvedGrievances ?? 0}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
            Tickets Closed
          </p>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Applications</span>
            <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">
            {stats?.counts.totalApplications ?? 0}
          </p>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5 font-medium">
            {stats?.counts.pendingApplications ?? 0} In Progress
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Suggestions</span>
            <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">
            {stats?.counts.totalFeedback ?? 0}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
            Citizen Post-Backs
          </p>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/70 dark:bg-purple-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">Gazette Notices</span>
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">
            {stats?.counts.publishedNotices ?? 0}
          </p>
          <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5 font-medium">
            Published Online
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Live Visitors</span>
            <Users className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-2">
            {stats?.visitorStats.totalVisitors ?? 0}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
            {stats?.visitorStats.uniqueVisitors ?? 0} Unique Citizens
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/grievances"
          className="p-4 rounded-xl bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 hover:border-[#064E4A] hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Grievance Desk</h3>
            <p className="text-xs text-gray-500 mt-0.5">Assign & resolve citizen complaints</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/admin/applications"
          className="p-4 rounded-xl bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 hover:border-[#064E4A] hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Service Applications</h3>
            <p className="text-xs text-gray-500 mt-0.5">Water, building & trade forms</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/admin/notices"
          className="p-4 rounded-xl bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 hover:border-[#064E4A] hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Publish Notice</h3>
            <p className="text-xs text-gray-500 mt-0.5">Draft English & Kannada gazettes</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/track"
          target="_blank"
          className="p-4 rounded-xl bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 hover:border-[#064E4A] hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Public Tracker</h3>
            <p className="text-xs text-gray-500 mt-0.5">Test public status lookup tool</p>
          </div>
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] transition" />
        </Link>
      </div>

      {/* Two-Column Section: Recent Grievances + Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grievances */}
        <div className="bg-white dark:bg-[#061817] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
              <span>Recent Civic Grievances</span>
            </h2>
            <Link
              href="/admin/grievances"
              className="text-xs font-semibold text-[#064E4A] dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentGrievances.map((g) => (
              <div
                key={g.id}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#064E4A] dark:text-teal-400">
                      {g.id}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-700 font-semibold">
                      {g.wardNumber ? `Ward ${g.wardNumber}` : "General"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1 line-clamp-1">
                    {g.subject}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    By: {g.citizenName} • {g.category}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    g.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : g.status === "IN_PROGRESS"
                      ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {g.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Service Applications */}
        <div className="bg-white dark:bg-[#061817] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
              <span>Recent Service Applications</span>
            </h2>
            <Link
              href="/admin/applications"
              className="text-xs font-semibold text-[#064E4A] dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentApps.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                      {a.id}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                      {a.serviceCode}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1 line-clamp-1">
                    {a.serviceName}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Applicant: {a.applicantName} ({a.mobileNumber})
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    a.status === "APPROVED" || a.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {a.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
