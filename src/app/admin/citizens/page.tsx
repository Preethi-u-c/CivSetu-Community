"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  MapPin,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Phone,
  Mail,
  Home,
  Calendar,
} from "lucide-react";

interface CitizenItem {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  wardNumber: string;
  residentialAddress: string;
  mobileVerified: boolean;
  complaintCount: number;
  createdAt: string;
}

interface CitizenDetails extends CitizenItem {
  complaints: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminCitizensPage() {
  const [citizens, setCitizens] = useState<CitizenItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCitizens = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (wardFilter !== "ALL") query.set("ward", wardFilter);
      query.set("page", String(page));
      query.set("limit", "15");

      const res = await fetch(`/api/admin/citizens?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCitizens(data.data.citizens);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages);
        }
      }
    } catch (err) {
      console.error("Failed to load citizens:", err);
    } finally {
      setLoading(false);
    }
  }, [search, wardFilter, page]);

  useEffect(() => {
    fetchCitizens();
  }, [fetchCitizens]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCitizens();
  };

  const handleOpenDetail = async (citizenId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/citizens/${citizenId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedCitizen(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load citizen details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Generate 23 ward filter options
  const wardOptions = Array.from({ length: 23 }, (_, i) => {
    const num = i + 1;
    const str = `Ward ${String(num).padStart(2, "0")}`;
    return { value: str, label: `Ward ${num}` };
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Civic Population Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Citizen Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-teal-300 mt-1">
            Browse verified citizen registrations, ward distribution, and linked municipal grievances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
            {total} Total Registered
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#061F1D] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 dark:text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Citizen Name, Mobile, Email, or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-teal-600 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#064E4A] hover:bg-teal-800 text-white text-xs font-bold transition shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-teal-300 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Ward:</span>
          </div>
          <select
            value={wardFilter}
            onChange={(e) => {
              setWardFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 transition w-full md:w-auto"
          >
            <option value="ALL">All 23 Wards</option>
            {wardOptions.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("");
              setWardFilter("ALL");
              setPage(1);
            }}
            className="p-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-600 dark:text-teal-300 text-xs transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Citizens Table */}
      <div className="bg-white dark:bg-[#061F1D] rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-teal-950/60 text-gray-500 dark:text-teal-300 uppercase tracking-wider font-bold border-b border-gray-200 dark:border-teal-800/60">
                <th className="py-3 px-4">Citizen Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Ward</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Complaints</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-teal-800/40 text-gray-700 dark:text-teal-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-teal-950/60 rounded" />
                    </td>
                  </tr>
                ))
              ) : citizens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center text-gray-500 dark:text-teal-300">
                    No citizen records found matching the search criteria.
                  </td>
                </tr>
              ) : (
                citizens.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 dark:hover:bg-teal-950/40 transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {c.fullName}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-teal-400 font-mono">
                        {c.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-gray-900 dark:text-teal-100">
                        <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{c.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-teal-300 text-[11px]">
                        <Mail className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span className="truncate max-w-[160px]">{c.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-teal-950 text-gray-800 dark:text-teal-200 border border-gray-200 dark:border-teal-800">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {c.wardNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.mobileVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <FileText className="w-3 h-3" />
                        {c.complaintCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-teal-300 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/40 hover:bg-teal-100 dark:hover:bg-teal-800 text-teal-800 dark:text-teal-200 font-bold text-xs border border-teal-200 dark:border-teal-700/60 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-gray-50 dark:bg-teal-950/40 border-t border-gray-200 dark:border-teal-800/60 flex items-center justify-between text-xs text-gray-500 dark:text-teal-300">
          <div>
            Page <span className="font-bold text-gray-900 dark:text-white">{page}</span> of{" "}
            <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span> (
            {total} total records)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-teal-900/60 hover:bg-gray-100 dark:hover:bg-teal-800 border border-gray-300 dark:border-teal-700 font-bold transition disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-teal-900/60 hover:bg-gray-100 dark:hover:bg-teal-800 border border-gray-300 dark:border-teal-700 font-bold transition disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Details Modal */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-teal-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/60 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-teal-800 dark:text-teal-200 font-bold text-base">
                  {selectedCitizen.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedCitizen.fullName}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-teal-300 font-mono">
                    ID: {selectedCitizen.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCitizen(null)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-teal-900/60 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 space-y-1">
                <span className="text-gray-400 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Mobile Number
                </span>
                <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                  {selectedCitizen.mobileNumber}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedCitizen.mobileVerified ? "✓ OTP Verified" : "⚠ Unverified"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 space-y-1">
                <span className="text-gray-400 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Email Address
                </span>
                <p className="font-bold text-gray-900 dark:text-white break-all">
                  {selectedCitizen.email}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 space-y-1">
                <span className="text-gray-400 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  Assigned Ward
                </span>
                <p className="font-bold text-gray-900 dark:text-white">
                  {selectedCitizen.wardNumber}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 space-y-1">
                <span className="text-gray-400 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Registration Date
                </span>
                <p className="font-bold text-gray-900 dark:text-white">
                  {new Date(selectedCitizen.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="sm:col-span-2 p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 space-y-1">
                <span className="text-gray-400 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Residential Address
                </span>
                <p className="text-gray-800 dark:text-teal-100 font-medium leading-relaxed">
                  {selectedCitizen.residentialAddress}
                </p>
              </div>
            </div>

            {/* Complaints Filed by this Citizen */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-teal-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Grievances Lodged ({selectedCitizen.complaints.length})
                </h3>
              </div>

              {selectedCitizen.complaints.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-teal-950/30 text-center text-xs text-gray-500 dark:text-teal-400">
                  No grievances lodged by this citizen.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedCitizen.complaints.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-teal-950/40 border border-gray-200 dark:border-teal-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white truncate">
                          {comp.title}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-teal-300 flex items-center gap-2">
                          <span className="font-mono text-gray-400">{comp.id}</span>
                          <span>•</span>
                          <span>{comp.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            comp.status === "Resolved"
                              ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                              : comp.status === "Escalated"
                              ? "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300"
                              : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                          }`}
                        >
                          {comp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Close Footer */}
            <div className="pt-3 border-t border-gray-200 dark:border-teal-800 flex justify-end">
              <button
                onClick={() => setSelectedCitizen(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-teal-800 hover:bg-gray-300 dark:hover:bg-teal-700 text-gray-900 dark:text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
