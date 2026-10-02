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
  X,
  ExternalLink,
  Sparkles,
  Send,
} from "lucide-react";
import { NoticeRecord } from "@/lib/db/notices";
import { ComplaintRecord } from "@/lib/db/complaints";
import { ServiceApplicationRecord } from "@/lib/db/types";

// =============================================================================
// Ask CivSetu Assistant Modal
// =============================================================================

function AskCivSetuModal({
  isOpen,
  onClose,
  citizenWard,
}: {
  isOpen: boolean;
  onClose: () => void;
  citizenWard: string;
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string; link?: string; linkText?: string }[]
  >([
    {
      sender: "bot",
      text: `Namaskara! I am CivSetu, your automated Lakshmeshwar TMC civic assistant. How can I help you today? You can ask about drinking water timings, garbage collection schedules, property tax (Form-3), lodging grievances, or municipal welfare schemes.`,
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  if (!isOpen) return null;

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setQuery("");
    setThinking(true);

    setTimeout(() => {
      const q = userText.toLowerCase();
      let answer = "";
      let link: string | undefined;
      let linkText: string | undefined;

      if (q.includes("water") || q.includes("tap") || q.includes("leak")) {
        answer = `Drinking water in ${citizenWard} is supplied on an alternate-day schedule by Lakshmeshwar TMC Engineering Wing. For new connections, apply via Form TMC-W1. If you are experiencing a pipeline leak or low pressure, you can lodge an official grievance.`;
        link = "/complaints/new?category=water";
        linkText = "Report Water Supply Issue";
      } else if (q.includes("garbage") || q.includes("waste") || q.includes("dump") || q.includes("clean")) {
        answer = `Door-to-door municipal solid waste collection operates daily between 6:30 AM and 10:30 AM across all 23 wards. Please segregate wet and dry waste into separate bins.`;
        link = "/complaints/new?category=waste";
        linkText = "Report Sanitation Issue";
      } else if (q.includes("tax") || q.includes("khata") || q.includes("property") || q.includes("form 3")) {
        answer = `Property tax can be assessed and paid at TMC Revenue Room No. 2 or online via E-Swathu. To request an E-Swathu Form-3 extract or ownership mutation, submit Form TMC-KT3 online.`;
        link = "/applications?service=khata";
        linkText = "Apply for Khata Extract";
      } else if (q.includes("streetlight") || q.includes("dark") || q.includes("light") || q.includes("bulb")) {
        answer = `Non-functional streetlights in Lakshmeshwar are managed by the Electrical & Streetlighting Wing with a statutory SLA of 24 to 48 hours.`;
        link = "/complaints/new?category=streetlights";
        linkText = "Report Defective Streetlight";
      } else if (q.includes("scheme") || q.includes("pension") || q.includes("subsidy") || q.includes("pmay")) {
        answer = `Lakshmeshwar citizens can access several welfare schemes including PMAY-U Housing Subsidy, Gruha Lakshmi, PM-SVANidhi Street Vendor Credit, and Sandhya Suraksha pension.`;
        link = "/schemes";
        linkText = "Browse Welfare Schemes";
      } else if (q.includes("track") || q.includes("status")) {
        answer = `You can track any grievance or municipal application in real-time by entering your Tracking Reference ID (e.g. CMP-LMC-2026-... or LMC-APP-2026-...).`;
        link = "/track";
        linkText = "Open Tracking Desk";
      } else {
        answer = `Thank you for your question regarding Lakshmeshwar TMC civic administration. You can lodge an official complaint, apply for municipal certificates, or view announcements directly from your citizen portal.`;
        link = "/services";
        linkText = "View Citizen Services Directory";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: answer,
          link,
          linkText,
        },
      ]);
      setThinking(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-[#042F2E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Ask CivSetu Civic Assistant</h3>
              <p className="text-[11px] text-teal-200">Lakshmeshwar TMC Automated Citizen Guidance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-teal-800 text-teal-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  m.sender === "user"
                    ? "bg-[#064E4A] text-white rounded-br-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-xs leading-relaxed"
                }`}
              >
                <p>{m.text}</p>
                {m.link && (
                  <Link
                    href={m.link}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800 shadow-xs"
                  >
                    <span>{m.linkText || "Learn more"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs w-28">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-150" />
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Queries */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-gray-400 font-semibold flex-shrink-0">Try asking:</span>
          {["Drinking water timings", "How to pay property tax", "Report broken streetlight", "Welfare schemes"].map(
            (sugg) => (
              <button
                key={sugg}
                type="button"
                onClick={() => setQuery(sugg)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#064E4A] whitespace-nowrap transition"
              >
                {sugg}
              </button>
            )
          )}
        </div>

        {/* Query Input */}
        <form onSubmit={handleAsk} className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about Lakshmeshwar civic services..."
            className="flex-1 px-3.5 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#064E4A]"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="p-2.5 bg-[#064E4A] hover:bg-[#0B6B63] disabled:opacity-50 text-white rounded-xl shadow-xs transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Main Citizen Dashboard Component
// =============================================================================

export default function DashboardPage() {
  const { citizen, loading: authLoading, isAuthenticated, logout } = useAuth();

  // Data states
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsFilter, setComplaintsFilter] = useState<"ALL" | "ACTIVE" | "ESCALATED" | "RESOLVED">("ALL");

  const [applications, setApplications] = useState<ServiceApplicationRecord[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsFilter, setApplicationsFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [noticeTab, setNoticeTab] = useState<"ALL" | "COMPLAINT_UPDATES" | "MUNICIPAL" | "WARD" | "EMERGENCY">("ALL");

  // Ask CivSetu Assistant Modal State
  const [askModalOpen, setAskModalOpen] = useState(false);
  const profileSectionRef = useRef<HTMLDivElement>(null);

  // Fetch citizen data
  useEffect(() => {
    if (!citizen) return;

    let isMounted = true;

    async function loadDashboardData() {
      // 1. Fetch citizen's filed complaints
      setComplaintsLoading(true);
      try {
        const res = await fetch("/api/complaints");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setComplaints(json.data);
        }
      } catch (err) {
        console.error("Failed to load citizen complaints:", err);
      } finally {
        if (isMounted) setComplaintsLoading(false);
      }

      // 2. Fetch citizen's service applications by registered mobile
      setApplicationsLoading(true);
      try {
        const res = await fetch(`/api/applications?mobile=${encodeURIComponent(citizen.mobileNumber)}`);
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setApplications(json.data);
        }
      } catch (err) {
        console.error("Failed to load citizen applications:", err);
      } finally {
        if (isMounted) setApplicationsLoading(false);
      }

      // 3. Fetch notices for notifications
      setNoticesLoading(true);
      try {
        const res = await fetch("/api/notices?limit=10");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setNotices(json.data);
        }
      } catch (err) {
        console.error("Failed to load notices for notifications:", err);
      } finally {
        if (isMounted) setNoticesLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [citizen]);

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
                Civic Quick Actions & Services
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-teal-200 font-semibold">{citizen.wardNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
            <Link
              href="/complaints/new"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Report Complaint</span>
            </Link>

            <Link
              href="/track"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>Track Complaint</span>
            </Link>

            <Link
              href="/notices"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <Bell className="w-4 h-4 text-cyan-300" />
              <span>Announcements</span>
            </Link>

            <button
              type="button"
              onClick={() => setAskModalOpen(true)}
              className="p-3 rounded-xl bg-teal-400/20 hover:bg-teal-400/30 border border-teal-300/30 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs text-teal-100"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Ask CivSetu</span>
            </button>

            <button
              type="button"
              onClick={scrollToProfile}
              className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition flex flex-col items-center justify-center text-center gap-1.5 font-bold shadow-xs border border-white/10"
            >
              <User className="w-4 h-4 text-purple-300" />
              <span>My Profile</span>
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
              <span>Logout</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
            {/* Mobile Number */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <Phone className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>Registered Mobile</span>
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
                <span>Email Address</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {citizen.email}
              </p>
            </div>

            {/* Ward */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>Jurisdiction Ward</span>
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {citizen.wardNumber}
              </p>
            </div>

            {/* Address */}
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px] font-medium">
                <Home className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                <span>Residential Address</span>
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
                <span>My Registered Grievances ({complaintStats.total})</span>
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
              <span>New Grievance</span>
            </Link>
          </div>

          {/* 6 Complaints Stat Counters: total, submitted, under review, in progress, escalated, resolved */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">Total</span>
              <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{complaintStats.total}</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
              <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block uppercase">Submitted</span>
              <span className="text-lg font-extrabold text-teal-800 dark:text-teal-300">{complaintStats.submitted}</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block uppercase">Under Review</span>
              <span className="text-lg font-extrabold text-blue-800 dark:text-blue-300">{complaintStats.underReview}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase">In Progress</span>
              <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">{complaintStats.inProgress}</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block uppercase">Escalated</span>
              <span className="text-lg font-extrabold text-rose-800 dark:text-rose-300">{complaintStats.escalated}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">Resolved</span>
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
                <FileCheck className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>My Statutory Service Applications ({applicationStats.total})</span>
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
              <span>New Application</span>
            </Link>
          </div>

          {/* 4 Application Stat Counters: pending, approved, rejected, completed */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase">Pending Review</span>
              <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">{applicationStats.pending}</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block uppercase">Approved</span>
              <span className="text-lg font-extrabold text-blue-800 dark:text-blue-300">{applicationStats.approved}</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block uppercase">Rejected</span>
              <span className="text-lg font-extrabold text-rose-800 dark:text-rose-300">{applicationStats.rejected}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">Completed</span>
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
              <FileCheck className="w-8 h-8 text-gray-400 mx-auto" />
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
                <span>Civic Notifications & Gazette Bulletins</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Grievance status updates, municipal notices, ward circulars, and emergency alerts
              </p>
            </div>

            <Link
              href="/notices"
              className="text-xs font-bold text-[#064E4A] dark:text-teal-300 hover:underline flex items-center gap-1"
            >
              <span>View All Gazette</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Tabs: All Notifications, Municipal Notices, Ward Announcements, Emergency Alerts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setNoticeTab("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                noticeTab === "ALL"
                  ? "bg-[#064E4A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              All Updates
            </button>
            <button
              onClick={() => setNoticeTab("COMPLAINT_UPDATES")}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                noticeTab === "COMPLAINT_UPDATES"
                  ? "bg-[#064E4A] text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              Complaint Updates ({complaints.length})
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

          {/* Notification List */}
          <div className="space-y-3 pt-1">
            {noticeTab === "COMPLAINT_UPDATES" ? (
              complaints.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No active complaint updates available.</p>
              ) : (
                complaints.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-teal-50/40 dark:bg-teal-950/20 flex items-start gap-3 text-xs"
                  >
                    <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-[#064E4A] dark:text-teal-400 flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          Complaint #{c.id} Status: {c.status}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(c.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-0.5">{c.title}</p>
                      {c.resolutionNotes && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
                          Resolution: {c.resolutionNotes}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/track?id=${encodeURIComponent(c.id)}`}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#064E4A] dark:text-teal-300 hover:underline flex-shrink-0"
                    >
                      Track
                    </Link>
                  </div>
                ))
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
                        Published: {new Date(n.publishedAt).toLocaleDateString()} • Target: {n.targetWards || n.targetScope}
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
