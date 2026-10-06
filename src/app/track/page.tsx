"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/UI/PageContainer";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  ArrowRight,
  LogIn,
  ShieldAlert,
  ArrowDown,
  AlertTriangle,
  GitFork,
  Check,
} from "lucide-react";

interface TimelineEvent {
  status: string;
  timestamp: string;
  note: string;
  action?: string;
  updatedBy?: string;
  authorityLevel?: string;
}

interface ResultData {
  type: "complaint" | "grievance" | "application";
  id: string;
  title: string;
  applicant: string;
  mobile?: string;
  ward?: string;
  location?: string;
  categoryOrService: string;
  status: string;
  priority?: string;
  deadline?: string;
  assignedAuthority?: string;
  authorityLevel?: string;
  photoUrl?: string | null;
  resolutionPhotoUrl?: string | null;
  resolutionLatitude?: number | null;
  resolutionLongitude?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
  officialRemarks?: string;
  descriptionOrAddress: string;
  timeline: TimelineEvent[];
}

const SLA_STAGES = [
  { key: "SUBMITTED", label: "Submitted" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "ESCALATED", label: "Escalated" },
  { key: "RESOLVED", label: "Resolved" },
];

function getStageIndex(statusStr: string): number {
  const s = (statusStr || "").toUpperCase().replace(/\s+/g, "_");
  if (s === "RESOLVED" || s === "CLOSED" || s === "COMPLETED") return 4;
  if (s === "ESCALATED") return 3;
  if (s === "IN_PROGRESS" || s === "ASSIGNED" || s === "NEAR_DEADLINE") return 2;
  if (s === "UNDER_REVIEW" || s === "UNDER_VERIFICATION" || s === "INSPECTION_SCHEDULED") return 1;
  return 0; // SUBMITTED
}

function getSlaInfo(createdAtStr: string, deadlineStr?: string, statusStr?: string) {
  const s = (statusStr || "").toUpperCase().replace(/\s+/g, "_");
  const isResolved = ["RESOLVED", "CLOSED", "COMPLETED"].includes(s);

  if (!deadlineStr) {
    return {
      hasDeadline: false,
      isResolved,
      isOverdue: false,
      text: isResolved ? "Resolved" : "SLA standard municipal turnaround applies",
      expectedDate: "Within standard municipal business turnaround",
      remainingText: isResolved ? "Completed" : "Active SLA",
      percent: isResolved ? 100 : 50,
      badgeColor: "bg-teal-50 text-[#064E4A] dark:bg-teal-950 dark:text-teal-300 border-teal-200",
    };
  }

  const deadline = new Date(deadlineStr).getTime();
  const created = new Date(createdAtStr).getTime();
  const now = Date.now();
  const totalDuration = Math.max(deadline - created, 1);
  const elapsed = Math.max(now - created, 0);

  const formattedDeadline = new Date(deadlineStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (isResolved) {
    return {
      hasDeadline: true,
      isResolved: true,
      isOverdue: false,
      text: "Resolution completed successfully within municipal SLA target",
      expectedDate: formattedDeadline,
      remainingText: "Resolved",
      percent: 100,
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    };
  }

  const diffMs = deadline - now;
  const isOverdue = diffMs < 0;
  const absDiff = Math.abs(diffMs);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

  let timeString = "";
  if (days > 0) timeString = `${days} days ${hours} hrs`;
  else if (hours > 0) timeString = `${hours} hrs ${minutes} mins`;
  else timeString = `${minutes} mins`;

  const percent = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 5), 100);

  if (isOverdue) {
    return {
      hasDeadline: true,
      isResolved: false,
      isOverdue: true,
      text: `SLA Target Breached: Overdue by ${timeString}`,
      expectedDate: formattedDeadline,
      remainingText: `Overdue by ${timeString}`,
      percent: 100,
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse",
    };
  }

  return {
    hasDeadline: true,
    isResolved: false,
    isOverdue: false,
    text: `${timeString} remaining to resolve`,
    expectedDate: formattedDeadline,
    remainingText: `${timeString} remaining`,
    percent,
    badgeColor:
      percent > 75
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
        : "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
  };
}

