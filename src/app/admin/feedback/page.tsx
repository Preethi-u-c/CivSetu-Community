"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Flag,
  Archive,
  RefreshCw,
} from "lucide-react";
import { FeedbackRecord, FeedbackStatus } from "@/lib/db/types";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setFeedbacks(json.data);
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, categoryFilter]);

  const updateStatus = async (id: string, newStatus: FeedbackStatus) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedbacks((prev) =>
          prev.map((item) => (item.id === id ? json.data : item))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case "FLAGGED_FOR_COUNCIL":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300";
      case "REVIEWED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300";
      case "ARCHIVED":
        return "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
            Citizen Suggestions & Post-Back Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Review recommendations, community suggestions, and feedback received via CivSetu
          </p>
        </div>

        <button
          onClick={fetchFeedback}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-700 dark:text-gray-300">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="FLAGGED_FOR_COUNCIL">Flagged for Council Meeting</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-xs focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="water">Drinking Water</option>
            <option value="sanitation">Garbage & Sanitation</option>
            <option value="roads">Roads & Drainage</option>
            <option value="streetlights">Street Lighting</option>
            <option value="tax">Property Tax</option>
            <option value="website">Portal Suggestion</option>
            <option value="other">Other Civic Matter</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading suggestions...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-white dark:bg-[#061817] rounded-xl border border-gray-200 dark:border-gray-800">
            No suggestions found matching the current filters.
          </div>
        ) : (
          feedbacks.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {f.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {f.category}
                  </span>
                  {f.wardNumber && (
                    <span className="text-[10px] font-semibold text-gray-500">
                      Ward {f.wardNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      f.status
                    )}`}
                  >
                    {f.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-800">
                "{f.suggestion}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                    <User className="w-3 h-3" /> {f.citizenName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" /> {f.mobileNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{" "}
                    {new Date(f.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateStatus(f.id, "REVIEWED")}
                    className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-semibold hover:bg-emerald-100 transition"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => updateStatus(f.id, "FLAGGED_FOR_COUNCIL")}
                    className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 font-semibold hover:bg-purple-100 transition flex items-center gap-1"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Council Agenda</span>
                  </button>
                  <button
                    onClick={() => updateStatus(f.id, "ARCHIVED")}
                    className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 font-semibold hover:bg-gray-200 transition flex items-center gap-1"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
