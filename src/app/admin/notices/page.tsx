"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Send,
  Radio,
  Layers,
  Archive,
  Info,
  ChevronDown,
} from "lucide-react";
import { wardsData } from "@/data/wards";
import { NoticeRecord, NoticeTargetScope } from "@/lib/db/notices";

interface NoticeStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  emergency: number;
}

const CATEGORIES = [
  "Water Supply Announcements",
  "Electricity Interruptions",
  "Sanitation Notices",
  "Road Work",
  "Emergency Alerts",
  "Municipal Announcements",
  "Public Notice",
  "Public Works Directive",
  "Public Health Order",
  "Water Supply Advisory",
  "General Circular",
];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [stats, setStats] = useState<NoticeStats>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    emergency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionNoticeId, setActionNoticeId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeRecord | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedScope, setSelectedScope] = useState("ALL");
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Create / Edit Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formPriority, setFormPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [formIsEmergency, setFormIsEmergency] = useState(false);
  const [formTargetScope, setFormTargetScope] = useState<NoticeTargetScope>("All citizens");
  const [formSelectedWards, setFormSelectedWards] = useState<number[]>([]);
  const [formStatus, setFormStatus] = useState<"Draft" | "Published" | "Archived">("Published");
  const [formPublishDate, setFormPublishDate] = useState("");
  const [formExpiryDate, setFormExpiryDate] = useState("");
  const [formError, setFormError] = useState("");

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedPriority !== "ALL") params.set("priority", selectedPriority);
      if (selectedScope !== "ALL") params.set("targetScope", selectedScope);
      if (emergencyOnly) params.set("isEmergency", "true");
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "100");

      const res = await fetch(`/api/admin/notices?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setNotices(json.data || []);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedCategory, selectedPriority, selectedScope, emergencyOnly, search]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory(CATEGORIES[0]);
    setFormPriority("Normal");
    setFormIsEmergency(false);
    setFormTargetScope("All citizens");
    setFormSelectedWards([]);
    setFormStatus("Published");
    setFormPublishDate("");
    setFormExpiryDate("");
    setFormError("");
    setEditingNotice(null);
  };

  const openCreateModal = () => {
    resetForm();
    // Default publish date to current local datetime format for input type="datetime-local"
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormPublishDate(now.toISOString().slice(0, 16));
    setShowCreateModal(true);
  };

  const openEditModal = (notice: NoticeRecord) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormDescription(notice.description);
    setFormCategory(notice.category);
    setFormPriority(notice.priority);
    setFormIsEmergency(notice.isEmergency);
    setFormTargetScope(notice.targetScope);
    setFormStatus(notice.status);

    // Parse target wards
    if (notice.targetWards) {
      const wardNums: number[] = [];
      const parts = notice.targetWards.split(",").map((s) => s.trim());
      parts.forEach((p) => {
        const match = p.match(/\d+/);
        if (match) wardNums.push(parseInt(match[0], 10));
      });
      setFormSelectedWards(wardNums);
    } else {
      setFormSelectedWards([]);
    }

    if (notice.publishDate) {
      const pDate = new Date(notice.publishDate);
      pDate.setMinutes(pDate.getMinutes() - pDate.getTimezoneOffset());
      setFormPublishDate(pDate.toISOString().slice(0, 16));
    } else {
      setFormPublishDate("");
    }

    if (notice.expiryDate) {
      const eDate = new Date(notice.expiryDate);
      eDate.setMinutes(eDate.getMinutes() - eDate.getTimezoneOffset());
      setFormExpiryDate(eDate.toISOString().slice(0, 16));
    } else {
      setFormExpiryDate("");
    }

    setFormError("");
    setShowCreateModal(true);
  };

  const toggleWardSelection = (wardNum: number) => {
    setFormSelectedWards((prev) =>
      prev.includes(wardNum) ? prev.filter((w) => w !== wardNum) : [...prev, wardNum].sort((a, b) => a - b)
    );
  };

  const selectAllWards = () => {
    setFormSelectedWards(wardsData.map((w) => w.wardNumber));
  };

  const clearAllWards = () => {
    setFormSelectedWards([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || formTitle.trim().length < 5) {
      setFormError("Title must be at least 5 characters long.");
      return;
    }
    if (!formDescription.trim() || formDescription.trim().length < 10) {
      setFormError("Detailed description must be at least 10 characters long.");
      return;
    }

    const isSpecificWards = formTargetScope === "Specific ward(s)" || formTargetScope === "Specific Wards";
    if (isSpecificWards && formSelectedWards.length === 0) {
      setFormError("Please select at least one specific ward or select a broader targeting scope.");
      return;
    }

    let formattedWards: string | null = null;
    if (isSpecificWards) {
      formattedWards = formSelectedWards.map((num) => `Ward ${String(num).padStart(2, "0")}`).join(", ");
    } else if (formTargetScope === "All citizens") {
      formattedWards = "All Citizens (01 - 23)";
    } else if (formTargetScope === "Emergency / city-wide") {
      formattedWards = "All Wards (Emergency Broadcast)";
    } else {
      formattedWards = "Entire Municipality (City-Wide)";
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        category: formCategory,
        priority: formPriority,
        isEmergency: formIsEmergency,
        targetScope: formTargetScope,
        targetWards: formattedWards,
        status: formStatus,
        publishDate: formPublishDate ? new Date(formPublishDate).toISOString() : undefined,
        expiryDate: formExpiryDate ? new Date(formExpiryDate).toISOString() : null,
      };

      if (editingNotice) {
        // Update existing notice
        const res = await fetch(`/api/admin/notices/${editingNotice.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to update notice.");
        }
      } else {
        // Create new notice
        const res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to create notice.");
        }
      }

      setShowCreateModal(false);
      resetForm();
      await fetchNotices();
    } catch (err: unknown) {
      console.error("Notice submit error:", err);
      setFormError(err instanceof Error ? err.message : "Failed to save announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "Published" | "Draft" | "Archived"
  ) => {
    setActionNoticeId(id);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setNotices((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        // Refresh counts
        setStats((prev) => {
          const current = notices.find((n) => n.id === id);
          if (!current) return prev;
          const oldStatus = current.status.toLowerCase() as keyof NoticeStats;
          const updatedStatus = newStatus.toLowerCase() as keyof NoticeStats;
          return {
            ...prev,
            [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
            [updatedStatus]: (prev[updatedStatus] || 0) + 1,
          };
        });
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionNoticeId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete announcement "${title}"?`)) {
      return;
    }
    setActionNoticeId(id);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setNotices((prev) => prev.filter((item) => item.id !== id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      } else {
        alert(json.error || "Failed to delete announcement.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete announcement.");
    } finally {
      setActionNoticeId(null);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "High":
        return "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      default:
        return "bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800";
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes("Water")) {
      return "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800";
    }
    if (category.includes("Electricity")) {
      return "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
    if (category.includes("Sanitation") || category.includes("Health")) {
      return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
    }
    if (category.includes("Road") || category.includes("Works")) {
      return "bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    }
    if (category.includes("Emergency")) {
      return "bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
    }
    return "bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#064E4A] dark:text-teal-400" />
            <span>Official Announcements & Gazette Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage city-wide and ward-targeted municipal notices, emergency alerts, water & electricity updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotices}
            disabled={loading}
            className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-700 dark:text-gray-300 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs sm:text-sm font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Total Notices
          </span>
          <p className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            {stats.total}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-0.5">
            {stats.published}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Drafts
          </span>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
            {stats.draft}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Archive className="w-3 h-3" /> Archived
          </span>
          <p className="text-2xl font-black text-gray-700 dark:text-gray-300 mt-0.5">
            {stats.archived}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-rose-300 dark:border-rose-900/80 bg-rose-50 dark:bg-rose-950/40 shadow-sm">
          <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <AlertTriangle className="w-3.5 h-3.5" /> Emergency Alerts
          </span>
          <p className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-0.5">
            {stats.emergency}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#061817] shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, or dept..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Category */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Priority */}
          <div className="md:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Emergency Toggle */}
          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`w-full py-2 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${
                emergencyOnly
                  ? "bg-rose-600 text-white border-rose-600 shadow"
                  : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              title="Show Emergency Alerts Only"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Scope Pill Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
          <span className="font-semibold text-gray-500 text-[11px]">Target Scope:</span>
          {(["ALL", "All citizens", "Specific ward(s)", "Entire municipality", "Emergency / city-wide"] as const).map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedScope(scope)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                selectedScope === scope
                  ? "bg-[#064E4A] text-white font-bold"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {scope === "ALL" ? "All Scopes" : scope}
            </button>
          ))}

          {(search ||
            selectedStatus !== "ALL" ||
            selectedCategory !== "ALL" ||
            selectedPriority !== "ALL" ||
            selectedScope !== "ALL" ||
            emergencyOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedStatus("ALL");
                setSelectedCategory("ALL");
                setSelectedPriority("ALL");
                setSelectedScope("ALL");
                setEmergencyOnly(false);
              }}
              className="ml-auto text-[11px] text-teal-700 dark:text-teal-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 bg-white dark:bg-[#061817] rounded-xl border border-gray-200 dark:border-gray-800">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
            <span>Loading announcements from database...</span>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#061817] rounded-xl border border-gray-200 dark:border-gray-800 space-y-3">
            <Bell className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
              No Municipal Announcements Found
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              No notices match your current filters. Click "Publish Announcement" to draft a new municipal circular.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>
        ) : (
          notices.map((n) => {
            const isProcessing = actionNoticeId === n.id;
            return (
              <div
                key={n.id}
                className={`p-5 rounded-xl border bg-white dark:bg-[#061817] shadow-sm space-y-3 transition ${
                  n.isEmergency
                    ? "border-rose-400 dark:border-rose-800 bg-rose-50/20"
                    : n.status === "Published"
                    ? "border-gray-200 dark:border-gray-800"
                    : "border-dashed border-gray-300 dark:border-gray-700 opacity-80"
                }`}
              >
                {/* Top Row: Meta Badges & Actions */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                        #{n.id}
                      </span>

                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getCategoryColor(
                          n.category
                        )}`}
                      >
                        {n.category}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeClass(
                          n.priority
                        )}`}
                      >
                        {n.priority}
                      </span>

                      {/* Emergency Badge */}
                      {n.isEmergency && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1 shadow-sm animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> EMERGENCY ALERT
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          n.status === "Published"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : n.status === "Draft"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {n.status.toUpperCase()}
                      </span>
                    </div>

                    <h2 className="font-extrabold text-base text-gray-900 dark:text-gray-100 leading-snug">
                      {n.title}
                    </h2>
                  </div>

                  {/* Actions Button Group */}
                  <div className="flex items-center gap-1.5">
                    {/* Status Toggle Button */}
                    {n.status === "Published" ? (
                      <button
                        onClick={() => handleUpdateStatus(n.id, "Draft")}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 rounded text-xs font-semibold border border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                        title="Unpublish (Convert to Draft)"
                      >
                        Unpublish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(n.id, "Published")}
                        disabled={isProcessing}
                        className="px-2.5 py-1.5 rounded text-xs font-semibold border border-emerald-300 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                        title="Publish Announcement"
                      >
                        Publish
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(n)}
                      disabled={isProcessing}
                      className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      title="Edit Announcement"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(n.id, n.title)}
                      disabled={isProcessing}
                      className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description Body */}
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {n.description}
                </p>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Target Scope & Wards */}
                    <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-[#064E4A] dark:text-teal-400" />
                      <span>{n.targetScope}:</span>
                      <span className="text-gray-500 font-normal">
                        {n.targetWards || "Entire Municipality"}
                      </span>
                    </span>

                    {/* Publish Date */}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Published: {new Date(n.publishDate).toLocaleDateString()}</span>
                    </span>

                    {/* Expiry Date */}
                    {n.expiryDate && (
                      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Expires: {new Date(n.expiryDate).toLocaleDateString()}</span>
                      </span>
                    )}

                    {/* Authority department */}
                    <span className="text-gray-400">
                      Issued by: {n.issuedByName} ({n.issuedByDepartment})
                    </span>
                  </div>

                  <Link
                    href={`/notices#${n.id}`}
                    target="_blank"
                    className="text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#064E4A] dark:text-teal-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100">
                    {editingNotice ? "Edit Municipal Announcement" : "Draft Official Municipal Announcement"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Target city-wide or specific wards with priority levels and emergency alerts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Announcement Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as "Normal" | "High" | "Urgent")}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Announcement Title (English) *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Scheduled Water Supply Interruption for Pipeline Maintenance"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600 font-medium"
                  required
                />
              </div>

              {/* Emergency Flag Checkbox */}
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsEmergency}
                    onChange={(e) => setFormIsEmergency(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Critical Emergency Alert
                    </span>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Pins this notice to the top and activates a prominent, real-time alert ticker on the public website homepage.
                    </p>
                  </div>
                </label>
              </div>

              {/* Target Scope Selection */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Target Geographic Scope *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormTargetScope("All citizens")}
                    className={`p-3 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      formTargetScope === "All citizens"
                        ? "border-[#064E4A] bg-teal-50/60 dark:bg-teal-950/40 text-[#064E4A] dark:text-teal-300 font-bold"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Radio className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold">All citizens</p>
                      <p className="text-[10px] text-gray-500 font-normal">Broadcast to all citizens across CivSetu</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetScope("Specific ward(s)")}
                    className={`p-3 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      formTargetScope === "Specific ward(s)" || formTargetScope === "Specific Wards"
                        ? "border-[#064E4A] bg-teal-50/60 dark:bg-teal-950/40 text-[#064E4A] dark:text-teal-300 font-bold"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Specific ward(s)</p>
                      <p className="text-[10px] text-gray-500 font-normal">Target affected wards directly</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetScope("Entire municipality")}
                    className={`p-3 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      formTargetScope === "Entire municipality" || formTargetScope === "Entire Municipality"
                        ? "border-[#064E4A] bg-teal-50/60 dark:bg-teal-950/40 text-[#064E4A] dark:text-teal-300 font-bold"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Entire municipality</p>
                      <p className="text-[10px] text-gray-500 font-normal">All 23 Municipal Wards (City-Wide)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTargetScope("Emergency / city-wide");
                      setFormIsEmergency(true);
                      setFormPriority("Urgent");
                    }}
                    className={`p-3 rounded-lg border text-left transition flex items-center gap-2.5 ${
                      formTargetScope === "Emergency / city-wide"
                        ? "border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <div>
                      <p className="font-bold">Emergency / city-wide</p>
                      <p className="text-[10px] text-gray-500 font-normal">Urgent emergency broadcasts & tickers</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Specific Ward Multi-Select Picker */}
              {(formTargetScope === "Specific ward(s)" || formTargetScope === "Specific Wards") && (
                <div className="p-3.5 rounded-lg border border-teal-200 dark:border-teal-900 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      Select Targeted Wards ({formSelectedWards.length} selected):
                    </span>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={selectAllWards}
                        className="text-teal-700 dark:text-teal-400 font-semibold hover:underline"
                      >
                        Select All (1-23)
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={clearAllWards}
                        className="text-gray-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1">
                    {wardsData.map((w) => {
                      const isSelected = formSelectedWards.includes(w.wardNumber);
                      return (
                        <button
                          key={w.wardNumber}
                          type="button"
                          onClick={() => toggleWardSelection(w.wardNumber)}
                          className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition ${
                            isSelected
                              ? "bg-[#064E4A] text-white border-[#064E4A]"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Ward {w.wardNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Publish & Expiry Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formPublishDate}
                    onChange={(e) => setFormPublishDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Defaults to current time</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Auto-expires public display when reached</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Publication Status *
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Published"
                      checked={formStatus === "Published"}
                      onChange={() => setFormStatus("Published")}
                      className="text-teal-600"
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Published (Live on Public Portal)
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formStatus === "Draft"}
                      onChange={() => setFormStatus("Draft")}
                      className="text-teal-600"
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Draft (Internal Only)
                    </span>
                  </label>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Announcement Description & Full Details *
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter complete circular text, shutdown timings, alternative arrangements, contact helplines..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:border-teal-600"
                  required
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold shadow flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {submitting
                      ? "Saving..."
                      : editingNotice
                      ? "Update Announcement"
                      : "Publish Announcement"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
