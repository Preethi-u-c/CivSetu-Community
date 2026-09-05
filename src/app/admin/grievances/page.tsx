"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
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
} from "lucide-react";
import { GrievanceRecord, GrievanceStatus, GrievancePriority } from "@/lib/db/types";

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<GrievanceStatus>("SUBMITTED");
  const [editPriority, setEditPriority] = useState<GrievancePriority>("NORMAL");
  const [editDept, setEditDept] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/grievances?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setGrievances(json.data);
      }
    } catch (err) {
      console.error("Failed to load grievances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [statusFilter, categoryFilter]);

  const openUpdateModal = (g: GrievanceRecord) => {
    setSelectedGrievance(g);
    setEditStatus(g.status);
    setEditPriority(g.priority);
    setEditDept(g.assignedDepartment || "");
    setEditRemarks(g.officialRemarks || "");
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/grievances/${selectedGrievance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          assignedDepartment: editDept,
          officialRemarks: editRemarks,
          note: `Desk updated status to ${editStatus}. Remarks: ${editRemarks || "None"}`,
          updatedBy: "Municipal Officer Desk",
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Update local list
        setGrievances((prev) =>
          prev.map((item) => (item.id === selectedGrievance.id ? json.data : item))
        );
        setSelectedGrievance(null);
      }
    } catch (err) {
      console.error("Error updating grievance:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: GrievanceStatus) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "IN_PROGRESS":
        return "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300";
      case "UNDER_REVIEW":
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
            Citizen Grievance Redressal Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Manage incoming citizen complaints, assign municipal cells, and log statutory resolutions
          </p>
        </div>

        <button
          onClick={fetchGrievances}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="water">Water Supply</option>
              <option value="sanitation">Garbage & Sanitation</option>
              <option value="roads">Roads & Drainage</option>
              <option value="streetlights">Street Lighting</option>
              <option value="tax">Property Tax & Khata</option>
              <option value="other">Other Civic Matters</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchGrievances();
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, citizen, or mobile..."
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

      {/* Grievances List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading grievances...</div>
        ) : grievances.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-[#061817] rounded-xl border border-gray-200 dark:border-gray-800">
            No grievances match the specified filters.
          </div>
        ) : (
          grievances.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] shadow-sm hover:border-[#064E4A] transition space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-[#064E4A] dark:text-teal-400">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {item.category}
                    </span>
                    {item.wardNumber && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        Ward {item.wardNumber}
                      </span>
                    )}
                    {item.priority === "HIGH" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                        High Priority
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {item.subject}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => openUpdateModal(item)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Action</span>
                  </button>
                </div>
              </div>

              {/* Citizen Details & Description */}
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                    <User className="w-3 h-3" /> {item.citizenName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" /> {item.mobileNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{" "}
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="p-2.5 rounded bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 leading-relaxed">
                  {item.description}
                </p>

                {item.officialRemarks && (
                  <div className="p-2 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-teal-900 dark:text-teal-200">
                    <strong>Official Remarks:</strong> {item.officialRemarks}
                    {item.assignedDepartment && (
                      <span className="block text-[11px] text-teal-700 dark:text-teal-400 mt-0.5">
                        Assigned Cell: {item.assignedDepartment}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Public link test */}
              <div className="pt-2 flex justify-end">
                <Link
                  href={`/track?id=${encodeURIComponent(item.id)}`}
                  target="_blank"
                  className="text-[11px] text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
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
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#061817] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Update Grievance Status
                </h3>
                <p className="font-mono text-xs text-[#064E4A] dark:text-teal-400 mt-0.5">
                  {selectedGrievance.id} • {selectedGrievance.citizenName}
                </p>
              </div>
              <button
                onClick={() => setSelectedGrievance(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Grievance Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as GrievanceStatus)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as GrievancePriority)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Emergency / Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Assign Responsible Department / Cell
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  placeholder="e.g. Water Supply Cell, Electrical Section, Sanitation Unit"
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Official Remarks / Action Taken
                </label>
                <textarea
                  rows={4}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="Describe inspection findings, repair progress, or resolution details that will appear on citizen tracking timeline..."
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedGrievance(null)}
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
                  <span>{updating ? "Saving..." : "Commit Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