const ESCALATION_TIERS = [
  {
    tier: 1,
    key: "Local Authority",
    name: "Local Authority",
    authority: "Lakshmeshwar Town Municipal Council",
    officer: "Chief Officer / Junior Engineer Wing",
    sla: "Standard 48 Hours SLA",
    description: "Initial grievance scrutiny, field inspection, and primary engineering action.",
  },
  {
    tier: 2,
    key: "Block level",
    name: "Lakshmeshwar Taluk Panchayat",
    authority: "Taluk Panchayat Executive Office",
    officer: "Taluk Executive Officer (EO)",
    sla: "+72 Hours Escalation Tier",
    description: "Inter-departmental coordination, taluk-level engineering oversight.",
  },
  {
    tier: 3,
    key: "District Panchayat",
    name: "Gadag Zilla Panchayat",
    authority: "District Panchayat Secretariat",
    officer: "Chief Executive Officer (CEO, ZP)",
    sla: "+96 Hours Appellate Tier",
    description: "Zilla Panchayat administrative review and contractor accountability directive.",
  },
  {
    tier: 4,
    key: "District Administration",
    name: "District Administration",
    authority: "Office of the Deputy Commissioner & District Magistrate, Gadag",
    officer: "Deputy Commissioner (DC, Gadag)",
    sla: "Final Statutory Executive Authority",
    description: "Highest district executive intervention, disciplinary inquiry, and emergency allocation.",
  },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [trackingInput, setTrackingInput] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    if (initialId) {
      setTrackingInput(initialId);
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch?: string) => {
    const query = (idToSearch || trackingInput).trim();
    if (!query) {
      setError("Please enter a valid Complaint ID, Tracking Reference, or Mobile Number.");
      return;
    }

    // Keep URL query in sync when manual search is performed
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("id") !== query) {
        url.searchParams.set("id", query);
        window.history.replaceState(null, "", url.toString());
      }
    }

    setLoading(true);
    setError(null);
    setAuthError(false);
    setResult(null);

    try {
      const upperQuery = query.toUpperCase();
      const isComplaint = upperQuery.startsWith("CMP-") || upperQuery.startsWith("CMP-LMC-");
      const isApp = upperQuery.startsWith("LMC-APP");
      const isLegacyGrv = upperQuery.startsWith("LMC-GRV");

      // 1. If Complaint prefix: directly query the PostgreSQL-backed complaint API
      if (isComplaint) {
        const cmpRes = await fetch(`/api/complaints/${encodeURIComponent(query)}`, {
          cache: "no-store",
          credentials: "include",
        });
        const cmpJson = await cmpRes.json().catch(() => ({}));

        if (cmpRes.ok && cmpJson.success && cmpJson.data) {
          const cmp = cmpJson.data;
          setResult({
            type: "complaint",
            id: cmp.id,
            title: cmp.title,
            applicant: cmp.citizenName || "Citizen Complainant",
            mobile: cmp.citizenMobile || "",
            ward: cmp.ward,
            location: cmp.address || undefined,
            categoryOrService: cmp.category,
            status: cmp.status,
            priority: cmp.priority,
            deadline: cmp.deadline,
            assignedAuthority: cmp.assignedAuthority,
            authorityLevel: cmp.authorityLevel,
            photoUrl: cmp.photoUrl,
            resolutionPhotoUrl: cmp.resolutionPhotoUrl,
            resolutionLatitude: cmp.resolutionLatitude,
            resolutionLongitude: cmp.resolutionLongitude,
            latitude: cmp.latitude,
            longitude: cmp.longitude,
            createdAt: cmp.createdAt,
            updatedAt: cmp.updatedAt,
            officialRemarks: cmp.resolutionNotes || cmp.escalationReason || undefined,
            descriptionOrAddress: cmp.description,
            timeline: (cmp.timeline || []).map((t: any) => ({
              status: t.status,
              action: t.action,
              timestamp: t.createdAt,
              note: t.note,
              updatedBy: t.updatedBy,
              authorityLevel: t.authorityLevel,
            })),
          });
          setLoading(false);
          return;
        }

        if (cmpRes.status === 401) {
          setError(
            "Authentication Required: You must be signed in to view official grievance details for this tracking ID."
          );
          setAuthError(true);
          setLoading(false);
          return;
        }

        if (cmpRes.status === 403) {
          setError(
            "Access Denied: You are not authorized to view this complaint. This grievance is registered under a different citizen account."
          );
          setLoading(false);
          return;
        }

        if (cmpRes.status === 404) {
          setError(
            `No official complaint record found for reference '${query}'. Please verify your Complaint ID.`
          );
          setLoading(false);
          return;
        }
      }

      // 2. If Application prefix: query applications endpoint
      if (isApp) {
        const res = await fetch(`/api/applications/${encodeURIComponent(query)}`);
        const json = await res.json().catch(() => ({}));
        if (json.success && json.data) {
          const app = json.data;
          setResult({
            type: "application",
            id: app.id,
            title: app.serviceName,
            applicant: app.applicantName,
            mobile: app.mobileNumber,
            ward: app.wardNumber ? `Ward ${app.wardNumber}` : undefined,
            categoryOrService: app.serviceCode,
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            officialRemarks: app.officialRemarks,
            descriptionOrAddress: app.address,
            timeline: app.timeline || [],
          });
          setLoading(false);
          return;
        }
      }

      // 3. If Legacy Grievance prefix: query grievances endpoint
      if (isLegacyGrv) {
        const grvRes = await fetch(`/api/grievances/${encodeURIComponent(query)}`);
        const grvJson = await grvRes.json().catch(() => ({}));
        if (grvJson.success && grvJson.data) {
          const grv = grvJson.data;
          setResult({
            type: "grievance",
            id: grv.id,
            title: grv.subject,
            applicant: grv.citizenName,
            mobile: grv.mobileNumber,
            ward: grv.wardNumber ? `Ward ${grv.wardNumber}` : undefined,
            categoryOrService: grv.category.toUpperCase(),
            status: grv.status,
            createdAt: grv.createdAt,
            updatedAt: grv.updatedAt,
            officialRemarks: grv.officialRemarks,
            descriptionOrAddress: grv.description,
            timeline: grv.timeline || [],
          });
          setLoading(false);
          return;
        }
      }

      // 4. Fallback search across endpoints for generic query (e.g. mobile number or ID without prefix)
      if (!isComplaint && !isApp && !isLegacyGrv) {
        // Try complaint first
        const cmpRes = await fetch(`/api/complaints/${encodeURIComponent(query)}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (cmpRes.ok) {
          const cmpJson = await cmpRes.json().catch(() => ({}));
          if (cmpJson.success && cmpJson.data) {
            const cmp = cmpJson.data;
            setResult({
              type: "complaint",
              id: cmp.id,
              title: cmp.title,
              applicant: cmp.citizenName || "Citizen Complainant",
              mobile: cmp.citizenMobile || "",
              ward: cmp.ward,
              location: cmp.address || undefined,
              categoryOrService: cmp.category,
              status: cmp.status,
              priority: cmp.priority,
              deadline: cmp.deadline,
              assignedAuthority: cmp.assignedAuthority,
              authorityLevel: cmp.authorityLevel,
              photoUrl: cmp.photoUrl,
            resolutionPhotoUrl: cmp.resolutionPhotoUrl,
            resolutionLatitude: cmp.resolutionLatitude,
            resolutionLongitude: cmp.resolutionLongitude,
              latitude: cmp.latitude,
              longitude: cmp.longitude,
              createdAt: cmp.createdAt,
              updatedAt: cmp.updatedAt,
              officialRemarks: cmp.resolutionNotes || cmp.escalationReason || undefined,
              descriptionOrAddress: cmp.description,
              timeline: (cmp.timeline || []).map((t: any) => ({
                status: t.status,
                action: t.action,
                timestamp: t.createdAt,
                note: t.note,
                updatedBy: t.updatedBy,
                authorityLevel: t.authorityLevel,
              })),
            });
            setLoading(false);
            return;
          }
        } else if (cmpRes.status === 401) {
          setError(
            "Authentication Required: You must be signed in to view official grievance details for this tracking ID."
          );
          setAuthError(true);
          setLoading(false);
          return;
        } else if (cmpRes.status === 403) {
          setError(
            "Access Denied: You are not authorized to view this complaint. This grievance is registered under a different citizen account."
          );
          setLoading(false);
          return;
        }

        // Try grievance
        const grvRes = await fetch(`/api/grievances/${encodeURIComponent(query)}`);
        const grvJson = await grvRes.json().catch(() => ({}));
        if (grvJson.success && grvJson.data) {
          const grv = grvJson.data;
          setResult({
            type: "grievance",
            id: grv.id,
            title: grv.subject,
            applicant: grv.citizenName,
            mobile: grv.mobileNumber,
            ward: grv.wardNumber ? `Ward ${grv.wardNumber}` : undefined,
            categoryOrService: grv.category.toUpperCase(),
            status: grv.status,
            createdAt: grv.createdAt,
            updatedAt: grv.updatedAt,
            officialRemarks: grv.officialRemarks,
            descriptionOrAddress: grv.description,
            timeline: grv.timeline || [],
          });
          setLoading(false);
          return;
        }

        // Try application
        const appRes = await fetch(`/api/applications/${encodeURIComponent(query)}`);
        const appJson = await appRes.json().catch(() => ({}));
        if (appJson.success && appJson.data) {
          const app = appJson.data;
          setResult({
            type: "application",
            id: app.id,
            title: app.serviceName,
            applicant: app.applicantName,
            mobile: app.mobileNumber,
            ward: app.wardNumber ? `Ward ${app.wardNumber}` : undefined,
            categoryOrService: app.serviceCode,
            status: app.status,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
            officialRemarks: app.officialRemarks,
            descriptionOrAddress: app.address,
            timeline: app.timeline || [],
          });
          setLoading(false);
          return;
        }
      }

      setError(
        `No record found for '${query}'. Please verify your Tracking ID (e.g., CMP-LMC-2026-..., LMC-APP-2026-5001, or LMC-GRV-2026-1001).`
      );
    } catch (err) {
      console.error(err);
      setError("Unable to connect to municipal database. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase().replace(/\s+/g, "_");
    switch (s) {
      case "RESOLVED":
      case "CLOSED":
      case "APPROVED":
      case "COMPLETED":
        return {
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
          label: status,
        };
      case "IN_PROGRESS":
      case "ASSIGNED":
      case "INSPECTION_SCHEDULED":
        return {
          bg: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
          label: status,
        };
      case "UNDER_REVIEW":
      case "UNDER_VERIFICATION":
        return {
          bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
          label: status,
        };
      case "NEAR_DEADLINE":
      case "ESCALATED":
        return {
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
          label: status,
        };
      case "REOPENED":
        return {
          bg: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
          label: status,
        };
      case "REJECTED":
        return {
          bg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
          label: status,
        };
      default:
        return {
          bg: "bg-teal-50 text-[#064E4A] dark:bg-teal-950 dark:text-teal-300 border-teal-200",
          label: status || "Submitted",
        };
    }
  };

  return (
    <PageContainer
      title="Citizen Status & Grievance Tracker"
      subtitle="Track live municipal service applications, complaint redressal, and departmental remarks"
      breadcrumbs={[{ label: "Track Status" }]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search Input Box */}
        <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#061817] shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
            Enter Tracking Reference ID or Registered Mobile
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. CMP-LMC-2026-..., LMC-APP-2026-5001, or LMC-GRV-2026-1001"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 focus:outline-none focus:border-[#064E4A]"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-5 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-md shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Searching...</span>
              ) : (
                <>
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            <span>Sample reference formats:</span>
            <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
              CMP-LMC-2026-XXXXX
            </span>
            <span>â€¢</span>
            <button
              type="button"
              onClick={() => {
                setTrackingInput("LMC-GRV-2026-1001");
                handleSearch("LMC-GRV-2026-1001");
              }}
              className="underline font-mono hover:text-[#064E4A] dark:hover:text-teal-300"
            >
              LMC-GRV-2026-1001
            </button>
            <span>â€¢</span>
            <button
              type="button"
              onClick={() => {
                setTrackingInput("LMC-APP-2026-5001");
                handleSearch("LMC-APP-2026-5001");
              }}
              className="underline font-mono hover:text-[#064E4A] dark:hover:text-teal-300"
            >
              LMC-APP-2026-5001
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-bold text-sm">
                {authError ? "Authentication Required" : "Record Not Found"}
              </p>
              <p className="mt-1 leading-relaxed">{error}</p>
              {authError && (
                <div className="mt-3">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/track?id=${(trackingInput || initialId).trim()}`)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Track Complaint</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Result Card */}
        {result && (
          <div className="space-y-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] shadow-sm space-y-5">
              {/* Header: ID, Badge, Status */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base sm:text-lg font-extrabold text-[#064E4A] dark:text-teal-300">
                      {result.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {result.type === "complaint"
                        ? "Official Grievance"
                        : result.type === "grievance"
                        ? "Civic Grievance"
                        : "Service Application"}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {result.title}
                  </h2>
                </div>

                <div
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                    getStatusBadge(result.status).bg
                  }`}
                >
                  {getStatusBadge(result.status).label}
                </div>
              </div>

              {/* 5-Stage Visual SLA Progress Stepper & Countdown */}
              {(() => {
                const currentStageIndex = getStageIndex(result.status);
                const sla = getSlaInfo(result.createdAt, result.deadline, result.status);

                return (
                  <div className="pt-2 pb-1">
                    <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#064E4A] dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Resolution Progress & SLA Lifecycle</span>
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          Step {Math.min(currentStageIndex + 1, 5)} of 5 â€¢ {SLA_STAGES[currentStageIndex]?.label || "Submitted"}
                        </span>
                      </div>

                      {/* Stepper bar */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 relative">
                        {SLA_STAGES.map((stage, idx) => {
                          const isCompleted = idx < currentStageIndex || (idx === 4 && currentStageIndex === 4);
                          const isCurrent = idx === currentStageIndex && currentStageIndex < 4;
                          return (
                            <div key={stage.key} className="flex flex-col items-center text-center space-y-1.5">
                              <div
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isCompleted
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : isCurrent
                                    ? "bg-[#064E4A] dark:bg-teal-500 text-white ring-4 ring-teal-200 dark:ring-teal-900 animate-pulse"
                                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs font-bold leading-tight ${
                                  isCurrent
                                    ? "text-[#064E4A] dark:text-teal-300"
                                    : isCompleted
                                    ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dedicated SLA Countdown & Target Resolution Box */}
                      {sla && (
                        <div className="pt-3 border-t border-teal-100 dark:border-teal-900/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Expected Resolution
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {sla.expectedDate}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              SLA Deadline
                            </span>
                            <p className="font-mono font-bold text-gray-900 dark:text-gray-100">
                              {result.deadline
                                ? new Date(result.deadline).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Statutory 48h"}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Days / Hours Remaining
                            </span>
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${sla.badgeColor}`}>
                                {sla.isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                                {!sla.isOverdue && !sla.isResolved && <Clock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />}
                                {sla.isResolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                <span>{sla.remainingText}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Meta Grid: Category, Ward, Location, Submission Date, SLA Deadline, Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 py-2 text-xs text-gray-600 dark:text-gray-300">
                {/* Category */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Category / Department
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                    <FileText className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                    <span className="truncate">{result.categoryOrService}</span>
                  </div>
                </div>

                {/* Incident Ward */}
                {result.ward && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Incident Ward
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                      <span className="truncate">{result.ward}</span>
                    </div>
                  </div>
                )}

                {/* Location / Landmark */}
                {result.location && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Incident Location / Landmark
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                      <span className="truncate">{result.location}</span>
                    </div>
                  </div>
                )}

                {/* Submission Date */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Submission Date & Time
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                    <Calendar className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                    <span>
                      {new Date(result.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>

                {/* SLA / Target Resolution Deadline */}
                {result.deadline && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                      Target SLA Resolution Deadline
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        {new Date(result.deadline).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    {result.priority && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        Priority Level: <span className="font-bold">{result.priority}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Assigned Authority */}
                {result.assignedAuthority && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Assigned Municipal Wing
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                      <Building className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                      <span className="truncate">{result.assignedAuthority}</span>
                    </div>
                    {result.authorityLevel && (
                      <p className="text-[10px] text-gray-500">
                        Level: {result.authorityLevel}
                      </p>
                    )}
                  </div>
                )}

                {/* Complainant Name */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Filing Complainant
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                    <User className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400 flex-shrink-0" />
                    <span>{result.applicant}</span>
                  </div>
                  {result.mobile && (
                    <p className="text-[10px] text-gray-500 font-mono">
                      +91 {result.mobile}
                    </p>
                  )}
                </div>
              </div>

              {/* Description Details */}
              <div className="py-2 space-y-2 text-xs sm:text-sm">
                <p className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
                  {result.type === "complaint"
                    ? "Detailed Grievance Description"
                    : result.type === "grievance"
                    ? "Reported Issue Details"
                    : "Submitted Address / Particulars"}
                </p>
                <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed whitespace-pre-wrap">
                  {result.descriptionOrAddress}
                </div>
              </div>

              {/* Attached Evidence Preview (if any) */}
              {result.photoUrl && (
                <div className="py-2 space-y-2 text-xs">
                  <p className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
                    Attached Photographic Evidence
                  </p>
                  <div className="inline-block p-1.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                    <img
                      src={result.photoUrl}
                      alt="Complaint evidence attachment"
                      className="max-h-48 rounded-lg object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Official Remarks */}
              {result.officialRemarks && (
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs sm:text-sm text-teal-950 dark:text-teal-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#064E4A] dark:text-teal-300">
                    <Building className="w-4 h-4" />
                    <span>Official Council Remarks:</span>
                  </div>
                  <p className="pl-5 leading-relaxed">{result.officialRemarks}</p>
                </div>
              )}

              {/* Authority Resolution Verification Photo (Requirement 9) */}
              {result.resolutionPhotoUrl && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      ✓ Resolution Verification Photo (Official Field Evidence)
                    </span>
                    {result.resolutionLatitude && result.resolutionLongitude && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                        GPS: {result.resolutionLatitude.toFixed(4)}, {result.resolutionLongitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                  <div className="inline-block p-1 bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
                    <img
                      src={result.resolutionPhotoUrl}
                      alt="Authority resolution verification"
                      className="max-h-56 rounded-lg object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Timeline & Audit Trail */}
            {result.timeline && result.timeline.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                  <span>Processing Timeline & Municipal Audit Trail</span>
                </h3>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200 dark:before:bg-teal-900">
                  {result.timeline.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#064E4A] dark:bg-teal-400 ring-4 ring-white dark:ring-gray-900" />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                            {event.status.replace("_", " ")}
                          </span>
                          {event.action && (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-[#064E4A] dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800">
                              {event.action}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500">
                            {new Date(event.timestamp).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {event.note}
                        </p>
                        {event.updatedBy && (
                          <p className="text-[11px] text-[#064E4A] dark:text-teal-400 font-medium">
                            Action by: {event.updatedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Multi-Tier Escalation Hierarchy */}
            {result.type === "complaint" && (
              <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-[#064E4A] dark:text-teal-300">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Statutory Civic Escalation Hierarchy
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Automated multi-tier administrative governance under Karnataka Municipalities Act
                      </p>
                    </div>
                  </div>

                  <div className="text-right self-start sm:self-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#064E4A] dark:text-teal-300">
                      Active: {result.authorityLevel || "Local Authority"}
                    </span>
                  </div>
                </div>

                {/* Vertical flowchart with downward arrows */}
                <div className="space-y-2 pt-1">
                  {ESCALATION_TIERS.map((tier, idx) => {
                    const currentLevel = (result.authorityLevel || "Local Authority").toLowerCase();
                    const isCurrentTier =
                      tier.key.toLowerCase() === currentLevel ||
                      (tier.tier === 1 && (!result.authorityLevel || currentLevel.includes("local")));
                    const isPastTier =
                      (currentLevel.includes("block") && tier.tier < 2) ||
                      (currentLevel.includes("district panchayat") && tier.tier < 3) ||
                      (currentLevel.includes("district administration") && tier.tier < 4);

                    return (
                      <React.Fragment key={tier.tier}>
                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isCurrentTier
                              ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-400 dark:border-teal-600 shadow-sm ring-2 ring-teal-400/30"
                              : isPastTier
                              ? "bg-gray-50 dark:bg-gray-900/40 border-emerald-300 dark:border-emerald-800"
                              : "bg-gray-50/50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 opacity-70"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                  isCurrentTier
                                    ? "bg-[#064E4A] text-white animate-pulse"
                                    : isPastTier
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {isPastTier ? <Check className="w-3.5 h-3.5" /> : tier.tier}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                    {tier.name}
                                  </h4>
                                  {isCurrentTier && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E4A] text-white animate-pulse">
                                      Current Jurisdiction
                                    </span>
                                  )}
                                  {isPastTier && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                      Escalated Upward
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {tier.authority} â€¢ <span className="font-medium">{tier.officer}</span>
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {tier.description}
                                </p>
                              </div>
                            </div>

                            <div className="text-left sm:text-right flex-shrink-0">
                              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                {tier.sla}
                              </span>
                            </div>
                          </div>
                        </div>

                        {idx < ESCALATION_TIERS.length - 1 && (
                          <div className="flex items-center justify-center py-0.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                              <div className="w-0.5 h-3 bg-gray-300 dark:bg-gray-700" />
                              <ArrowDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <div className="w-0.5 h-3 bg-gray-300 dark:bg-gray-700" />
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto p-12 text-center text-xs text-gray-500">
          Loading citizen tracking system...
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
