"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/UI/PageContainer";
import { useAuth } from "@/context/AuthContext";
import {
  Phone,
  Mail,
  MapPin,
  Home,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  LogOut,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Bell,
  AlertTriangle,
  Droplets,
  Zap,
  Trash2,
  Construction,
  ShieldAlert,
  ChevronRight,
  Filter,
  Newspaper,
  CalendarDays,
  Landmark,
  Briefcase,
  User,
  MessageSquare,
  Bot,
  HelpCircle,
  Clock,
  Check,
  CheckCheck,
  UserCheck,
  X,
  ExternalLink,
  Sparkles,
  Send,
} from "lucide-react";
import { NoticeRecord } from "@/lib/db/notices";
import { ComplaintRecord } from "@/lib/db/complaints";
import { ServiceApplicationRecord } from "@/lib/db/types";

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

import { AskCivSetuModal } from "@/components/AI/AskCivSetuModal";
import { useTranslation } from "@/context/AccessibilityContext";

// =============================================================================
// Main Citizen Dashboard Component
// =============================================================================

export default function DashboardPage() {
  const { citizen, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { t, language } = useTranslation();

  // Data states
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsFilter, setComplaintsFilter] = useState<"ALL" | "ACTIVE" | "ESCALATED" | "RESOLVED">("ALL");

  const [applications, setApplications] = useState<ServiceApplicationRecord[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsFilter, setApplicationsFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticeTab, setNoticeTab] = useState<"ALL" | "COMPLAINT_UPDATES" | "WARD" | "EMERGENCY">("ALL");

  const [notifications, setNotifications] = useState<CitizenNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Real-time live update states
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [liveAlert, setLiveAlert] = useState<{
    id: string;
    type: string;
    title: string;
    message: string;
    complaintId?: string;
  } | null>(null);

  // Ask CivSetu Assistant Modal State
  const [askModalOpen, setAskModalOpen] = useState(false);
  const profileSectionRef = useRef<HTMLDivElement>(null);

  // Fetch citizen data
  useEffect(() => {
    if (!citizen) return;
    const citizenMobile = citizen.mobileNumber;

    let isMounted = true;

    async function loadDashboardData() {
      setComplaintsLoading(true);
      setApplicationsLoading(true);
      setNoticesLoading(true);
      setNotificationsLoading(true);

      try {
        const [complaintsRes, appsRes, noticesRes, notifsRes] = await Promise.allSettled([
          fetch("/api/complaints").then((r) => r.json()),
          fetch(`/api/applications?mobile=${encodeURIComponent(citizenMobile)}`).then((r) => r.json()),
          fetch("/api/notices?limit=10").then((r) => r.json()),
          fetch("/api/notifications?limit=25").then((r) => r.json()),
        ]);

        if (!isMounted) return;

        if (complaintsRes.status === "fulfilled" && complaintsRes.value?.success && Array.isArray(complaintsRes.value?.data)) {
          setComplaints(complaintsRes.value.data);
        }
        setComplaintsLoading(false);

        if (appsRes.status === "fulfilled" && appsRes.value?.success && Array.isArray(appsRes.value?.data)) {
          setApplications(appsRes.value.data);
        }
        setApplicationsLoading(false);

        if (noticesRes.status === "fulfilled" && noticesRes.value?.success && Array.isArray(noticesRes.value?.data)) {
          setNotices(noticesRes.value.data);
        }
        setNoticesLoading(false);

        if (notifsRes.status === "fulfilled" && notifsRes.value?.success && Array.isArray(notifsRes.value?.data)) {
          setNotifications(notifsRes.value.data);
          setUnreadNotificationsCount(notifsRes.value.unreadCount || 0);
        }
        setNotificationsLoading(false);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (isMounted) {
          setComplaintsLoading(false);
          setApplicationsLoading(false);
          setNoticesLoading(false);
          setNotificationsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [citizen]);

  const markNotificationRead = async (id: number) => {
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
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  // Real-Time SSE Listener for Citizen Dashboard
  useEffect(() => {
    if (!citizen) return;

    let eventSource: EventSource | null = null;
    let retryTimer: NodeJS.Timeout | null = null;

    function connectSSE() {
      try {
        eventSource = new EventSource("/api/realtime/complaints");

        eventSource.onopen = () => {
          setRealtimeConnected(true);
        };

        // 1. Complaint Created (if submitted by this citizen)
        eventSource.addEventListener("complaint_created", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data && citizen && data.citizenId === citizen.id) {
              setComplaints((prev) => {
                if (prev.some((c) => c.id === data.id)) return prev;
                return [data, ...prev];
              });
              setLiveAlert({
                id: String(Date.now()),
                type: "complaint_created",
                title: "Grievance Lodged Successfully",
                message: `Ticket #${data.id} has been registered with Lakshmeshwar TMC.`,
                complaintId: data.id,
              });
            }
          } catch (e) {
            console.error("Error in SSE complaint_created:", e);
          }
        });

        // 2. Complaint Updated / Assigned / Escalated
        eventSource.addEventListener("complaint_updated", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.complaintId) {
              setComplaints((prev) =>
                prev.map((c) => {
                  if (c.id === data.complaintId) {
                    return {
                      ...c,
                      status: data.status || c.status,
                      assignedAuthority: data.assignedAuthority || c.assignedAuthority,
                      authorityLevel: data.authorityLevel || c.authorityLevel,
                      updatedAt: data.timestamp || new Date().toISOString(),
                    };
                  }
                  return c;
                })
              );

              // If this complaint belongs to the citizen, show live toast
              setComplaints((currentComplaints) => {
                const isMine = currentComplaints.some((c) => c.id === data.complaintId);
                if (isMine) {
                  setLiveAlert({
                    id: String(Date.now()),
                    type: "complaint_updated",
                    title: `Complaint Updated: ${data.status || "Progressed"}`,
                    message: `Ticket #${data.complaintId} has progressed to "${data.status}".`,
                    complaintId: data.complaintId,
                  });
                }
                return currentComplaints;
              });

              // Refresh notifications
              fetch("/api/notifications?limit=25")
                .then((r) => r.json())
                .then((res) => {
                  if (res?.success && Array.isArray(res.data)) {
                    setNotifications(res.data);
                    setUnreadNotificationsCount(res.unreadCount || 0);
                  }
                })
                .catch(() => {});
            }
          } catch (e) {
            console.error("Error in SSE complaint_updated:", e);
          }
        });

        // 3. Complaint Resolved
        eventSource.addEventListener("complaint_resolved", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.complaintId) {
              setComplaints((prev) =>
                prev.map((c) => {
                  if (c.id === data.complaintId) {
                    return {
                      ...c,
                      status: "Resolved",
                      resolutionNotes: data.resolutionNotes || c.resolutionNotes,
                      resolvedAt: data.resolvedAt || new Date().toISOString(),
                    };
                  }
                  return c;
                })
              );

              setComplaints((currentComplaints) => {
                const isMine = currentComplaints.some((c) => c.id === data.complaintId);
                if (isMine) {
                  setLiveAlert({
                    id: String(Date.now()),
                    type: "complaint_resolved",
                    title: "Grievance Resolved 🎉",
                    message: `Ticket #${data.complaintId} has been resolved by Lakshmeshwar TMC.`,
                    complaintId: data.complaintId,
                  });
                }
                return currentComplaints;
              });

              fetch("/api/notifications?limit=25")
                .then((r) => r.json())
                .then((res) => {
                  if (res?.success && Array.isArray(res.data)) {
                    setNotifications(res.data);
                    setUnreadNotificationsCount(res.unreadCount || 0);
                  }
                })
                .catch(() => {});
            }
          } catch (e) {
            console.error("Error in SSE complaint_resolved:", e);
          }
        });

        // 4. Notice / Emergency Broadcast
        eventSource.addEventListener("notice_published", (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data) {
              setLiveAlert({
                id: String(Date.now()),
                type: "notice_published",
                title: data.isEmergency ? "🚨 Emergency Broadcast" : "📢 Important Municipal Notice",
                message: data.title,
              });
              fetch("/api/notices?limit=10")
                .then((r) => r.json())
                .then((res) => {
                  if (res?.success && Array.isArray(res.data)) {
                    setNotices(res.data);
                  }
                })
                .catch(() => {});
            }
          } catch (e) {
            console.error("Error in SSE notice_published:", e);
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
  }, [citizen]);

  // Auto-dismiss citizen live alert
  useEffect(() => {
    if (liveAlert) {
      const timer = setTimeout(() => setLiveAlert(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [liveAlert]);

  // Loading state
  if (authLoading) {
    return (
      <PageContainer
        title="Citizen Portal"
        subtitle="Loading your official municipal account profile..."
        breadcrumbs={[{ label: "Citizen Portal" }]}
      >
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connecting to Lakshmeshwar TMC citizen services...
          </p>
        </div>
      </PageContainer>
    );
  }

  // Unauthenticated State
  if (!isAuthenticated || !citizen) {
    return (
      <PageContainer
        title="Citizen Portal"
        subtitle="Official Citizen Services Gateway - Lakshmeshwar Town Municipal Council"
        breadcrumbs={[{ label: "Citizen Portal" }]}
      >
        <div className="max-w-md mx-auto py-8">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Authentication Required
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Please log in to your registered CivSetu citizen account to access your personal dashboard, filed grievances, and municipal applications.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="bg-[#064E4A] hover:bg-[#0B6B63] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-sm"
              >
                Sign In to Account
              </Link>
              <Link
                href="/register"
                className="border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
              >
                Register Citizen
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Calculate Complaints Statistics
  const complaintStats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "Submitted").length,
    underReview: complaints.filter((c) => ["Under Review", "Assigned"].includes(c.status)).length,
    inProgress: complaints.filter((c) => ["In Progress", "Near Deadline"].includes(c.status)).length,
    escalated: complaints.filter((c) => c.status === "Escalated").length,
    resolved: complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length,
  };

  // Filtered Complaints List
  const filteredComplaints = complaints.filter((c) => {
    if (complaintsFilter === "ACTIVE") return !["Resolved", "Closed"].includes(c.status);
    if (complaintsFilter === "ESCALATED") return c.status === "Escalated";
    if (complaintsFilter === "RESOLVED") return ["Resolved", "Closed"].includes(c.status);
    return true;
  });

  // Calculate Applications Statistics
  const applicationStats = {
    total: applications.length,
    pending: applications.filter((a) =>
      ["SUBMITTED", "UNDER_VERIFICATION", "INSPECTION_SCHEDULED"].includes(a.status)
    ).length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
    completed: applications.filter((a) => a.status === "COMPLETED").length,
  };

  // Filtered Applications List
  const filteredApplications = applications.filter((a) => {
    if (applicationsFilter === "PENDING") {
      return ["SUBMITTED", "UNDER_VERIFICATION", "INSPECTION_SCHEDULED"].includes(a.status);
    }
    if (applicationsFilter === "APPROVED") return a.status === "APPROVED";
    if (applicationsFilter === "REJECTED") return a.status === "REJECTED";
    return true;
  });

  // Notifications filtering
  const wardNormalized = citizen.wardNumber.toLowerCase();
  const wardNotices = notices.filter(
    (n) => n.targetWards && n.targetWards.toLowerCase().includes(wardNormalized)
  );
  const emergencyNotices = notices.filter((n) => n.isEmergency || n.priority === "Urgent");
  const municipalNotices = notices.filter(
    (n) => !n.targetWards || n.targetWards.toLowerCase().includes("all")
  );

  const scrollToProfile = () => {
    profileSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageContainer
      title="Citizen Workspace & Portal Dashboard"
      subtitle={`Welcome, ${citizen.fullName} | Lakshmeshwar Town Municipal Council`}
      breadcrumbs={[{ label: "Citizen Portal" }]}
    >
      {/* Floating Live Real-Time Alert Toast */}
      {liveAlert && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-900 border-2 border-emerald-500 rounded-xl shadow-2xl p-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <Bell className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Live Update
                </span>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  {liveAlert.title}
                </h4>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
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
            <div className="mt-2 text-right">
              <Link
                href={`/complaints/${liveAlert.complaintId}`}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Track Ticket &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto py-2 sm:py-4 space-y-6">
        {/* ========================================================================= */}
        {/* TOP QUICK ACTIONS TOOLBAR                                                 */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#042F2E] to-[#064E4A] text-white shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-400/20 text-teal-200 border border-teal-400/30">
                Lakshmeshwar Citizen Workspace
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                {t.dashboard?.quickActions || "Civic Quick Actions & Services"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${realtimeConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-xs text-teal-200 font-semibold">{citizen.wardNumber}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold hidden sm:inline">
                {realtimeConnected ? "Live Sync Active" : "Connecting..."}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
            <Link
              href="/complaints/new"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>{t.dashboard?.reportComplaint || "Report Complaint"}</span>
            </Link>

            <Link
              href="/track"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>{t.dashboard?.trackGrievance || "Track Complaint"}</span>
            </Link>

            <Link
              href="/notices"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <Bell className="w-4 h-4 text-cyan-300" />
              <span>{t.dashboard?.viewNotices || "Announcements"}</span>
            </Link>

            <button
              type="button"
              onClick={() => setAskModalOpen(true)}
              className="p-3 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 border border-teal-300/30 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs text-teal-100"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>{t.dashboard?.askAssistant || "Ask CivSetu"}</span>
            </button>

            <button
              type="button"
              onClick={scrollToProfile}
              className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <User className="w-4 h-4 text-purple-300" />
              <span>{t.dashboard?.myProfile || "My Profile"}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: MY PROFILE                                                     */}
        {/* ========================================================================= */}
        <div
          ref={profileSectionRef}
          className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#064E4A] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {citizen.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                    {citizen.fullName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Verified Citizen
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  Citizen ID: {citizen.id}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-semibold transition"
              title="Sign Out of Citizen Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.nav?.logout || "Logout"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
            {/* Mobile Number */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <Phone className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>{t.forms?.mobileNumber || "Registered Mobile"}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100 font-mono">
                <span>+91 {citizen.mobileNumber}</span>
                {citizen.mobileVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
            </div>

            {/* Email Address */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <Mail className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>{t.forms?.emailAddress || "Email Address"}</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {citizen.email}
              </p>
            </div>

            {/* Ward */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>{t.forms?.wardNumber || "Jurisdiction Ward"}</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {citizen.wardNumber}
              </p>
            </div>

            {/* Address */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <Home className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>{t.forms?.streetAddress || "Residential Address"}</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {citizen.residentialAddress}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: MY COMPLAINTS                                                  */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>{t.dashboard?.myComplaints || "My Grievances"} ({complaintStats.total})</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Complaints lodged under Lakshmeshwar TMC statutory SLA resolution
              </p>
            </div>

            <Link
              href="/complaints/new"
              className="px-3.5 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start sm:self-center"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.buttons?.reportComplaint || "New Grievance"}</span>
            </Link>
          </div>

          {/* 6 Complaints Stat Counters: total, submitted, under review, in progress, escalated, resolved */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">{t.dashboard?.statsTotal || "Total"}</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{complaintStats.total}</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block uppercase">{t.dashboard?.statsSubmitted || "Submitted"}</span>
              <span className="text-lg font-extrabold text-teal-800 dark:text-teal-300">{complaintStats.submitted}</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block uppercase">{t.dashboard?.statsUnderReview || "Under Review"}</span>
              <span className="text-lg font-extrabold text-blue-800 dark:text-blue-300">{complaintStats.underReview}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase">{t.dashboard?.statsInProgress || "In Progress"}</span>
              <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">{complaintStats.inProgress}</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block uppercase">{t.dashboard?.statsEscalated || "Escalated"}</span>
              <span className="text-lg font-extrabold text-rose-800 dark:text-rose-300">{complaintStats.escalated}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">{t.dashboard?.statsResolved || "Resolved"}</span>
              <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300">{complaintStats.resolved}</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            <button
              onClick={() => setComplaintsFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                complaintsFilter === "ALL"
                  ? "bg-[#064E4A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              All ({complaintStats.total})
            </button>
            <button
              onClick={() => setComplaintsFilter("ACTIVE")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                complaintsFilter === "ACTIVE"
                  ? "bg-[#064E4A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              Active ({complaintStats.submitted + complaintStats.underReview + complaintStats.inProgress})
            </button>
            <button
              onClick={() => setComplaintsFilter("ESCALATED")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                complaintsFilter === "ESCALATED"
                  ? "bg-rose-700 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              Escalated ({complaintStats.escalated})
            </button>
            <button
              onClick={() => setComplaintsFilter("RESOLVED")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                complaintsFilter === "RESOLVED"
                  ? "bg-emerald-700 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              Resolved ({complaintStats.resolved})
            </button>
          </div>

          {/* Complaints Stream */}
          {complaintsLoading ? (
            <div className="py-6 text-center text-xs text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#064E4A] dark:text-teal-400" />
              <p className="mt-2">Loading your registered grievances...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <FileText className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  No grievances found under selected filter.
                </p>
                <p className="text-xs text-gray-500">
                  Report a drinking water leak, broken streetlight, or garbage overflow to notify TMC engineers.
                </p>
              </div>
              <Link
                href="/complaints/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064E4A] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0B6B63] transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Lodge Grievance</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:border-[#064E4A] dark:hover:border-teal-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#064E4A] dark:text-teal-300">
                        {c.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {c.category}
                      </span>
                      <span className="text-gray-400">• {c.ward}</span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {c.title}
                    </h4>

                    <p className="text-gray-500 line-clamp-1">{c.description}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        c.status === "Escalated"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse"
                          : ["Resolved", "Closed"].includes(c.status)
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                          : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300"
                      }`}
                    >
                      {c.status}
                    </span>

                    <Link
                      href={`/track?id=${encodeURIComponent(c.id)}`}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-[#064E4A] text-[#064E4A] dark:text-teal-300 rounded-lg font-bold flex items-center gap-1 shadow-xs transition"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: MY APPLICATIONS                                                */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>{t.dashboard?.myApplications || "My Statutory Service Applications"} ({applicationStats.total})</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Water connections, khata mutations, trade licenses, and statutory permits
              </p>
            </div>

            <Link
              href="/applications"
              className="px-3.5 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start sm:self-center"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.buttons?.applyNow || "New Application"}</span>
            </Link>
          </div>

          {/* 4 Application Stat Counters: pending, approved, rejected, completed */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase">{t.dashboard?.pending || "Pending"}</span>
              <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">{applicationStats.pending}</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block uppercase">{t.dashboard?.approved || "Approved"}</span>
              <span className="text-lg font-extrabold text-blue-800 dark:text-blue-300">{applicationStats.approved}</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block uppercase">{t.dashboard?.rejected || "Rejected"}</span>
              <span className="text-lg font-extrabold text-rose-800 dark:text-rose-300">{applicationStats.rejected}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">{t.dashboard?.completed || "Completed"}</span>
              <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300">{applicationStats.completed}</span>
            </div>
          </div>

          {/* Applications Stream */}
          {applicationsLoading ? (
            <div className="py-6 text-center text-xs text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#064E4A] dark:text-teal-400" />
              <p className="mt-2">Checking your submitted applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-8 text-center space-y-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              <FileText className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  No service applications filed yet.
                </p>
                <p className="text-xs text-gray-500">
                  Apply for drinking water pipeline hookups, khata extracts, building permits, or street vendor registration.
                </p>
              </div>
              <Link
                href="/applications"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064E4A] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0B6B63] transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start Service Application</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:border-[#064E4A] dark:hover:border-teal-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#064E4A] dark:text-teal-300">
                        {app.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {app.serviceCode}
                      </span>
                      <span className="text-gray-400">
                        • {new Date(app.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {app.serviceName}
                    </h4>

                    {app.officialRemarks && (
                      <p className="text-teal-800 dark:text-teal-300 italic text-[11px]">
                        Desk remarks: {app.officialRemarks}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        app.status === "APPROVED" || app.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                          : app.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                      }`}
                    >
                      {app.status.replace("_", " ")}
                    </span>

                    <Link
                      href={`/track?id=${encodeURIComponent(app.id)}`}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-[#064E4A] text-[#064E4A] dark:text-teal-300 rounded-lg font-bold flex items-center gap-1 shadow-xs transition"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: NOTIFICATIONS & BULLETINS                                      */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>{t.dashboard?.notifications || "Civic Notifications"} & Bulletins</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t.notifications?.subtitle || "Grievance status updates, municipal notices, ward circulars, and emergency alerts"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/notifications"
                className="text-xs font-bold text-[#064E4A] dark:text-teal-300 hover:underline flex items-center gap-1"
              >
                <span>{t.notifications?.title || "Notification Center"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Tabs: All Notifications, Complaint Updates, Ward Announcements, Emergency Alerts */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setNoticeTab("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  noticeTab === "ALL"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {t.notifications?.all || "All Updates"}
              </button>
              <button
                onClick={() => setNoticeTab("COMPLAINT_UPDATES")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  noticeTab === "COMPLAINT_UPDATES"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                <span>{t.dashboard?.myComplaints || "Complaint Updates"}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                  {notifications.length}
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setNoticeTab("WARD")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  noticeTab === "WARD"
                    ? "bg-[#064E4A] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {citizen.wardNumber} ({wardNotices.length})
              </button>
              <button
                onClick={() => setNoticeTab("EMERGENCY")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                  noticeTab === "EMERGENCY"
                    ? "bg-rose-700 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Emergency Alerts ({emergencyNotices.length})</span>
              </button>
            </div>

            {noticeTab === "COMPLAINT_UPDATES" && unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="space-y-3 pt-1">
            {noticeTab === "COMPLAINT_UPDATES" ? (
              notificationsLoading ? (
                <div className="py-8 text-center text-xs text-gray-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#064E4A] dark:text-teal-400" />
                  <p>Loading your complaint notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center space-y-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  <Bell className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="font-bold text-gray-700 dark:text-gray-300">No grievance notifications yet</p>
                  <p className="text-[11px]">When you file a complaint, updates on acceptance, assignment, escalation, and resolution will appear here.</p>
                </div>
              ) : (
                notifications.slice(0, 6).map((n) => {
                  let badge = {
                    label: "Update",
                    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300",
                    icon: Bell,
                  };

                  if (n.eventType === "COMPLAINT_REGISTERED") {
                    badge = {
                      label: "Submitted",
                      color: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
                      icon: FileText,
                    };
                  } else if (n.eventType === "COMPLAINT_ACCEPTED") {
                    badge = {
                      label: "Accepted",
                      color: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
                      icon: CheckCircle2,
                    };
                  } else if (n.eventType === "ASSIGNED") {
                    badge = {
                      label: "Assigned",
                      color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
                      icon: UserCheck,
                    };
                  } else if (n.eventType === "ESCALATED") {
                    badge = {
                      label: "Escalated",
                      color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse",
                      icon: ShieldAlert,
                    };
                  } else if (n.eventType === "RESOLVED") {
                    badge = {
                      label: "Resolved",
                      color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
                      icon: CheckCheck,
                    };
                  } else if (n.eventType === "REMARK_ADDED") {
                    badge = {
                      label: "Official Note",
                      color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
                      icon: MessageSquare,
                    };
                  }

                  const BadgeIcon = badge.icon;

                  return (
                    <div
                      key={n.id}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition ${
                        !n.isRead
                          ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800"
                          : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 mt-0.5 border ${badge.color}`}>
                        <BadgeIcon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-teal-600" title="Unread" />
                          )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                          <span>{new Date(n.createdAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          {n.complaintId && (
                            <span>• Complaint #{n.complaintId}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0 self-center">
                        {n.complaintId && (
                          <Link
                            href={`/track?id=${encodeURIComponent(n.complaintId)}`}
                            onClick={() => {
                              if (!n.isRead) markNotificationRead(n.id);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-[#064E4A] dark:text-teal-300 hover:underline flex items-center gap-0.5"
                          >
                            <span>Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            className="text-[10px] text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              (noticeTab === "WARD"
                ? wardNotices
                : noticeTab === "EMERGENCY"
                ? emergencyNotices
                : notices
              )
                .slice(0, 4)
                .map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition ${
                      n.isEmergency || n.priority === "Urgent"
                        ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                        : "bg-gray-50/70 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                        n.isEmergency
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                          : "bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-400"
                      }`}
                    >
                      {n.isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-gray-100">{n.title}</span>
                        {n.isEmergency && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white animate-pulse">
                            EMERGENCY ALERT
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 line-clamp-2 mt-0.5">{n.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">
                        Published: {new Date(n.publishDate).toLocaleDateString()} • Target: {n.targetWards || n.targetScope}
                      </p>
                    </div>

                    <Link
                      href={`/notices/${n.id}`}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#064E4A] dark:text-teal-300 hover:underline flex-shrink-0 self-center"
                    >
                      Read
                    </Link>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: COMPLETE CIVIC ECOSYSTEM DIRECTORY LINKS                       */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Civic Ecosystem Portals & Public Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/services"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <Briefcase className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Services Directory</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Water, sanitation, certificates & emergency contacts
              </p>
            </Link>

            <Link
              href="/schemes"
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <Landmark className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Welfare Schemes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Check eligibility for central & state benefits
              </p>
            </Link>

            <Link
              href={`/news?ward=${encodeURIComponent(citizen.wardNumber)}`}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <Newspaper className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Town News</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Local journalism & developmental stories
              </p>
            </Link>

            <Link
              href={`/events?ward=${encodeURIComponent(citizen.wardNumber)}`}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] hover:border-[#064E4A] dark:hover:border-teal-400 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <CalendarDays className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#064E4A] dark:group-hover:text-teal-400 transition" />
              </div>
              <p className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">Events & Festivals</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Community programs and ward consultations
              </p>
            </Link>
          </div>
        </div>

        {/* Ask CivSetu Assistant Modal */}
        <AskCivSetuModal
          isOpen={askModalOpen}
          onClose={() => setAskModalOpen(false)}
          citizenWard={citizen.wardNumber}
        />
      </div>
    </PageContainer>
  );
}
