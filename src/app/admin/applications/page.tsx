"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  X,
  Send,
  Building,
  Phone,
  User,
  MapPin,
  RefreshCw,
  FileText,
} from "lucide-react";
import { ServiceApplicationRecord, ApplicationStatus } from "@/lib/db/types";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ServiceApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [selectedApp, setSelectedApp] = useState<ServiceApplicationRecord | null>(null);
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("SUBMITTED");
  const [editRemarks, setEditRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceFilter !== "ALL") params.append("serviceCode", serviceFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/applications?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [serviceFilter, statusFilter]);

  const openUpdateModal = (app: ServiceApplicationRecord) => {
    setSelectedApp(app);
    setEditStatus(app.status);
    setEditRemarks(app.officialRemarks || "");
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          officialRemarks: editRemarks,
          note: `Processing desk marked status as ${editStatus}. Remarks: ${editRemarks || "None"}`,
          updatedBy: "Town Municipal Council Scrutiny Desk",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((item) => (item.id === selectedApp.id ? json.data : item))
        );
        setSelectedApp(null);
      }
    } catch (err) {
      console.error("Error updating application:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "INSPECTION_SCHEDULED":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300";
      case "UNDER_VERIFICATION":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            Municipal Service Applications Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Scrutinize official statutory forms, schedule site visits, issue sanctions, and track issuance
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Service Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Services</option>
              <option value="Form TMC-W1">Water Connection (TMC-W1)</option>
              <option value="Form TMC-BP4">Building Permission (TMC-BP4)</option>
              <option value="Form TMC-TL2">Trade License (TMC-TL2)</option>
              <option value="Form TMC-KT3">Khata Transfer (TMC-KT3)</option>
              <option value="Form TMC-NOC1">NOC Electricity/Borewell (TMC-NOC1)</option>
              <option value="Form TMC-PM6">Street Vendor Registration (TMC-PM6)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="INSPECTION_SCHEDULED">Inspection Scheduled</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchApplications();
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, applicant, or mobile..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-md"
          >
            Search
          </button>
        </form>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-[#061817] rounded-xl border border-gray-200 dark:border-gray-800">
            No service applications found matching criteria.
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] shadow-sm hover:border-blue-600 transition space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-blue-700 dark:text-blue-400">
                      {app.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {app.serviceCode}
                    </span>
                    {app.wardNumber && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        Ward {app.wardNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {app.serviceName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {app.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => openUpdateModal(app)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Process</span>
                  </button>
                </div>
              </div>

              {/* Applicant & Details */}
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                    <User className="w-3 h-3" /> {app.applicantName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" /> {app.mobileNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {app.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{" "}
                    {new Date(app.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {app.details && Object.keys(app.details).length > 0 && (
                  <div className="p-2.5 rounded bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(app.details).map(([key, val]) => (
                      <div key={key}>
                        <strong className="capitalize text-gray-700 dark:text-gray-300">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </strong>{" "}
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {app.officialRemarks && (
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200">
                    <strong>Official Remarks:</strong> {app.officialRemarks}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/track?id=${encodeURIComponent(app.id)}`}
                  target="_blank"
                  className="text-[11px] text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Verify Public Citizen View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Process Service Application
                </h3>
                <p className="font-mono text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                  {selectedApp.id} • {selectedApp.applicantName}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Workflow Processing Stage
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                >
                  <option value="SUBMITTED">SUBMITTED (Pending Review)</option>
                  <option value="UNDER_VERIFICATION">UNDER_VERIFICATION (Revenue / Document Check)</option>
                  <option value="INSPECTION_SCHEDULED">INSPECTION_SCHEDULED (Field Visit)</option>
                  <option value="APPROVED">APPROVED (Ready for Sanction / Issue)</option>
                  <option value="COMPLETED">COMPLETED (Certificate Handed Over)</option>
                  <option value="REJECTED">REJECTED (Non-compliant / Missing docs)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Official Remarks / Certificate Number / Inspection Date
                </label>
                <textarea
                  rows={4}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="Enter scrutiny findings, field engineer comments, or certificate issue details..."
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-md bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold shadow transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{updating ? "Updating..." : "Save Status"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
