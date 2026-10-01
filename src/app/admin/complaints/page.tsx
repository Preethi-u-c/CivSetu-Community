"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  X,
  MapPin,
  Calendar,
  Building,
  User,
  Phone,
  Shield,
  History,
  ChevronLeft,
  ChevronRight,
  GitFork,
  ArrowUpRight,
} from "lucide-react";

interface ComplaintItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  ward: string;
  address?: string;
  status: string;
  priority: string;
  assignedAuthority: string;
  authorityLevel: string;
  deadline: string;
  resolutionNotes?: string;
  resolvedAt?: string | null;
  createdAt: string;
  citizenName: string;
  citizenMobile: string;
}

interface TimelineItem {
  id: number;
  status: string;
  action: string;
  note: string;
  updatedBy: string;
  authorityLevel: string;
  assignedTo?: string;
  createdAt: string;
}

interface ComplaintDetail extends ComplaintItem {
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  closedAt?: string | null;
  reopenedReason?: string;
  escalationReason?: string;
  escalatedAt?: string | null;
  updatedAt?: string;
  citizen: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
  };
  timeline: TimelineItem[];
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Details Modal
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (wardFilter !== "ALL") params.set("ward", wardFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      params.set("page", String(page));
      params.set("limit", "15");

      const res = await fetch(`/api/admin/complaints?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load complaints (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setComplaints(json.data.complaints || []);
        setTotalPages(json.data.totalPages || 1);
        setTotalCount(json.data.total || 0);
      } else {
        throw new Error(json.error || "Unexpected complaints response");
      }
    } catch (err: unknown) {
      console.error("Complaints load error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, wardFilter, priorityFilter, page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const openDetails = async (id: string) => {
    setSelectedComplaintId(id);
    setDetailLoading(true);
    setDetailError(null);
    setDetailData(null);

    try {
      const res = await fetch(`/api/admin/complaints/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to retrieve details (${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setDetailData(json.data);
      } else {
        throw new Error(json.error || "Details not found");
      }
    } catch (err: unknown) {
      console.error("Detail fetch error:", err);
      setDetailError(err instanceof Error ? err.message : "Error fetching complaint");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedComplaintId(null);
    setDetailData(null);
    setDetailError(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "Escalated":
        return "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800";
      case "In Progress":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      case "Assigned":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800";
      case "Closed":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Emergency":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 font-bold";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300";
      case "Low":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Civic Complaints Oversight Registry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Centralized administrative registry of all citizen grievances submitted across Lakshmeshwar TMC wards.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-teal-800 hover:bg-gray-100 dark:hover:bg-teal-900/40 text-gray-700 dark:text-teal-200 transition"
          aria-label="Refresh complaints registry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#062422] p-4 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, title, citizen name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Filter by complaint status"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <select
              value={wardFilter}
              onChange={(e) => {
                setWardFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Filter by ward"
            >
              <option value="ALL">All Wards (1 - 23)</option>
              {Array.from({ length: 23 }, (_, i) => i + 1).map((wNum) => (
                <option key={wNum} value={`Ward ${String(wNum).padStart(2, "0")}`}>
                  Ward {wNum}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Filter by priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Showing {complaints.length} of {totalCount} complaints</span>
          </div>
          {(search || statusFilter !== "ALL" || wardFilter !== "ALL" || priorityFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
                setWardFilter("ALL");
                setPriorityFilter("ALL");
                setPage(1);
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm overflow-hidden">
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-amber-400" />
            <p className="text-sm text-gray-500 dark:text-teal-300 font-medium">
              Loading complaints registry...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchComplaints}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No Complaints Match Your Criteria
            </p>
            <p className="text-xs text-gray-500">
              Try adjusting your search terms or filter selections.
            </p>
          </div>
        )}

        {!loading && !error && complaints.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-teal-950/60 border-b border-gray-200 dark:border-teal-900/60 text-gray-600 dark:text-teal-300 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Grievance Title & Citizen</th>
                  <th className="py-3 px-4">Ward / Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Authority</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-teal-900/30 text-gray-700 dark:text-gray-200">
                {complaints.map((c) => {
                  const deadlinePassed = new Date(c.deadline).getTime() < Date.now() && c.status !== "Resolved" && c.status !== "Closed";

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-teal-950/30 transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-amber-400 whitespace-nowrap">
                        {c.id}
                      </td>

                      <td className="py-3 px-4 max-w-[260px]">
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {c.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          By: {c.citizenName} ({c.citizenMobile})
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-teal-200">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{c.ward}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 block mt-0.5">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getPriorityBadge(c.priority)}`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="font-semibold truncate text-gray-900 dark:text-white">
                          {c.assignedAuthority}
                        </p>
                        <span className="text-[10px] text-gray-500 dark:text-teal-300">
                          {c.authorityLevel}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3.5 h-3.5 ${deadlinePassed ? "text-red-500 animate-pulse" : "text-gray-400"}`} />
                          <span className={deadlinePassed ? "text-red-600 dark:text-red-400 font-bold" : "text-gray-600 dark:text-gray-300"}>
                            {new Date(c.deadline).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {deadlinePassed && (
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 block">
                            SLA Breached
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openDetails(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/60 hover:bg-teal-100 dark:hover:bg-teal-800 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700 font-semibold text-xs transition"
                          aria-label={`Inspect ticket ${c.id}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-teal-900/60 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-teal-800 disabled:opacity-40 text-gray-700 dark:text-teal-200 hover:bg-gray-100 dark:hover:bg-teal-900/40"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-teal-800 disabled:opacity-40 text-gray-700 dark:text-teal-200 hover:bg-gray-100 dark:hover:bg-teal-900/40"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complaint Detail & Timeline Audit Modal */}
      {selectedComplaintId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#062422] rounded-2xl border border-gray-200 dark:border-teal-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-teal-900/60 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-teal-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-teal-800 dark:text-teal-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {selectedComplaintId}
                    </span>
                    {detailData && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(detailData.status)}`}>
                        {detailData.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {detailData?.title || "Complaint Ticket Details"}
                  </h3>
                </div>
              </div>

              <button
                onClick={closeDetails}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                aria-label="Close complaint details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {detailLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-amber-400" />
                  <p className="text-xs text-gray-500 font-medium">Loading ticket details & audit timeline...</p>
                </div>
              )}

              {!detailLoading && detailError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  {detailError}
                </div>
              )}

              {!detailLoading && detailData && (
                <>
                  {/* Grid 1: Basic Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Citizen Card */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-teal-300 uppercase tracking-wider">
                        <User className="w-3.5 h-3.5" />
                        <span>Complainant Information</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {detailData.citizen.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{detailData.citizen.mobile}</span>
                      </div>
                      {detailData.citizen.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {detailData.citizen.email}
                        </p>
                      )}
                    </div>

                    {/* Location & Authority Card */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-teal-300 uppercase tracking-wider">
                        <Building className="w-3.5 h-3.5" />
                        <span>Assigned Jurisdiction</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {detailData.assignedAuthority}
                      </p>
                      <p className="text-xs text-teal-700 dark:text-teal-300 font-semibold">
                        Level: {detailData.authorityLevel}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{detailData.ward} {detailData.address ? `• ${detailData.address}` : ""}</span>
                      </p>
                    </div>
                  </div>

                  {/* Grievance Description */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-700 dark:text-teal-200 uppercase tracking-wider">
                      Grievance Description
                    </h4>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-teal-950/30 border border-gray-200 dark:border-teal-900/60 text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {detailData.description || "No description provided."}
                    </div>
                  </div>

                  {/* Resolution Notes if available */}
                  {detailData.resolutionNotes && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Resolution Report & Action Taken
                      </h4>
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        {detailData.resolutionNotes}
                        {detailData.resolvedAt && (
                          <span className="block mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Resolved on: {new Date(detailData.resolvedAt).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SLA Timestamps */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Registered</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {new Date(detailData.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">SLA Target</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {new Date(detailData.deadline).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Category</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1 truncate">
                        {detailData.category}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/60">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Priority</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                        {detailData.priority}
                      </p>
                    </div>
                  </div>

                  {/* Audit Timeline */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-teal-900/60 pb-2">
                      <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Official Audit Trail & Action Timeline
                      </h4>
                    </div>

                    {detailData.timeline.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3">No timeline events recorded yet.</p>
                    ) : (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200 dark:before:bg-teal-800">
                        {detailData.timeline.map((event) => (
                          <div key={event.id} className="relative">
                            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-600 dark:bg-amber-400 ring-4 ring-white dark:ring-[#062422]" />
                            <div className="p-3 rounded-lg bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-900/40 space-y-1">
                              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {event.action} ({event.status})
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {new Date(event.createdAt).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                {event.note}
                              </p>
                              <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                                Officer: {event.updatedBy} ({event.authorityLevel})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-teal-900/60 bg-gray-50/50 dark:bg-teal-950/40 flex justify-end">
              <button
                type="button"
                onClick={closeDetails}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
