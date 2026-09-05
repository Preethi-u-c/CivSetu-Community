"use client";

import React, { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";

interface TimelineEvent {
  status: string;
  timestamp: string;
  note: string;
  updatedBy?: string;
}

interface ResultData {
  type: "grievance" | "application";
  id: string;
  title: string;
  applicant: string;
  mobile: string;
  ward?: string;
  categoryOrService: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  officialRemarks?: string;
  descriptionOrAddress: string;
  timeline: TimelineEvent[];
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [trackingInput, setTrackingInput] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch?: string) => {
    const query = (idToSearch || trackingInput).trim();
    if (!query) {
      setError("Please enter a valid Tracking ID or Mobile Number.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // If starts with LMC-APP, try applications first; else try grievances
      const isApp = query.toUpperCase().startsWith("LMC-APP");

      if (isApp) {
        const res = await fetch(`/api/applications/${encodeURIComponent(query)}`);
        const json = await res.json();
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

      // Try grievance
      const grvRes = await fetch(`/api/grievances/${encodeURIComponent(query)}`);
      const grvJson = await grvRes.json();
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

      // If not found as grievance, try application (in case entered without prefix or mobile)
      if (!isApp) {
        const appRes = await fetch(`/api/applications/${encodeURIComponent(query)}`);
        const appJson = await appRes.json();
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
        `No record found for '${query}'. Please verify your Tracking ID (e.g., LMC-GRV-2026-1001 or LMC-APP-2026-5001) or 10-digit mobile number.`
      );
    } catch (err) {
      console.error(err);
      setError("Unable to connect to municipal database. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
      case "APPROVED":
      case "COMPLETED":
        return {
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
          label: status.replace("_", " "),
        };
      case "IN_PROGRESS":
      case "INSPECTION_SCHEDULED":
        return {
          bg: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
          label: status.replace("_", " "),
        };
      case "UNDER_REVIEW":
      case "UNDER_VERIFICATION":
        return {
          bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
          label: status.replace("_", " "),
        };
      case "REJECTED":
        return {
          bg: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
          label: "REJECTED",
        };
      default:
        return {
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
          label: "SUBMITTED",
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
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#061817] shadow-sm">
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
                placeholder="e.g. LMC-GRV-2026-1001 or LMC-APP-2026-5001"
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

          <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            <span>Quick sample codes to test:</span>
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
            <span>•</span>
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
          <div className="p-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Record Not Found</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Search Result Card */}
        {result && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-[#064E4A] dark:text-teal-300">
                      {result.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {result.type === "grievance" ? "Civic Grievance" : "Service Application"}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {result.title}
                  </h2>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    getStatusBadge(result.status).bg
                  }`}
                >
                  {getStatusBadge(result.status).label}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    <strong className="text-gray-700 dark:text-gray-200">Applicant:</strong>{" "}
                    {result.applicant}
                  </span>
                </div>
                {result.ward && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      <strong className="text-gray-700 dark:text-gray-200">Location:</strong>{" "}
                      {result.ward}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    <strong className="text-gray-700 dark:text-gray-200">Submitted:</strong>{" "}
                    {new Date(result.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Details / Description */}
              <div className="py-4 space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {result.type === "grievance" ? "Reported Issue Details:" : "Submitted Address / Particulars:"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-md border border-gray-100 dark:border-gray-800 leading-relaxed">
                  {result.descriptionOrAddress}
                </p>
              </div>

              {/* Official Remarks */}
              {result.officialRemarks && (
                <div className="p-3.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs sm:text-sm text-teal-950 dark:text-teal-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#064E4A] dark:text-teal-300">
                    <Building className="w-4 h-4" />
                    <span>Official Council Remarks:</span>
                  </div>
                  <p className="pl-5 leading-relaxed">{result.officialRemarks}</p>
                </div>
              )}
            </div>

            {/* Interactive Timeline */}
            <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#071d1b] shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#064E4A] dark:text-teal-400" />
                <span>Processing Timeline & Audit Trail</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200 dark:before:bg-teal-900">
                {result.timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#064E4A] dark:bg-teal-400 ring-4 ring-white dark:ring-gray-900" />
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                          {event.status.replace("_", " ")}
                        </span>
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
