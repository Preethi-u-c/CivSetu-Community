"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  LayoutDashboard,
  Inbox,
  UserCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Bell,
  Megaphone,
  User,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Hourglass,
  Calendar,
  MapPin,
  ChevronRight,
  X,
  Send,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRight,
  Menu,
  Plus,
  Trash2,
  Archive,
  Eye,
  CheckCheck,
  FileText,
  Bookmark,
  Share2,
} from "lucide-react";
import { ComplaintRecord, ComplaintTimelineEvent } from "@/lib/db/complaints";
import { SafeAuthorityUser, DepartmentOption } from "@/lib/db/authority";
import { NoticeRecord } from "@/lib/db/notices";

export default function AuthorityDashboardPage() {
  // 1. Authentication & Officer State
  const [officer, setOfficer] = useState<SafeAuthorityUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "complaints" | "assigned" | "escalated" | "nearDeadline" | "resolved" | "announcements" | "notifications" | "profile"
  >("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 3. Complaints & Stats State
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    nearDeadline: 0,
    escalated: 0,
    resolved: 0,
    overdue: 0,
    assigned: 0,
    underReview: 0,
  });
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 4. Complaints Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [slaStateFilter, setSlaStateFilter] = useState<"ALL" | "on_track" | "near_deadline" | "overdue">("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // 5. Selected Complaint for Detail View & Actions Modal
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimelineEvent[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 6. Action Form States
  const [remarkInput, setRemarkInput] = useState("");
  const [resolutionInput, setResolutionInput] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [assignDept, setAssignDept] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [activeActionModal, setActiveActionModal] = useState<"assign" | "escalate" | "resolve" | null>(null);

  // 7. Gazette & Notices State
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [noticeStats, setNoticeStats] = useState({ total: 0, published: 0, draft: 0, archived: 0, emergency: 0 });
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [noticeStatusFilter, setNoticeStatusFilter] = useState("ALL");
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState("ALL");
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);
  const [noticeActionLoading, setNoticeActionLoading] = useState(false);
  const [noticeActionMsg, setNoticeActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notice Creation Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDescription, setNoticeDescription] = useState("");
  const [noticeCategory, setNoticeCategory] = useState("Public Notice");
  const [noticeScope, setNoticeScope] = useState<
    "All citizens" | "Specific ward(s)" | "Entire municipality" | "Emergency / city-wide" | "Entire Municipality" | "Specific Wards"
  >("All citizens");
  const [noticeSelectedWards, setNoticeSelectedWards] = useState<string[]>([]);
  const [noticePriority, setNoticePriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [noticeIsEmergency, setNoticeIsEmergency] = useState(false);
  const [noticeStatus, setNoticeStatus] = useState<"Draft" | "Published">("Published");
  const [noticeExpiryDate, setNoticeExpiryDate] = useState("");

  // 8. Notifications / Alerts State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState(false);

  // 9. Real-time Live SSE Sync State
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [liveAlert, setLiveAlert] = useState<{
    id: string;
    type: "complaint_created" | "complaint_updated" | "complaint_resolved" | "notice_published";
    title: string;
    message: string;
    complaintId?: string;
  } | null>(null);

  // =========================================================================
  // API LOADERS
  // =========================================================================

  // Check Authority Session on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/authority/auth/me", { cache: "no-store" });
        if (!res.ok) {
          window.location.href = "/authority/login";
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.authority) {
          setOfficer(data.authority);
        } else {
          window.location.href = "/authority/login";
        }
      } catch {
        window.location.href = "/authority/login";
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch Departments
  useEffect(() => {
    if (!officer) return;
    async function loadDepts() {
      try {
        const res = await fetch("/api/authority/departments");
        const data = await res.json();
        if (data.success && data.data?.departments) {
          setDepartments(data.data.departments);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    }
    loadDepts();
  }, [officer]);

  // Fetch Unread Notification Count
  const loadUnreadCount = useCallback(async () => {
    if (!officer) return;
    try {
      const res = await fetch("/api/authority/notifications?limit=1");
      const d = await res.json();
      if (d.success && typeof d.unreadCount === "number") {
        setUnreadCount(d.unreadCount);
      }
    } catch {
      // ignore
    }
  }, [officer]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Load Complaints with Filters
  const loadComplaints = useCallback(async () => {
    if (!officer) return;
    setDataLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (wardFilter !== "ALL") params.set("ward", wardFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      if (departmentFilter !== "ALL") params.set("assignedAuthority", departmentFilter);
      if (slaStateFilter !== "ALL") params.set("slaState", slaStateFilter);
      if (sortOrder) params.set("sortOrder", sortOrder);

      // Tab specific filters
      if (activeTab === "assigned") params.set("assignedToMe", "true");
      if (activeTab === "escalated") params.set("escalatedOnly", "true");
      if (activeTab === "nearDeadline") params.set("nearDeadline", "true");
      if (activeTab === "resolved") params.set("status", "Resolved");

      params.set("limit", "100");

      const res = await fetch(`/api/authority/complaints?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setComplaints(json.data || []);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setDataLoading(false);
    }
  }, [
    officer,
    searchQuery,
    statusFilter,
    categoryFilter,
    wardFilter,
    priorityFilter,
    departmentFilter,
    slaStateFilter,
    sortOrder,
    activeTab,
  ]);

  // Load Notices
  const loadNotices = useCallback(async () => {
    if (!officer) return;
    setNoticesLoading(true);
    try {
      const params = new URLSearchParams();
      if (noticeSearch.trim()) params.set("search", noticeSearch.trim());
      if (noticeStatusFilter !== "ALL") params.set("status", noticeStatusFilter);
      if (noticeCategoryFilter !== "ALL") params.set("category", noticeCategoryFilter);

      const res = await fetch(`/api/authority/notices?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setNotices(json.data || []);
        if (json.stats) setNoticeStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setNoticesLoading(false);
    }
  }, [officer, noticeSearch, noticeStatusFilter, noticeCategoryFilter]);

  // Load Notifications
  const loadNotifications = useCallback(async () => {
    if (!officer) return;
    setNotificationsLoading(true);
    try {
      const params = new URLSearchParams();
      if (unreadOnlyFilter) params.set("unreadOnly", "true");
      params.set("limit", "50");

      const res = await fetch(`/api/authority/notifications?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data || []);
        if (typeof json.unreadCount === "number") setUnreadCount(json.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  }, [officer, unreadOnlyFilter]);

  // Trigger loads based on activeTab
  useEffect(() => {
    if (!officer) return;
    if (
      activeTab === "dashboard" ||
      activeTab === "complaints" ||
      activeTab === "assigned" ||
      activeTab === "escalated" ||
      activeTab === "nearDeadline" ||
      activeTab === "resolved"
    ) {
      loadComplaints();
    } else if (activeTab === "announcements") {
      loadNotices();
    } else if (activeTab === "notifications") {
      loadNotifications();
    }
  }, [officer, activeTab, loadComplaints, loadNotices, loadNotifications]);

  // Global Refresh Handler
  const handleGlobalRefresh = () => {
    if (activeTab === "announcements") {
      loadNotices();
    } else if (activeTab === "notifications") {
      loadNotifications();
    } else {
      loadComplaints();
    }
    loadUnreadCount();
  };

  // =========================================================================
  // REAL-TIME SERVER-SENT EVENTS (SSE) LISTENER
  // Dynamically receives new complaints, status updates, and gazette notices
  // without requiring manual page reload or polling.
  // =========================================================================
  useEffect(() => {
    if (!officer) return;

    let eventSource: EventSource | null = null;
    let retryTimer: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource("/api/realtime/complaints");

        eventSource.onopen = () => {
          setRealtimeConnected(true);
        };

        // 1. Live New Complaint Received
        eventSource.addEventListener("complaint_created", (event: MessageEvent) => {
          try {
            const newComplaint = JSON.parse(event.data);
            if (newComplaint && newComplaint.id) {
              setComplaints((prev) => {
                if (prev.some((c) => c.id === newComplaint.id)) return prev;
                return [newComplaint, ...prev];
              });
              setStats((prev) => ({
                ...prev,
                total: prev.total + 1,
                submitted: prev.submitted + 1,
              }));
              setLiveAlert({
                id: String(Date.now()),
                type: "complaint_created",
                title: "New Grievance Registered",
                message: `#${newComplaint.id} • ${newComplaint.category} (${newComplaint.ward})`,
                complaintId: newComplaint.id,
              });
              loadUnreadCount();
            }
          } catch (e) {
            console.error("Error processing real-time complaint_created:", e);
          }
        });

        // 2. Live Complaint Status / Assignment / Escalation Update
        eventSource.addEventListener("complaint_updated", (event: MessageEvent) => {
          try {
            const updateData = JSON.parse(event.data);
            if (updateData && updateData.complaintId) {
              setComplaints((prev) =>
                prev.map((c) => {
                  if (c.id === updateData.complaintId) {
                    return {
                      ...c,
                      status: updateData.status || c.status,
                      assignedAuthority: updateData.assignedAuthority || c.assignedAuthority,
                      authorityLevel: updateData.authorityLevel || c.authorityLevel,
                      updatedAt: updateData.timestamp || new Date().toISOString(),
                    };
                  }
                  return c;
                })
              );

              setSelectedComplaint((curr) => {
                if (curr && curr.id === updateData.complaintId) {
                  return {
                    ...curr,
                    status: updateData.status || curr.status,
                    assignedAuthority: updateData.assignedAuthority || curr.assignedAuthority,
                    authorityLevel: updateData.authorityLevel || curr.authorityLevel,
                    updatedAt: updateData.timestamp || new Date().toISOString(),
                  };
                }
                return curr;
              });

              setLiveAlert({
                id: String(Date.now()),
                type: "complaint_updated",
                title: `Complaint Updated: ${updateData.status || "Progressed"}`,
                message: `#${updateData.complaintId} • ${updateData.note || "Ticket state refreshed"}`,
                complaintId: updateData.complaintId,
              });
              loadUnreadCount();
            }
          } catch (e) {
            console.error("Error processing real-time complaint_updated:", e);
          }
        });

        // 3. Live Complaint Resolved
        eventSource.addEventListener("complaint_resolved", (event: MessageEvent) => {
          try {
            const resolveData = JSON.parse(event.data);
            if (resolveData && resolveData.complaintId) {
              setComplaints((prev) =>
                prev.map((c) => {
                  if (c.id === resolveData.complaintId) {
                    return {
                      ...c,
                      status: "Resolved",
                      resolutionNotes: resolveData.resolutionNotes || c.resolutionNotes,
                      resolvedAt: resolveData.resolvedAt || new Date().toISOString(),
                    };
                  }
                  return c;
                })
              );

              setSelectedComplaint((curr) => {
                if (curr && curr.id === resolveData.complaintId) {
                  return {
                    ...curr,
                    status: "Resolved",
                    resolutionNotes: resolveData.resolutionNotes || curr.resolutionNotes,
                    resolvedAt: resolveData.resolvedAt || new Date().toISOString(),
                  };
                }
                return curr;
              });

              setLiveAlert({
                id: String(Date.now()),
                type: "complaint_resolved",
                title: "Grievance Redressed",
                message: `#${resolveData.complaintId} marked as Resolved`,
                complaintId: resolveData.complaintId,
              });
              loadUnreadCount();
            }
          } catch (e) {
            console.error("Error processing real-time complaint_resolved:", e);
          }
        });

        // 4. Live Notice / Emergency Published
        eventSource.addEventListener("notice_published", (event: MessageEvent) => {
          try {
            const noticeData = JSON.parse(event.data);
            if (noticeData) {
              setLiveAlert({
                id: String(Date.now()),
                type: "notice_published",
                title: noticeData.isEmergency ? "🚨 Emergency Broadcast" : "Municipal Notice Published",
                message: noticeData.title,
              });
              loadNotices();
              loadUnreadCount();
            }
          } catch (e) {
            console.error("Error processing real-time notice_published:", e);
          }
        });

        eventSource.onerror = () => {
          setRealtimeConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!retryTimer) {
            retryTimer = setTimeout(() => {
              retryTimer = null;
              connectSSE();
            }, 5000);
          }
        };
      } catch (err) {
        console.error("SSE connection error:", err);
        setRealtimeConnected(false);
      }
    }

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [officer, loadUnreadCount, loadNotices]);

  // Auto-dismiss live alerts after 7 seconds
  useEffect(() => {
    if (liveAlert) {
      const timer = setTimeout(() => {
        setLiveAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [liveAlert]);

  const handleOpenDetail = async (complaint: ComplaintRecord) => {
    setSelectedComplaint(complaint);
    setDetailLoading(true);
    setFeedbackMsg(null);
    setRemarkInput("");
    setResolutionInput("");
    setEscalationReason("");
    setAssignDept(complaint.assignedAuthority || "");
    setNewStatus(complaint.status);
    setActiveActionModal(null);

    try {
      const res = await fetch(`/api/authority/complaints/${encodeURIComponent(complaint.id)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedComplaint(json.data);
        setTimeline(json.data.timeline || []);
      }
    } catch (err) {
      console.error("Error loading complaint detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteAction = async (payload: {
    action: "accept" | "assign" | "status" | "remark" | "escalate" | "resolve";
    status?: string;
    assignedAuthority?: string;
    authorityLevel?: string;
    note?: string;
    reason?: string;
    resolutionNotes?: string;
  }) => {
    if (!selectedComplaint) return;
    setActionLoading(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/authority/complaints/${encodeURIComponent(selectedComplaint.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedbackMsg({ type: "error", text: json.error || "Action execution failed." });
        return;
      }

      setFeedbackMsg({ type: "success", text: json.message || "Municipal action successfully executed." });
      setActiveActionModal(null);

      // Refresh Detail View
      const detailRes = await fetch(`/api/authority/complaints/${encodeURIComponent(selectedComplaint.id)}`);
      const detailJson = await detailRes.json();
      if (detailJson.success && detailJson.data) {
        setSelectedComplaint(detailJson.data);
        setTimeline(detailJson.data.timeline || []);
      }

      // Refresh Queue & Stats in background
      loadComplaints();
      loadUnreadCount();
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error executing municipal action." });
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================================
  // NOTICE ACTIONS
  // =========================================================================

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeDescription.trim()) {
      setNoticeActionMsg({ type: "error", text: "Please enter notice title and description." });
      return;
    }
    setNoticeActionLoading(true);
    setNoticeActionMsg(null);

    try {
      const res = await fetch("/api/authority/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle.trim(),
          description: noticeDescription.trim(),
          category: noticeCategory,
          targetScope: noticeScope,
          targetWards:
            noticeScope === "Specific ward(s)" || noticeScope === "Specific Wards"
              ? noticeSelectedWards.join(", ")
              : noticeScope === "All citizens"
              ? "All Citizens (01 - 23)"
              : noticeScope === "Emergency / city-wide"
              ? "All Wards (Emergency Broadcast)"
              : "Entire Municipality (City-Wide)",
          priority: noticePriority,
          isEmergency: noticeIsEmergency,
          status: noticeStatus,
          expiryDate: noticeExpiryDate || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setNoticeActionMsg({ type: "error", text: json.error || "Failed to create notice." });
        return;
      }

      setNoticeActionMsg({ type: "success", text: json.message || "Notice created successfully." });
      setIsCreateNoticeOpen(false);
      // Reset form
      setNoticeTitle("");
      setNoticeDescription("");
      setNoticeCategory("Public Notice");
      setNoticeScope("All citizens");
      setNoticeSelectedWards([]);
      setNoticePriority("Normal");
      setNoticeIsEmergency(false);
      setNoticeStatus("Published");
      setNoticeExpiryDate("");

      loadNotices();
      loadUnreadCount();
    } catch {
      setNoticeActionMsg({ type: "error", text: "Network error creating notice." });
    } finally {
      setNoticeActionLoading(false);
    }
  };

  const handleUpdateNoticeStatus = async (id: string, newStatus: "Draft" | "Published" | "Archived") => {
    setNoticeActionLoading(true);
    try {
      const res = await fetch(`/api/authority/notices/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadNotices();
      }
    } catch (err) {
      console.error("Error updating notice status:", err);
    } finally {
      setNoticeActionLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete notice #${id}?`)) return;
    setNoticeActionLoading(true);
    try {
      const res = await fetch(`/api/authority/notices/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        loadNotices();
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
    } finally {
      setNoticeActionLoading(false);
    }
  };

  // =========================================================================
  // NOTIFICATION ACTIONS
  // =========================================================================

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await fetch("/api/authority/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch("/api/authority/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch("/api/authority/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/authority/login";
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setWardFilter("ALL");
    setPriorityFilter("ALL");
    setDepartmentFilter("ALL");
    setSlaStateFilter("ALL");
    setSortOrder("desc");
  };

  // Helper: SLA Countdown computation
  const getSlaInfo = (deadlineStr: string, status: string) => {
    if (status === "Resolved" || status === "Closed") {
      return {
        label: "Resolved",
        isOverdue: false,
        isNear: false,
        hoursDiff: 0,
        badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300",
      };
    }
    const deadline = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diffHours = (deadline - now) / (1000 * 3600);

    if (diffHours < 0) {
      const overdueHours = Math.abs(Math.round(diffHours));
      return {
        label: `OVERDUE by ${overdueHours}h`,
        isOverdue: true,
        isNear: false,
        hoursDiff: diffHours,
        badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-400 font-bold animate-pulse",
      };
    }
    if (diffHours <= 24) {
      return {
        label: `Near SLA (${Math.round(diffHours)}h left)`,
        isOverdue: false,
        isNear: true,
        hoursDiff: diffHours,
        badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-400 font-bold",
      };
    }
    return {
      label: `On Track (${Math.round(diffHours)}h)`,
      isOverdue: false,
      isNear: false,
      hoursDiff: diffHours,
      badgeClass: "bg-teal-50 text-[#064E4A] dark:bg-teal-950/60 dark:text-teal-300 border-teal-200",
    };
  };

  // Helper: Compute Jurisdiction text
  const getJurisdictionText = (level: string) => {
    if (level === "Local Authority") {
      return "Lakshmeshwar Town Municipal Council (All 23 Municipal Wards, Gadag District, Karnataka - 582116)";
    }
    if (level === "Block level") {
      return "Lakshmeshwar Taluk Panchayat Jurisdiction (Shirhatti Sub-division, Gadag District)";
    }
    if (level === "District Panchayat") {
      return "Gadag Zilla Panchayat Rural & Municipal Coordination Jurisdiction";
    }
    return "Office of the Deputy Commissioner, Gadag District Administrative Jurisdiction";
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#031514] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Validating Municipal Officer Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#031514] text-gray-900 dark:text-gray-100 flex flex-col">
      {/* 1. TOP HEADER */}
      <header className="bg-[#064E4A] text-white sticky top-0 z-30 shadow-md border-b border-teal-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Branding & Portal Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-teal-900/60 hover:bg-teal-900 text-teal-200"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/authority/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-[#064E4A] flex items-center justify-center font-black shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg text-white">CivSetu</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-800/90 text-amber-300 px-2 py-0.5 rounded-full border border-teal-600/40">
                    Authority Portal
                  </span>
                </div>
                <p className="text-[11px] text-teal-200 truncate hidden sm:block">
                  Lakshmeshwar Town Municipal Council (TMC)
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Officer Profile Badge & Actions */}
          <div className="flex items-center gap-3">
            {/* Live SSE Real-Time Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                realtimeConnected
                  ? "bg-emerald-950/80 border border-emerald-500/60 text-emerald-300"
                  : "bg-amber-950/80 border border-amber-500/60 text-amber-300"
              }`}
              title={realtimeConnected ? "Real-time updates connected (SSE active)" : "Reconnecting to live event stream..."}
            >
              <span className={`w-2 h-2 rounded-full ${realtimeConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="hidden md:inline">
                {realtimeConnected ? "Live Updates Active" : "Connecting..."}
              </span>
            </div>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">{officer?.fullName}</span>
              <span className="text-[11px] text-amber-300 leading-tight">{officer?.designation}</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className="w-8 h-8 rounded-full bg-teal-800 border border-teal-600 flex items-center justify-center text-teal-200 hover:text-white font-bold text-xs cursor-pointer transition"
              title="View Profile"
            >
              <User className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700/80 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              title="Logout from Authority Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Real-Time Alert Notification */}
      {liveAlert && (
        <div className="fixed top-16 right-4 z-50 max-w-md w-full bg-white dark:bg-gray-900 border-2 border-emerald-500 rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <Bell className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Real-Time Notification
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {liveAlert.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  {liveAlert.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveAlert(null)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {liveAlert.complaintId && (
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const found = complaints.find((c) => c.id === liveAlert.complaintId);
                  if (found) {
                    handleOpenDetail(found);
                  }
                  setLiveAlert(null);
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Inspect Complaint &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex">
        {/* Mobile Navigation Drawer Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto w-64 bg-white dark:bg-[#061e1d] border-r border-gray-200 dark:border-teal-950 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-4 space-y-4">
            <div className="lg:hidden flex items-center justify-between pb-3 border-b border-gray-200 dark:border-teal-900">
              <span className="font-bold text-sm text-[#064E4A] dark:text-teal-300">Authority Navigation</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Officer Micro-Card */}
            <div
              onClick={() => setActiveTab("profile")}
              className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 rounded-xl space-y-1 cursor-pointer hover:border-[#064E4A] transition"
            >
              <p className="text-xs font-bold text-[#064E4A] dark:text-teal-300 truncate">{officer?.fullName}</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{officer?.department}</p>
              <span className="inline-block mt-1 text-[10px] uppercase font-bold bg-[#064E4A] text-white px-2 py-0.5 rounded">
                {officer?.authorityLevel}
              </span>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {[
                { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
                { id: "complaints", label: "Complaints Queue", icon: Inbox, count: stats.total },
                { id: "assigned", label: "Assigned to Me", icon: UserCheck },
                { id: "escalated", label: "Escalated Grievances", icon: ArrowUpRight, count: stats.escalated, highlight: true },
                { id: "nearDeadline", label: "Near SLA Deadline", icon: Clock, count: stats.nearDeadline, alert: true },
                { id: "resolved", label: "Resolved Grievances", icon: CheckCircle2, count: stats.resolved },
                { id: "announcements", label: "Gazette & Notices", icon: Megaphone, count: noticeStats.published },
                { id: "notifications", label: "System Alerts", icon: Bell, count: unreadCount, alertBadge: true },
                { id: "profile", label: "Authority Profile", icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#064E4A] text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-gray-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          (item as any).alertBadge
                            ? "bg-red-500 text-white animate-pulse"
                            : item.highlight
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/80 dark:text-purple-200"
                            : item.alert
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200"
                            : isActive
                            ? "bg-teal-900 text-teal-100"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-teal-950 text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-400">CivSetu Authority Suite</p>
            <p>Phase 5B Operational Modules</p>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 min-w-0 w-full p-3 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* =========================================================================
              MODULE 1, 2, 3, 4, 5: COMPLAINTS / QUEUE / ASSIGNED / ESCALATED / SLA / RESOLVED
              ========================================================================= */}
          {(activeTab === "dashboard" ||
            activeTab === "complaints" ||
            activeTab === "assigned" ||
            activeTab === "escalated" ||
            activeTab === "nearDeadline" ||
            activeTab === "resolved") && (
            <>
              {/* PAGE TITLE BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    {activeTab === "dashboard" && "Municipal Grievances Control Desk"}
                    {activeTab === "complaints" && "Official Complaints Registry"}
                    {activeTab === "assigned" && "Grievances Assigned to My Department"}
                    {activeTab === "escalated" && "Escalated Citizen Grievances Desk"}
                    {activeTab === "nearDeadline" && "Critical SLA & Impending Deadlines Desk"}
                    {activeTab === "resolved" && "Resolved Grievances & Municipal Archive"}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {activeTab === "assigned" && `Displaying grievances assigned to: ${officer?.department}`}
                    {activeTab === "escalated" && "Tracking complaints escalated across administrative tiers (Local Authority → Block Level → District Administration)"}
                    {activeTab === "nearDeadline" && "Distinguishing On Track, Near Deadline (<24h), and Overdue statutory SLAs"}
                    {activeTab === "resolved" && "Officially resolved and closed complaints with recorded resolution notes and timeline audit trails"}
                    {(activeTab === "dashboard" || activeTab === "complaints") && "Real-time citizen grievance tracking, workflow assignment, and escalation hierarchy"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGlobalRefresh}
                    disabled={dataLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin text-[#064E4A]" : ""}`} />
                    <span>Refresh Queue</span>
                  </button>
                </div>
              </div>

              {/* SUMMARY STATS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  {
                    title: "Total Grievances",
                    count: stats.total,
                    color: "border-teal-300 dark:border-teal-800",
                    badge: "bg-teal-50 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-300",
                    icon: Layers,
                    onClick: () => { setStatusFilter("ALL"); setActiveTab("complaints"); },
                  },
                  {
                    title: "New / Submitted",
                    count: stats.submitted,
                    color: "border-blue-300 dark:border-blue-900",
                    badge: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
                    icon: Inbox,
                    onClick: () => { setStatusFilter("Submitted"); setActiveTab("complaints"); },
                  },
                  {
                    title: "In Progress",
                    count: stats.inProgress,
                    color: "border-amber-300 dark:border-amber-900",
                    badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
                    icon: Clock,
                    onClick: () => { setStatusFilter("In Progress"); setActiveTab("complaints"); },
                  },
                  {
                    title: "Near SLA (<24h)",
                    count: stats.nearDeadline,
                    color: "border-amber-400 dark:border-amber-800",
                    badge: "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold",
                    icon: Hourglass,
                    onClick: () => setActiveTab("nearDeadline"),
                  },
                  {
                    title: "Escalated",
                    count: stats.escalated,
                    color: "border-purple-300 dark:border-purple-900",
                    badge: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
                    icon: ArrowUpRight,
                    onClick: () => setActiveTab("escalated"),
                  },
                  {
                    title: "Resolved",
                    count: stats.resolved,
                    color: "border-emerald-300 dark:border-emerald-900",
                    badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
                    icon: CheckCircle2,
                    onClick: () => setActiveTab("resolved"),
                  },
                ].map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={c.onClick}
                      className={`text-left p-3.5 bg-white dark:bg-[#071f1e] border ${c.color} rounded-2xl shadow-xs hover:shadow-md transition group cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{c.title}</span>
                        <div className={`p-1.5 rounded-lg ${c.badge}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition">
                        {c.count}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SEARCH & MULTI-FILTER CONTROL BAR */}
              <div className="bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search box */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Complaint ID, title, citizen name, mobile..."
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800/80 focus:outline-none focus:border-[#064E4A] focus:ring-1 focus:ring-[#064E4A]"
                    />
                  </div>

                  {/* Filter Dropdowns Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter (if not resolved tab) */}
                    {activeTab !== "resolved" && (
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Submitted">Submitted (New)</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Reopened">Reopened</option>
                      </select>
                    )}

                    {/* SLA State Filter */}
                    <select
                      value={slaStateFilter}
                      onChange={(e) => setSlaStateFilter(e.target.value as any)}
                      className="px-2.5 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                    >
                      <option value="ALL">All SLA States</option>
                      <option value="on_track">On Track (&gt;24h)</option>
                      <option value="near_deadline">Near Deadline (&le;24h)</option>
                      <option value="overdue">Overdue (Expired)</option>
                    </select>

                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="Water Supply & Metering">Water Supply & Metering</option>
                      <option value="Street Lighting & Electrical">Street Lighting & Electrical</option>
                      <option value="Solid Waste Management & Sanitation">Solid Waste & Sanitation</option>
                      <option value="Roads, Footpaths & Drainage">Roads & Drainage</option>
                      <option value="Public Health & Mosquito Control">Public Health</option>
                      <option value="Revenue, Tax & Property Assessment">Revenue & Property Tax</option>
                      <option value="Town Planning & Building Permissions">Town Planning</option>
                      <option value="Birth, Death & Trade Licensing">Trade Licensing</option>
                    </select>

                    {/* Ward Filter */}
                    <select
                      value={wardFilter}
                      onChange={(e) => setWardFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                    >
                      <option value="ALL">All 23 Wards</option>
                      {Array.from({ length: 23 }, (_, i) => {
                        const num = String(i + 1).padStart(2, "0");
                        return (
                          <option key={num} value={`Ward ${num}`}>
                            Ward {num}
                          </option>
                        );
                      })}
                    </select>

                    {/* Priority Filter */}
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-2.5 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none"
                    >
                      <option value="ALL">All Priorities</option>
                      <option value="Urgent">Urgent (24h)</option>
                      <option value="High">High (48h)</option>
                      <option value="Medium">Medium (72h)</option>
                      <option value="Low">Low (120h)</option>
                    </select>

                    {/* Sort Order */}
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                      className="px-2.5 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none font-semibold"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>

                    {/* Clear Filters */}
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="px-2.5 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* COMPLAINTS QUEUE TABLE & MOBILE CARDS */}
              <div className="bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-teal-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {activeTab === "assigned" && "Assigned Grievances"}
                      {activeTab === "escalated" && "Escalated Grievances"}
                      {activeTab === "nearDeadline" && "SLA Impending Grievances"}
                      {activeTab === "resolved" && "Resolved Archive Records"}
                      {(activeTab === "dashboard" || activeTab === "complaints") && "Municipal Complaints Queue"}
                    </span>
                    <span className="text-xs bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                      {complaints.length} records
                    </span>
                  </div>
                </div>

                {dataLoading ? (
                  <div className="p-12 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-[#064E4A] animate-spin mx-auto" />
                    <p className="text-xs text-gray-500">Querying municipal complaints database...</p>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Inbox className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No Complaints Match Active Filters</p>
                    <p className="text-xs text-gray-500">Try adjusting your search query or reset filter parameters.</p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-2 text-xs font-bold text-[#064E4A] dark:text-teal-400 underline cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-gray-800">
                          <tr>
                            <th className="py-3 px-4">Complaint ID</th>
                            <th className="py-3 px-4">Category & Title</th>
                            <th className="py-3 px-4">Citizen</th>
                            <th className="py-3 px-4">Ward & Location</th>
                            {activeTab === "escalated" ? (
                              <>
                                <th className="py-3 px-4">Escalation Tier</th>
                                <th className="py-3 px-4">Assigned Authority</th>
                                <th className="py-3 px-4">Escalation Reason</th>
                              </>
                            ) : activeTab === "resolved" ? (
                              <>
                                <th className="py-3 px-4">Assigned Authority</th>
                                <th className="py-3 px-4">Submitted Date</th>
                                <th className="py-3 px-4">Resolved Date</th>
                                <th className="py-3 px-4">Resolution Remarks</th>
                              </>
                            ) : (
                              <>
                                <th className="py-3 px-4">Priority</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">SLA Deadline</th>
                              </>
                            )}
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {complaints.map((c) => {
                            const sla = getSlaInfo(c.deadline, c.status);
                            return (
                              <tr
                                key={c.id}
                                onClick={() => handleOpenDetail(c)}
                                className="hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition cursor-pointer group"
                              >
                                <td className="py-3 px-4 font-mono font-bold text-[#064E4A] dark:text-teal-400 whitespace-nowrap">
                                  {c.id}
                                </td>
                                <td className="py-3 px-4 max-w-xs">
                                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{c.title}</p>
                                  <p className="text-[11px] text-gray-500 truncate">{c.category}</p>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <p className="font-semibold text-gray-800 dark:text-gray-200">{c.citizenName || "Complainant"}</p>
                                  <p className="text-[11px] text-gray-500">{c.citizenMobile || "—"}</p>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <p className="font-bold text-gray-800 dark:text-gray-300">{c.ward}</p>
                                  <p className="text-[11px] text-gray-500 truncate max-w-[150px]">{c.address || "Lakshmeshwar"}</p>
                                </td>

                                {activeTab === "escalated" ? (
                                  <>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                        {c.authorityLevel}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 max-w-xs truncate text-gray-700 dark:text-gray-300">
                                      {c.assignedAuthority}
                                    </td>
                                    <td className="py-3 px-4 max-w-xs truncate text-gray-600 dark:text-gray-400">
                                      {c.escalationReason || "Standard escalation rule"}
                                    </td>
                                  </>
                                ) : activeTab === "resolved" ? (
                                  <>
                                    <td className="py-3 px-4 max-w-xs truncate text-gray-700 dark:text-gray-300">
                                      {c.assignedAuthority}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                                      {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                                      {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : "Resolved"}
                                    </td>
                                    <td className="py-3 px-4 max-w-xs truncate text-gray-800 dark:text-gray-200">
                                      {c.resolutionNotes || "Resolution complete."}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                                          c.priority === "Urgent"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : c.priority === "High"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : "bg-slate-50 text-slate-700 border-slate-200"
                                        }`}
                                      >
                                        {c.priority === "Urgent" && <AlertTriangle className="w-3 h-3" />}
                                        {c.priority === "High" && <AlertCircle className="w-3 h-3" />}
                                        {c.priority}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span
                                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                          c.status === "Submitted"
                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                            : c.status === "In Progress"
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                            : c.status === "Escalated"
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-black"
                                            : c.status === "Resolved"
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                        }`}
                                      >
                                        {c.status}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border ${sla.badgeClass}`}>
                                        {sla.isOverdue ? <AlertOctagon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        <span>{sla.label}</span>
                                      </span>
                                    </td>
                                  </>
                                )}

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDetail(c);
                                    }}
                                    className="px-3 py-1 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                                  >
                                    Inspect
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile & Tablet Card List */}
                    <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
                      {complaints.map((c) => {
                        const sla = getSlaInfo(c.deadline, c.status);
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleOpenDetail(c)}
                            className="p-4 space-y-2.5 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-[#064E4A] dark:text-teal-400">
                                {c.id}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                                {c.status}
                              </span>
                            </div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{c.title}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">{c.ward}</span>
                              <span>•</span>
                              <span>{c.category}</span>
                              <span>•</span>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${sla.badgeClass}`}>
                                {sla.label}
                              </span>
                            </div>
                            {activeTab === "resolved" && c.resolutionNotes && (
                              <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg">
                                <strong>Resolution:</strong> {c.resolutionNotes}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-gray-500">{c.citizenName || "Complainant"}</span>
                              <span className="text-xs font-bold text-[#064E4A] dark:text-teal-400 flex items-center gap-0.5">
                                Inspect Details <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* =========================================================================
              MODULE 6: GAZETTE & NOTICES (ANNOUNCEMENTS)
              ========================================================================= */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    Lakshmeshwar TMC Official Gazette & Municipal Circulars
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Issue administrative orders, emergency alerts, public directives, and departmental notices stored persistently in PostgreSQL
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateNoticeOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Official Notice</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadNotices}
                    disabled={noticesLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${noticesLoading ? "animate-spin text-[#064E4A]" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Action feedback */}
              {noticeActionMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    noticeActionMsg.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                      : "bg-red-50 dark:bg-red-950 border-red-300 text-red-800 dark:text-red-200"
                  }`}
                >
                  {noticeActionMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{noticeActionMsg.text}</span>
                </div>
              )}

              {/* Notice Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-gray-500">Total Circulars</span>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{noticeStats.total}</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#071f1e] border border-emerald-300 dark:border-emerald-900 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Published Active</span>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{noticeStats.published}</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#071f1e] border border-amber-300 dark:border-amber-900 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Draft Circulars</span>
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{noticeStats.draft}</p>
                </div>
                <div className="p-4 bg-white dark:bg-[#071f1e] border border-red-300 dark:border-red-900 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-red-700 dark:text-red-400">Emergency Alerts</span>
                  <p className="text-2xl font-black text-red-700 dark:text-red-300 mt-1">{noticeStats.emergency}</p>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    placeholder="Search circulars by title, keyword, ward, department..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800/80 focus:outline-none"
                  />
                </div>
                <select
                  value={noticeStatusFilter}
                  onChange={(e) => setNoticeStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="ALL">All Publication States</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                <select
                  value={noticeCategoryFilter}
                  onChange={(e) => setNoticeCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="ALL">All Notice Categories</option>
                  <option value="Public Notice">Public Notice</option>
                  <option value="Public Works Directive">Public Works Directive</option>
                  <option value="Public Health Order">Public Health Order</option>
                  <option value="Water Supply Advisory">Water Supply Advisory</option>
                  <option value="Sanitation Circular">Sanitation Circular</option>
                  <option value="Revenue & Property Tax">Revenue & Property Tax</option>
                  <option value="Tender / Procurement">Tender / Procurement</option>
                </select>
              </div>

              {/* Notice Cards List */}
              {noticesLoading ? (
                <div className="p-12 text-center space-y-3 bg-white dark:bg-[#071f1e] rounded-2xl border">
                  <RefreshCw className="w-6 h-6 text-[#064E4A] animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Loading municipal gazette records...</p>
                </div>
              ) : notices.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-white dark:bg-[#071f1e] rounded-2xl border">
                  <Megaphone className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No Gazette Notices Found</p>
                  <p className="text-xs text-gray-500">Create an official notice or clear filter settings.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 bg-white dark:bg-[#071f1e] border rounded-2xl shadow-xs space-y-3 transition hover:border-[#064E4A] ${
                        n.isEmergency ? "border-red-400 dark:border-red-800" : "border-gray-200 dark:border-teal-950"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#064E4A] dark:text-teal-400">{n.id}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              n.status === "Published"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : n.status === "Draft"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {n.status}
                          </span>
                          {n.isEmergency && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                              EMERGENCY ALERT
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(n.publishDate).toLocaleDateString()}
                          </span>
                          {n.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateNoticeStatus(n.id, "Published")}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg cursor-pointer transition"
                            >
                              Publish
                            </button>
                          )}
                          {n.status === "Published" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateNoticeStatus(n.id, "Archived")}
                              className="px-2.5 py-1 border border-gray-300 hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg cursor-pointer transition"
                            >
                              Archive
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(n.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{n.title}</h2>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap leading-relaxed">
                          {n.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span>Category: <strong className="text-gray-700 dark:text-gray-300">{n.category}</strong></span>
                        <span>•</span>
                        <span>Scope: <strong className="text-gray-700 dark:text-gray-300">{n.targetScope} {n.targetWards ? `(${n.targetWards})` : ""}</strong></span>
                        <span>•</span>
                        <span>Priority: <strong className="text-gray-700 dark:text-gray-300">{n.priority}</strong></span>
                        <span>•</span>
                        <span>Issued by: <strong className="text-gray-700 dark:text-gray-300">{n.issuedByName}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Notice Modal */}
              {isCreateNoticeOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
                  <div className="bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
                    <div className="p-4 bg-[#064E4A] text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-amber-300" />
                        <span className="font-bold text-sm sm:text-base">Draft Official Gazette Notice / Circular</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCreateNoticeOpen(false)}
                        className="p-1 rounded-lg text-teal-200 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateNotice} className="p-5 space-y-4 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Notice Title / Order Subject * (Minimum 5 characters)
                        </label>
                        <input
                          type="text"
                          required
                          value={noticeTitle}
                          onChange={(e) => setNoticeTitle(e.target.value)}
                          placeholder="e.g. Schedule of Annual Monsoon Drain Desilting and Silt Clearance 2026"
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-gray-800"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Notice Content & Administrative Directive * (Minimum 10 characters)
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={noticeDescription}
                          onChange={(e) => setNoticeDescription(e.target.value)}
                          placeholder="Provide the complete directive, affected areas, compliance guidelines, and contact department..."
                          className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-gray-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Notice Category
                          </label>
                          <select
                            value={noticeCategory}
                            onChange={(e) => setNoticeCategory(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-800"
                          >
                            <option value="Public Notice">Public Notice</option>
                            <option value="Public Works Directive">Public Works Directive</option>
                            <option value="Public Health Order">Public Health Order</option>
                            <option value="Water Supply Advisory">Water Supply Advisory</option>
                            <option value="Sanitation Circular">Sanitation Circular</option>
                            <option value="Revenue & Property Tax">Revenue & Property Tax</option>
                            <option value="Tender / Procurement">Tender / Procurement</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Notice Priority
                          </label>
                          <select
                            value={noticePriority}
                            onChange={(e) => setNoticePriority(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-800"
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Target Jurisdiction Scope *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <label className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition ${noticeScope === "All citizens" ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-bold" : "border-gray-200 dark:border-gray-700"}`}>
                            <input
                              type="radio"
                              name="noticeScope"
                              checked={noticeScope === "All citizens"}
                              onChange={() => setNoticeScope("All citizens")}
                            />
                            <span>All citizens</span>
                          </label>
                          <label className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition ${noticeScope === "Specific ward(s)" || noticeScope === "Specific Wards" ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-bold" : "border-gray-200 dark:border-gray-700"}`}>
                            <input
                              type="radio"
                              name="noticeScope"
                              checked={noticeScope === "Specific ward(s)" || noticeScope === "Specific Wards"}
                              onChange={() => setNoticeScope("Specific ward(s)")}
                            />
                            <span>Specific ward(s)</span>
                          </label>
                          <label className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition ${noticeScope === "Entire municipality" || noticeScope === "Entire Municipality" ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 font-bold" : "border-gray-200 dark:border-gray-700"}`}>
                            <input
                              type="radio"
                              name="noticeScope"
                              checked={noticeScope === "Entire municipality" || noticeScope === "Entire Municipality"}
                              onChange={() => setNoticeScope("Entire municipality")}
                            />
                            <span>Entire municipality</span>
                          </label>
                          <label className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer transition ${noticeScope === "Emergency / city-wide" ? "border-rose-600 bg-rose-50 dark:bg-rose-950/40 font-bold text-rose-700 dark:text-rose-300" : "border-gray-200 dark:border-gray-700"}`}>
                            <input
                              type="radio"
                              name="noticeScope"
                              checked={noticeScope === "Emergency / city-wide"}
                              onChange={() => {
                                setNoticeScope("Emergency / city-wide");
                                setNoticeIsEmergency(true);
                                setNoticePriority("Urgent");
                              }}
                            />
                            <span>Emergency / city-wide</span>
                          </label>
                        </div>
                      </div>

                      {(noticeScope === "Specific ward(s)" || noticeScope === "Specific Wards") && (
                        <div className="p-3 border rounded-xl bg-gray-50 dark:bg-gray-800/60 space-y-2">
                          <span className="font-bold text-gray-700 dark:text-gray-300 block">
                            Select Target Ward(s):
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                            {Array.from({ length: 23 }, (_, i) => {
                              const wardStr = `Ward ${String(i + 1).padStart(2, "0")}`;
                              const isChecked = noticeSelectedWards.includes(wardStr);
                              return (
                                <label key={wardStr} className="flex items-center gap-1 text-[11px] cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNoticeSelectedWards([...noticeSelectedWards, wardStr]);
                                      } else {
                                        setNoticeSelectedWards(noticeSelectedWards.filter((w) => w !== wardStr));
                                      }
                                    }}
                                  />
                                  <span>{String(i + 1).padStart(2, "0")}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Optional Expiry Date
                          </label>
                          <input
                            type="date"
                            value={noticeExpiryDate}
                            onChange={(e) => setNoticeExpiryDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl bg-white dark:bg-gray-800"
                          />
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-red-700 dark:text-red-400">
                            <input
                              type="checkbox"
                              checked={noticeIsEmergency}
                              onChange={(e) => setNoticeIsEmergency(e.target.checked)}
                            />
                            <span>Flag as Critical / Emergency Alert</span>
                          </label>

                          <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="noticeStatus"
                                checked={noticeStatus === "Published"}
                                onChange={() => setNoticeStatus("Published")}
                              />
                              <span>Publish Immediately</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="noticeStatus"
                                checked={noticeStatus === "Draft"}
                                onChange={() => setNoticeStatus("Draft")}
                              />
                              <span>Save as Draft</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCreateNoticeOpen(false)}
                          className="px-4 py-2 border rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={noticeActionLoading}
                          className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold rounded-xl disabled:opacity-50"
                        >
                          {noticeActionLoading ? "Saving Notice..." : noticeStatus === "Published" ? "Publish Gazette Notice" : "Save Notice Draft"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              MODULE 7: SYSTEM ALERTS / NOTIFICATIONS
              ========================================================================= */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h1 className="text-xl font-bold text-[#064E4A] dark:text-teal-300">
                    Real-Time Municipal Activity & Event Audit Log
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Chronological audit feed for complaint registrations, departmental assignments, near-SLA alerts, escalations, resolutions, and gazette notices.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUnreadOnlyFilter(!unreadOnlyFilter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      unreadOnlyFilter
                        ? "bg-amber-100 dark:bg-amber-950 border-amber-300 text-amber-800 dark:text-amber-200"
                        : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {unreadOnlyFilter ? "Showing Unread Only" : "Show All"}
                  </button>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark All Read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={loadNotifications}
                    disabled={notificationsLoading}
                    className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${notificationsLoading ? "animate-spin text-[#064E4A]" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="space-y-2.5 pt-2">
                {notificationsLoading ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    <RefreshCw className="w-5 h-5 text-[#064E4A] animate-spin mx-auto mb-2" />
                    Fetching system alerts...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No notifications recorded.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 border rounded-xl transition flex items-start justify-between gap-3 ${
                        !n.isRead
                          ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                          : "bg-white dark:bg-gray-900/40 border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
                          )}
                          <span className="font-bold text-xs text-[#064E4A] dark:text-teal-400">{n.title}</span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {n.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                          {n.complaintId && (
                            <span className="font-mono font-bold text-[#064E4A] dark:text-teal-400">
                              #{n.complaintId}
                            </span>
                          )}
                        </div>
                      </div>

                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="px-2 py-1 text-[10px] font-bold text-[#064E4A] hover:bg-teal-50 rounded border border-teal-200 cursor-pointer shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              MODULE 8: AUTHORITY PROFILE
              ========================================================================= */}
          {activeTab === "profile" && (
            <div className="max-w-3xl bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-2xl bg-[#064E4A] text-amber-300 flex items-center justify-center font-black text-2xl shadow-md border-2 border-amber-400">
                  {officer?.fullName.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{officer?.fullName}</h1>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      Active Officer
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">{officer?.designation}</p>
                  <p className="text-xs text-[#064E4A] dark:text-teal-300 font-bold">{officer?.department}</p>
                </div>
              </div>

              {/* Official Credentials Grid */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Official Municipal Credentials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div>
                    <span className="text-gray-500 block">Officer Staff ID:</span>
                    <p className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">{officer?.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Administrative Tier / Level:</span>
                    <p className="font-bold text-[#064E4A] dark:text-teal-300 text-sm">{officer?.authorityLevel}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Official Government Email:</span>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{officer?.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Official Mobile Line:</span>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{officer?.mobileNumber || "98450-XXXXX"}</p>
                  </div>
                </div>
              </div>

              {/* Institutional Jurisdiction */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Statutory Municipal Jurisdiction</h2>
                <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#064E4A] dark:text-teal-300">
                    <MapPin className="w-4 h-4" />
                    <span>Jurisdiction Scope</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                    {getJurisdictionText(officer?.authorityLevel || "Local Authority")}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Authorized to inspect, assign, verify, resolve, and hierarchically escalate citizen grievances under Karnataka Municipalities Act & CivSetu Portal Regulations.
                  </p>
                </div>
              </div>

              {/* Security & Session Verification */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Cryptographic Session & Security</h2>
                <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl text-xs space-y-2 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Session Status:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Authenticated & Enforced
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cookie Architecture:</span>
                    <span className="font-mono text-[11px]">HttpOnly, SameSite=Lax, Path=/</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Role Isolation:</span>
                    <span>Strict Separation from Citizen Realm</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          3. COMPLAINT DETAIL & ACTION MODAL / DRAWER
          ========================================================================= */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white dark:bg-[#071f1e] border border-gray-200 dark:border-teal-950 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#064E4A] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-300 text-sm sm:text-base">
                  {selectedComplaint.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-800 text-teal-200 font-bold">
                  {selectedComplaint.status}
                </span>
                {selectedComplaint.status === "Escalated" && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-600 text-white">
                    Escalated
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
              {/* Feedback Alert */}
              {feedbackMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                      : "bg-red-50 dark:bg-red-950 border-red-300 text-red-800 dark:text-red-200"
                  }`}
                >
                  {feedbackMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                  {selectedComplaint.title}
                </h2>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-teal-50/50 dark:bg-teal-950/30 p-3.5 rounded-xl border border-teal-100 dark:border-teal-900/60">
                <div>
                  <span className="text-gray-500 block">Category:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Ward Jurisdiction:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedComplaint.ward}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Priority:</span>
                  <span className="font-bold text-red-700 dark:text-red-400">{selectedComplaint.priority}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Assigned Level:</span>
                  <span className="font-bold text-[#064E4A] dark:text-teal-300">{selectedComplaint.authorityLevel}</span>
                </div>
              </div>

              {/* Citizen & Location Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Citizen Details */}
                <div className="p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl space-y-1.5">
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#064E4A]" />
                    <span>Citizen Complainant Details</span>
                  </p>
                  <p><span className="text-gray-500">Name:</span> <span className="font-semibold">{selectedComplaint.citizenName || "Citizen Complainant"}</span></p>
                  <p><span className="text-gray-500">Mobile:</span> <span className="font-semibold">{selectedComplaint.citizenMobile || "—"}</span></p>
                  <p><span className="text-gray-500">Citizen ID:</span> <span className="font-mono">{selectedComplaint.citizenId}</span></p>
                </div>

                {/* Incident Location */}
                <div className="p-3.5 border border-gray-200 dark:border-gray-800 rounded-xl space-y-1.5">
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#064E4A]" />
                    <span>Incident Location & GPS</span>
                  </p>
                  <p><span className="text-gray-500">Address / Landmark:</span> <span className="font-semibold">{selectedComplaint.address || "Lakshmeshwar"}</span></p>
                  <p>
                    <span className="text-gray-500">GPS Coordinates:</span>{" "}
                    {selectedComplaint.latitude && selectedComplaint.longitude ? (
                      <span className="font-mono">{selectedComplaint.latitude.toFixed(5)}, {selectedComplaint.longitude.toFixed(5)}</span>
                    ) : (
                      <span className="text-gray-400">Not recorded by citizen</span>
                    )}
                  </p>
                  {selectedComplaint.photoUrl && (
                    <div className="pt-1">
                      <span className="text-gray-500 block mb-1">Attached Evidence:</span>
                      <img
                        src={selectedComplaint.photoUrl}
                        alt="Citizen submitted evidence"
                        className="h-20 w-auto rounded-lg border object-cover cursor-pointer hover:opacity-90"
                        onClick={() => window.open(selectedComplaint.photoUrl!, "_blank")}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION TOOLBAR */}
              <div className="p-4 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 rounded-2xl space-y-3">
                <p className="text-xs font-black text-[#064E4A] dark:text-teal-300 uppercase tracking-wider">
                  Officer Action Desk
                </p>

                {/* If Resolved / Closed: Lock status-mutating actions */}
                {selectedComplaint.status === "Resolved" || selectedComplaint.status === "Closed" ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Grievance Officially Resolved & Locked</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Resolution Notes:</strong> {selectedComplaint.resolutionNotes || "No resolution details provided."}
                    </p>
                    {selectedComplaint.resolvedAt && (
                      <p className="text-[11px] text-gray-500">
                        Resolved on {new Date(selectedComplaint.resolvedAt).toLocaleString()}. Status-mutating transitions are locked.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action: Accept */}
                    {selectedComplaint.status === "Submitted" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleExecuteAction({ action: "accept" })}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Grievance</span>
                      </button>
                    )}

                    {/* Action: Assign */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setActiveActionModal("assign")}
                      className="px-3.5 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign Department</span>
                    </button>

                    {/* Action: Mark In Progress */}
                    {selectedComplaint.status !== "In Progress" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleExecuteAction({ action: "status", status: "In Progress", note: "Field work actively in progress." })}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mark In Progress</span>
                      </button>
                    )}

                    {/* Action: Escalate */}
                    {selectedComplaint.authorityLevel !== "District Administration" && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => setActiveActionModal("escalate")}
                        className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Escalate Hierarchically</span>
                      </button>
                    )}

                    {/* Action: Resolve */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setActiveActionModal("resolve")}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Resolved</span>
                    </button>

                    {/* Public Tracking Link */}
                    <Link
                      href={`/track?id=${selectedComplaint.id}`}
                      target="_blank"
                      className="ml-auto px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-1.5"
                    >
                      <span>View Public Tracker</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Sub-Modal for Assign */}
                {activeActionModal === "assign" && (
                  <div className="pt-3 border-t border-teal-200 dark:border-teal-900 space-y-2">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Select Municipal Department / Authority Wing:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={assignDept}
                        onChange={(e) => setAssignDept(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                      >
                        <option value="">-- Choose Target Authority --</option>
                        {departments.map((d) => (
                          <option key={d.name} value={d.name}>
                            [{d.level}] {d.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={actionLoading || !assignDept}
                        onClick={() => {
                          const matched = departments.find((d) => d.name === assignDept);
                          handleExecuteAction({
                            action: "assign",
                            assignedAuthority: assignDept,
                            authorityLevel: matched?.level,
                            note: `Assigned to ${assignDept}`,
                          });
                        }}
                        className="px-4 py-2 bg-[#064E4A] text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Confirm Assignment
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Modal for Escalate */}
                {activeActionModal === "escalate" && (
                  <div className="pt-3 border-t border-teal-200 dark:border-teal-900 space-y-2">
                    <label className="block text-xs font-bold text-purple-900 dark:text-purple-300">
                      Provide Statutory Reason for Escalation (Records in Timeline & Notifies Complainant):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={escalationReason}
                        onChange={(e) => setEscalationReason(e.target.value)}
                        placeholder="e.g. Budgetary sanction required from Taluk / District administration"
                        className="flex-1 px-3 py-2 text-xs border border-purple-300 dark:border-purple-800 rounded-xl bg-white dark:bg-gray-800"
                      />
                      <button
                        type="button"
                        disabled={actionLoading || !escalationReason.trim()}
                        onClick={() => handleExecuteAction({ action: "escalate", reason: escalationReason })}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Confirm Escalation
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Modal for Resolve */}
                {activeActionModal === "resolve" && (
                  <div className="pt-3 border-t border-teal-200 dark:border-teal-900 space-y-2">
                    <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Official Resolution Summary & Corrective Action (Mandatory, min 5 chars):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resolutionInput}
                        onChange={(e) => setResolutionInput(e.target.value)}
                        placeholder="e.g. Broken valve replaced at Ward 03 pipeline. Water supply verified."
                        className="flex-1 px-3 py-2 text-xs border border-emerald-300 dark:border-emerald-800 rounded-xl bg-white dark:bg-gray-800"
                      />
                      <button
                        type="button"
                        disabled={actionLoading || resolutionInput.trim().length < 5}
                        onClick={() => handleExecuteAction({ action: "resolve", resolutionNotes: resolutionInput })}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Confirm Resolution
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Official Remark Input (always allowed, even for resolved complaints) */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={remarkInput}
                    onChange={(e) => setRemarkInput(e.target.value)}
                    placeholder="Add official progress remark or inspection note to audit timeline..."
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={actionLoading || !remarkInput.trim()}
                    onClick={() => {
                      handleExecuteAction({ action: "remark", note: remarkInput });
                      setRemarkInput("");
                    }}
                    className="px-3.5 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Add Remark</span>
                  </button>
                </div>
              </div>

              {/* AUDIT TIMELINE */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Chronological Audit Trail & Timeline Events ({timeline.length})
                </h3>
                <div className="space-y-2.5">
                  {timeline.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="p-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#051817] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#064E4A] dark:text-teal-300">{evt.action}</span>
                        <span className="text-[11px] text-gray-400">{new Date(evt.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{evt.note}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-0.5">
                        <span>Recorded by: <strong className="text-gray-700 dark:text-gray-400">{evt.updatedBy}</strong></span>
                        {evt.assignedTo && <span>• Assigned: {evt.assignedTo}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
