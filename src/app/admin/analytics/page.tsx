"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  GitFork,
  Users,
  Bell,
  RefreshCw,
  Loader2,
  MapPin,
  TrendingUp,
  Tags,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";

interface AnalyticsData {
  complaintsByCategory: Array<{ category: string; count: number }>;
  complaintsByWard: Array<{ ward: string; count: number }>;
  complaintStatusDistribution: Array<{ status: string; count: number }>;
  resolutionStats: {
    total: number;
    resolved: number;
    rate: number;
  };
  escalationStats: {
    total: number;
    escalated: number;
    rate: number;
  };
  noticesDistribution: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    emergency: number;
  };
  citizenStats: {
    total: number;
    verified: number;
    byWard: Array<{ ward: string; count: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) {
        throw new Error(`Failed to load analytics (status: ${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || "Unexpected analytics payload");
      }
    } catch (err: unknown) {
      console.error("Analytics fetch error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalComplaints = data?.resolutionStats.total || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Civic Operations & Grievance Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time administrative data metrics for municipal service performance across Lakshmeshwar TMC wards.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-teal-800 hover:bg-gray-100 dark:hover:bg-teal-900/40 text-gray-700 dark:text-teal-200 transition"
          aria-label="Refresh analytics data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-amber-400" />
          <p className="text-sm font-medium text-gray-500 dark:text-teal-300">
            Compiling municipal grievance and demographic statistics...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white dark:bg-[#062422] rounded-xl border border-red-200 dark:border-red-900/60 p-10 text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-sm font-bold text-red-600 dark:text-red-400">
            Failed to Compute Analytics
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && !error && data && (
        <>
          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#062422] p-5 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Complaints
                </span>
                <span className="p-2 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                {totalComplaints}
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                <span>All time recorded</span>
              </p>
            </div>

            <div className="bg-white dark:bg-[#062422] p-5 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resolution Rate
                </span>
                <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                {data.resolutionStats.rate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.resolutionStats.resolved} of {totalComplaints} complaints resolved
              </p>
            </div>

            <div className="bg-white dark:bg-[#062422] p-5 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Escalation Rate
                </span>
                <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <GitFork className="w-4 h-4" />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                {data.escalationStats.rate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.escalationStats.escalated} escalated to higher authority
              </p>
            </div>

            <div className="bg-white dark:bg-[#062422] p-5 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Registered Citizens
                </span>
                <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                {data.citizenStats.total}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                {data.citizenStats.verified} verified phone profiles
              </p>
            </div>
          </div>

          {/* Section 1: Complaint Breakdown (Categories & Statuses) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-teal-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <Tags className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Complaints by Category
                  </h2>
                </div>
                <span className="text-xs text-gray-400">{data.complaintsByCategory.length} categories</span>
              </div>

              {data.complaintsByCategory.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No category data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.complaintsByCategory.map((item) => {
                    const pct = totalComplaints > 0 ? Math.round((item.count / totalComplaints) * 100) : 0;
                    return (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-700 dark:text-teal-200 truncate">
                            {item.category}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {item.count}{" "}
                            <span className="text-gray-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-teal-950 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* By Status */}
            <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-teal-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Complaint Status Distribution
                  </h2>
                </div>
                <span className="text-xs text-gray-400">Workflow pipeline</span>
              </div>

              {data.complaintStatusDistribution.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No status data recorded yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {data.complaintStatusDistribution.map((item) => {
                    let badgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
                    if (item.status === "Resolved") {
                      badgeClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";
                    } else if (item.status === "Escalated") {
                      badgeClass = "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800";
                    } else if (item.status === "In Progress") {
                      badgeClass = "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800";
                    } else if (item.status === "Submitted") {
                      badgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
                    }

                    return (
                      <div
                        key={item.status}
                        className={`p-3 rounded-xl flex flex-col justify-between ${badgeClass}`}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {item.status}
                        </span>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="text-2xl font-black">{item.count}</span>
                          <span className="text-[10px] opacity-80">
                            {totalComplaints > 0 ? Math.round((item.count / totalComplaints) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Ward Distribution & Gazettes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Grievance Wards */}
            <div className="lg:col-span-2 bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-teal-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Grievance Distribution Across Wards
                  </h2>
                </div>
                <span className="text-xs text-gray-400">Lakshmeshwar TMC (23 Wards)</span>
              </div>

              {data.complaintsByWard.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center">No ward grievance data recorded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {data.complaintsByWard.map((w) => {
                    const pct = totalComplaints > 0 ? Math.round((w.count / totalComplaints) * 100) : 0;
                    return (
                      <div
                        key={w.ward}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-100 dark:border-teal-900/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-800 dark:text-white truncate">
                            {w.ward}
                          </span>
                          <span className="font-bold text-teal-700 dark:text-amber-400">
                            {w.count}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-teal-950 overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(8, pct * 2))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bulletins & Notices Distribution */}
            <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-teal-900/60 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Municipal Notices
                  </h2>
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-amber-400">
                  {data.noticesDistribution.total} Total
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                      Published
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {data.noticesDistribution.published}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-teal-400" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-teal-200">
                      Drafts
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-700 dark:text-white">
                    {data.noticesDistribution.draft}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-xs font-semibold text-red-900 dark:text-red-200">
                      Emergency Bulletins
                    </span>
                  </div>
                  <span className="text-sm font-bold text-red-700 dark:text-red-300">
                    {data.noticesDistribution.emergency}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-teal-300">
                      Archived
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {data.noticesDistribution.archived}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
