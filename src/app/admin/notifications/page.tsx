"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Landmark,
  Shield,
  Eye,
  ExternalLink,
} from "lucide-react";

export interface AuthorityNotificationItem {
  id: number;
  eventType: string;
  complaintId?: string | null;
  citizenId?: string | null;
  authorityId?: string | null;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AuthorityNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "COMPLAINTS" | "ESCALATED" | "RESOLVED" | "SLA_WARNING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/authority/notifications?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load authority notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      setActionInProgress(id);
      const res = await fetch("/api/authority/notifications", {
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

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/authority/notifications", {
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

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "UNREAD" && item.isRead) return false;
    if (filter === "COMPLAINTS" && !["COMPLAINT_REGISTERED", "COMPLAINT_ACCEPTED", "ASSIGNED"].includes(item.eventType)) return false;
    if (filter === "ESCALATED" && item.eventType !== "ESCALATED") return false;
    if (filter === "RESOLVED" && item.eventType !== "RESOLVED") return false;
    if (filter === "SLA_WARNING" && item.eventType !== "SLA_WARNING") return false;

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
          label: "Complaint Lodged",
          badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
        };
      case "COMPLAINT_ACCEPTED":
        return {
          icon: CheckCircle2,
          label: "Accepted",
          badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
        };
      case "ASSIGNED":
        return {
          icon: UserCheck,
          label: "Department Assigned",
          badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
        };
      case "ESCALATED":
        return {
          icon: ShieldAlert,
          label: "Tier Escalation",
          badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse",
        };
      case "RESOLVED":
        return {
          icon: CheckCheck,
          label: "Resolved",
          badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
        };
      case "SLA_WARNING":
        return {
          icon: AlertTriangle,
          label: "Critical SLA Warning",
          badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 animate-pulse",
        };
      case "REMARK_ADDED":
        return {
          icon: MessageSquare,
          label: "Official Remark",
          badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
        };
      default:
        return {
          icon: Bell,
          label: "System Event",
          badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300",
        };
    }
  };

  const escalatedCount = notifications.filter((n) => n.eventType === "ESCALATED").length;
  const resolvedCount = notifications.filter((n) => n.eventType === "RESOLVED").length;
  const slaWarningCount = notifications.filter((n) => n.eventType === "SLA_WARNING").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              Authority Notification & Dispatch Stream
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Real-time administrative feed of newly registered grievances, departmental assignments, SLA threshold escalations, and resolution audits across all 23 municipal wards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase block">Total Dispatches</span>
          <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{notifications.length}</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase block">Unread Dispatches</span>
          <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{unreadCount}</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase block">Escalation Events</span>
          <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{escalatedCount}</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Resolved Audits</span>
          <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "ALL"
                ? "bg-[#064E4A] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            All Events ({notifications.length})
          </button>

          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              filter === "UNREAD"
                ? "bg-rose-700 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            <span>Unread</span>
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
            Complaints Lodged
          </button>

          <button
            onClick={() => setFilter("ESCALATED")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "ESCALATED"
                ? "bg-[#064E4A] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Escalations ({escalatedCount})
          </button>

          <button
            onClick={() => setFilter("RESOLVED")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filter === "RESOLVED"
                ? "bg-[#064E4A] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, IDs..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#064E4A]"
          />
        </div>
      </div>

      {/* Dispatches List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-xs text-gray-500 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#064E4A] dark:text-teal-400" />
            <p>Fetching official authority notifications stream...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-gray-400 mx-auto" />
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">No events found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No municipal dispatches currently match your active filters or search criteria.
            </p>
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
                    ? "border-teal-300 dark:border-teal-800 bg-teal-50/15 dark:bg-teal-950/20 ring-1 ring-teal-500/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${badge.badgeClass}`}>
                    <BadgeIcon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge.badgeClass}`}>
                        {badge.label}
                      </span>

                      <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(n.createdAt).toLocaleString("en-IN")}</span>
                      </span>

                      {!n.isRead && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-600 text-white uppercase tracking-wider">
                          Unread
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug">
                      {n.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {n.message}
                    </p>

                    {n.complaintId && (
                      <div className="pt-1 flex items-center gap-3 text-xs">
                        <span className="font-mono text-[11px] text-teal-800 dark:text-teal-300 font-bold">
                          Grievance #{n.complaintId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 w-full sm:w-auto justify-end">
                  {n.complaintId && (
                    <Link
                      href={`/admin/complaints?search=${encodeURIComponent(n.complaintId)}`}
                      onClick={() => {
                        if (!n.isRead) handleMarkAsRead(n.id);
                      }}
                      className="px-3.5 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
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
                      <span>Audited</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
