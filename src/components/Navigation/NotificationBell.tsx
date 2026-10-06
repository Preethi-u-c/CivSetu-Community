"use client";

import React, { useState, useEffect, useRef } from "react";
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
  X,
  UserCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export interface NotificationItem {
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

interface NotificationBellProps {
  citizenId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ citizenId }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=8");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!citizenId) return;
    fetchNotifications();

    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [citizenId]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Mark single notification as read
  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
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
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
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
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case "COMPLAINT_REGISTERED":
        return {
          icon: FileText,
          label: "Submitted",
          badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
          iconColor: "text-sky-600 dark:text-sky-400",
        };
      case "COMPLAINT_ACCEPTED":
        return {
          icon: CheckCircle2,
          label: "Accepted",
          badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
          iconColor: "text-teal-600 dark:text-teal-400",
        };
      case "ASSIGNED":
        return {
          icon: UserCheck,
          label: "Assigned",
          badgeClass: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
          iconColor: "text-indigo-600 dark:text-indigo-400",
        };
      case "ESCALATED":
        return {
          icon: ShieldAlert,
          label: "Escalated",
          badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
          iconColor: "text-rose-600 dark:text-rose-400",
        };
      case "RESOLVED":
        return {
          icon: CheckCheck,
          label: "Resolved",
          badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
          iconColor: "text-emerald-600 dark:text-emerald-400",
        };
      case "REMARK_ADDED":
        return {
          icon: MessageSquare,
          label: "Official Note",
          badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
          iconColor: "text-amber-600 dark:text-amber-400",
        };
      default:
        return {
          icon: Bell,
          label: "Update",
          badgeClass: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300",
          iconColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSecs < 60) return "just now";
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title="Civic Notifications"
        aria-label="Civic Notifications"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#064E4A] dark:text-teal-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold text-white bg-rose-600 rounded-full min-w-[18px] h-[18px] animate-pulse shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] bg-white dark:bg-[#071d1b] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-300" />
              <h4 className="font-bold text-sm">Complaint Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-teal-200 hover:text-white hover:underline flex items-center gap-1 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-teal-200 hover:text-white hover:bg-teal-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/80">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 space-y-2">
                <Clock className="w-5 h-5 mx-auto animate-spin text-[#064E4A] dark:text-teal-400" />
                <p>Loading your civic notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-6 text-center space-y-2 text-xs text-gray-500">
                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center mx-auto text-[#064E4A] dark:text-teal-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="font-bold text-gray-700 dark:text-gray-300">No notifications yet</p>
                <p className="text-[11px] text-gray-400">
                  You will receive real-time alerts when your grievances are registered, verified, assigned to departments, escalated, or resolved.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const config = getEventBadge(item.eventType);
                const Icon = config.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) handleMarkAsRead(item.id);
                    }}
                    className={`p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition cursor-pointer flex items-start gap-3 text-xs ${
                      !item.isRead ? "bg-teal-50/40 dark:bg-teal-950/20" : ""
                    }`}
                  >
                    {/* Event Icon */}
                    <div
                      className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${config.badgeClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${config.badgeClass}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </span>
                      </div>

                      <h5 className="font-bold text-gray-900 dark:text-gray-100 text-xs leading-snug">
                        {item.title}
                      </h5>

                      <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      {/* Complaint Track Action */}
                      <div className="pt-1 flex items-center justify-between">
                        {item.complaintId ? (
                          <Link
                            href={`/track?id=${encodeURIComponent(item.complaintId)}`}
                            prefetch={true}
                            onClick={() => {
                              if (!item.isRead) handleMarkAsRead(item.id);
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1 font-bold text-[#064E4A] dark:text-teal-300 hover:underline text-[11px]"
                          >
                            <span>Track #{item.complaintId}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span />
                        )}

                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            className="text-[10px] text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              href="/dashboard"
              prefetch={true}
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#064E4A] dark:text-teal-300 hover:underline inline-flex items-center gap-1"
            >
              <span>View All in Citizen Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
