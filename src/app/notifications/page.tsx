"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/AccessibilityContext";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Clock,
  ArrowRight,
  Check,
  CheckCheck,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Inbox,
  AlertCircle,
} from "lucide-react";

export interface CitizenNotification {
  id: number;
  eventType: string;
  complaintId?: string | null;
  citizenId?: string | null;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { citizen, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<CitizenNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "COMPLAINTS" | "ESCALATED" | "RESOLVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (citizen) {
      fetchNotifications();

      // Connect to real-time event stream to update notifications live
      let eventSource: EventSource | null = null;
      try {
        eventSource = new EventSource("/api/realtime/complaints");
        const handleLiveUpdate = () => {
          fetchNotifications();
        };

        eventSource.addEventListener("complaint_created", handleLiveUpdate);
        eventSource.addEventListener("complaint_updated", handleLiveUpdate);
        eventSource.addEventListener("complaint_resolved", handleLiveUpdate);
        eventSource.addEventListener("notice_published", handleLiveUpdate);
      } catch (e) {
        console.error("SSE connection error in notifications:", e);
      }

      return () => {
        if (eventSource) eventSource.close();
      };
    }
  }, [citizen]);

  // Mark single as read
  const handleMarkAsRead = async (id: number) => {
    try {
      setActionInProgress(id);
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Filter & Search Logic
  const filteredNotifications = notifications.filter((item) => {
    // 1. Tab filter
    if (filter === "UNREAD" && item.isRead) return false;
    if (filter === "COMPLAINTS" && !item.complaintId) return false;
    if (filter === "ESCALATED" && item.eventType !== "ESCALATED") return false;
    if (filter === "RESOLVED" && item.eventType !== "RESOLVED") return false;

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      const matchCmp = item.complaintId?.toLowerCase().includes(q);
      const matchType = item.eventType.toLowerCase().includes(q);
      return matchTitle || matchMsg || matchCmp || matchType;
    }

    return true;
  });

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "COMPLAINT_REGISTERED":
        return {
          icon: FileText,
          label: "Submitted",
          badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
        };
      case "COMPLAINT_ACCEPTED":
        return {
          icon: CheckCircle2,
          label: "Formally Accepted",
          badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
        };
      case "ASSIGNED":
        return {
          icon: UserCheck,
          label: "Assigned to Dept",
          badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
        };
      case "ESCALATED":
        return {
          icon: ShieldAlert,
          label: "Escalated",
          badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse",
        };
      case "RESOLVED":
        return {
          icon: CheckCheck,
          label: "Resolved",
          badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
        };
      case "REMARK_ADDED":
        return {
          icon: MessageSquare,
          label: "Official Remark",
          badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
        };
      case "STATUS_UPDATED":
        return {
          icon: RefreshCw,
          label: "Status Updated",
          badgeClass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300",
        };
      default:
        return {
          icon: Bell,
          label: "Civic Update",
          badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300",
        };
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Auth Loading
  if (authLoading) {
    return (
      <PageContainer
        title="Notification Center"
        subtitle="Loading your official notifications..."
        breadcrumbs={[{ label: "Notifications" }]}
      >
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading citizen notification center...</p>
        </div>
      </PageContainer>
    );
  }

  // Unauthenticated State
  if (!isAuthenticated || !citizen) {
    return (
      <PageContainer
        title="Notification Center"
        subtitle="Official Municipal Alerts & Grievance Notifications"
        breadcrumbs={[{ label: "Notifications" }]}
      >
        <div className="max-w-md mx-auto py-10">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Citizen Login Required
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Please log in to your verified Lakshmeshwar citizen account to view real-time complaint notifications, departmental updates, and SLA tracking alerts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/login?redirect=/notifications"
                className="flex-1 py-2.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl shadow-sm transition text-center"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition text-center"
              >
                Register Citizen ID
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const escalatedCount = notifications.filter((n) => n.eventType === "ESCALATED").length;
  const resolvedCount = notifications.filter((n) => n.eventType === "RESOLVED").length;
  const complaintCount = notifications.filter((n) => Boolean(n.complaintId)).length;

  return (
    <PageContainer
      title="Notification Center"
      subtitle={`Official municipal alerts for ${citizen.fullName} (Ward: ${citizen.wardNumber})`}
      breadcrumbs={[{ label: "Citizen Portal", href: "/dashboard" }, { label: "Notifications" }]}
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="bg-gradient-to-r from-[#064E4A] to-[#0B6B63] text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                <Bell className="w-5 h-5 text-teal-200" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Civic Notification Desk
              </h2>
            </div>
            <p className="text-xs text-teal-100/90 max-w-2xl leading-relaxed">
              Real-time audit log of your complaints: registration, formal TMC acceptance, junior engineer assignment, SLA tier escalations, and official resolutions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center flex-shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 bg-white text-[#064E4A] hover:bg-teal-50 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{t.notifications?.markAllRead || "Mark All Read"} ({unreadCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-xs"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{t.buttons?.refresh || "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase block">Total Alerts</span>
            <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{notifications.length}</span>
          </div>

          <div className="bg-white dark:bg-[#071d1b] border border-rose-200 dark:border-rose-900/60 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Unread Alerts</span>
            <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400">{unreadCount}</span>
          </div>

          <div className="bg-white dark:bg-[#071d1b] border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase block">Complaint Events</span>
            <span className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400">{complaintCount}</span>
          </div>

          <div className="bg-white dark:bg-[#071d1b] border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Resolved Cases</span>
            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{resolvedCount}</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filter === "ALL"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {t.notifications?.all || "All"} ({notifications.length})
              </button>

              <button
                onClick={() => setFilter("UNREAD")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  filter === "UNREAD"
                    ? "bg-rose-700 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <span>{t.notifications?.unread || "Unread"}</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-extrabold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setFilter("COMPLAINTS")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filter === "COMPLAINTS"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {t.dashboard?.myComplaints || "Complaints"} ({complaintCount})
              </button>

              <button
                onClick={() => setFilter("ESCALATED")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filter === "ESCALATED"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {t.dashboard?.statsEscalated || "Escalated"} ({escalatedCount})
              </button>

              <button
                onClick={() => setFilter("RESOLVED")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  filter === "RESOLVED"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {t.dashboard?.statsResolved || "Resolved"} ({resolvedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts or ID..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#064E4A]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List Stream */}
        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-xs text-gray-500 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064E4A] dark:text-teal-400" />
              <p>Fetching your official civic notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center mx-auto text-[#064E4A] dark:text-teal-300">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  No notifications match your current filter
                </h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {searchQuery
                    ? `No notifications found matching "${searchQuery}". Try clearing your search keyword.`
                    : "You will receive updates here as TMC officials accept, assign, escalate, and resolve your civic grievances."}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#064E4A] dark:text-teal-300 hover:underline"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const badge = getEventBadge(n.eventType);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={n.id}
                  className={`bg-white dark:bg-[#071d1b] border rounded-2xl p-4 sm:p-5 shadow-xs transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                    !n.isRead
                      ? "border-teal-300 dark:border-teal-800 bg-teal-50/20 dark:bg-teal-950/20 ring-1 ring-teal-500/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${badge.badgeClass}`}>
                      <BadgeIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>

                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateTime(n.createdAt)}</span>
                        </span>

                        {!n.isRead && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-600 text-white uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug">
                        {n.title}
                      </h4>

                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {n.message}
                      </p>

                      {/* Complaint Meta Tag */}
                      {n.complaintId && (
                        <div className="pt-1 flex items-center gap-2 text-xs">
                          <span className="text-gray-500 font-mono text-[11px]">
                            Grievance ID: <strong className="text-gray-800 dark:text-gray-200">{n.complaintId}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 w-full sm:w-auto justify-end">
                    {n.complaintId && (
                      <Link
                        href={`/track?id=${encodeURIComponent(n.complaintId)}`}
                        onClick={() => {
                          if (!n.isRead) handleMarkAsRead(n.id);
                        }}
                        className="px-3.5 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1"
                      >
                        <span>Track Status</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {!n.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n.id)}
                        disabled={actionInProgress === n.id}
                        className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-semibold px-2 py-1 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        <span>Read</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageContainer>
  );
}
