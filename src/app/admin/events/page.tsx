"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
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
  Users,
  Filter,
  Check,
  ChevronDown,
  Ticket,
  AlertTriangle,
  Building,
} from "lucide-react";
import { wardsData } from "@/data/wards";
import {
  MunicipalEvent,
  EventStats,
  EventCategory,
  EVENT_CATEGORIES,
  DEFAULT_EVENT_IMAGE,
} from "@/lib/types/events";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<MunicipalEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<EventStats>({
    total: 0,
    upcoming: 0,
    past: 0,
    registrationRequired: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Published" | "Draft" | "Cancelled">("ALL");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active item for Edit/Delete
  const [selectedEvent, setSelectedEvent] = useState<MunicipalEvent | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEventDate, setFormEventDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState<EventCategory>(EVENT_CATEGORIES[0]);
  const [formOrganizer, setFormOrganizer] = useState("Lakshmeshwar Town Municipal Council");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formWardScope, setFormWardScope] = useState<"All Wards" | "Entire Municipality" | "Specific Wards">("All Wards");
  const [formSelectedWards, setFormSelectedWards] = useState<number[]>([]);
  const [formIsRegistrationRequired, setFormIsRegistrationRequired] = useState(false);
  const [formRegistrationLink, setFormRegistrationLink] = useState("");
  const [formCapacity, setFormCapacity] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"Published" | "Draft" | "Cancelled">("Published");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (timeFilter !== "all") params.set("timeFilter", timeFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (wardFilter !== "ALL") params.set("ward", wardFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      if (json.success) {
        setEvents(json.data);
        setTotal(json.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load admin events:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, timeFilter, categoryFilter, wardFilter, search]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormEventDate("");
    setFormStartTime("");
    setFormEndTime("");
    setFormLocation("");
    setFormCategory(EVENT_CATEGORIES[0]);
    setFormOrganizer("Lakshmeshwar Town Municipal Council");
    setFormImageUrl("");
    setFormWardScope("All Wards");
    setFormSelectedWards([]);
    setFormIsRegistrationRequired(false);
    setFormRegistrationLink("");
    setFormCapacity("");
    setFormStatus("Published");
    setActionError(null);
  };

  const populateEditForm = (ev: MunicipalEvent) => {
    setSelectedEvent(ev);
    setFormTitle(ev.title);
    setFormDescription(ev.description);
    setFormEventDate(ev.eventDate);
    setFormStartTime(ev.startTime);
    setFormEndTime(ev.endTime || "");
    setFormLocation(ev.location);
    setFormCategory(ev.category);
    setFormOrganizer(ev.organizer);
    setFormImageUrl(ev.imageUrl || "");

    if (ev.wardRelevance === "All Wards") {
      setFormWardScope("All Wards");
      setFormSelectedWards([]);
    } else if (ev.wardRelevance === "Entire Municipality") {
      setFormWardScope("Entire Municipality");
      setFormSelectedWards([]);
    } else {
      setFormWardScope("Specific Wards");
      const matched = ev.wardRelevance.match(/\d+/g);
      if (matched) {
        setFormSelectedWards(matched.map(Number));
      } else {
        setFormSelectedWards([]);
      }
    }

    setFormIsRegistrationRequired(ev.isRegistrationRequired);
    setFormRegistrationLink(ev.registrationLink || "");
    setFormCapacity(ev.capacity ? String(ev.capacity) : "");
    setFormStatus(ev.status);
    setActionError(null);
    setEditModalOpen(true);
  };

  const computeWardRelevance = (): string => {
    if (formWardScope === "All Wards") return "All Wards";
    if (formWardScope === "Entire Municipality") return "Entire Municipality";
    if (formSelectedWards.length === 0) return "All Wards";
    const sorted = [...formSelectedWards].sort((a, b) => a - b);
    return sorted.map((n) => `Ward ${String(n).padStart(2, "0")}`).join(", ");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!formTitle.trim() || !formDescription.trim() || !formEventDate || !formStartTime.trim() || !formLocation.trim()) {
      setActionError("Title, Description, Event Date, Start Time, and Location are mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        eventDate: formEventDate,
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim() || null,
        location: formLocation.trim(),
        wardRelevance: computeWardRelevance(),
        imageUrl: formImageUrl.trim() || DEFAULT_EVENT_IMAGE,
        category: formCategory,
        organizer: formOrganizer.trim() || "Lakshmeshwar Town Municipal Council",
        isRegistrationRequired: formIsRegistrationRequired,
        registrationLink: formRegistrationLink.trim() || null,
        capacity: formCapacity ? Number(formCapacity) : null,
        status: formStatus,
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to create event.");
        return;
      }

      setCreateModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      setActionError("A network error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setActionError(null);

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        eventDate: formEventDate,
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim() || null,
        location: formLocation.trim(),
        wardRelevance: computeWardRelevance(),
        imageUrl: formImageUrl.trim() || DEFAULT_EVENT_IMAGE,
        category: formCategory,
        organizer: formOrganizer.trim(),
        isRegistrationRequired: formIsRegistrationRequired,
        registrationLink: formRegistrationLink.trim() || null,
        capacity: formCapacity ? Number(formCapacity) : null,
        status: formStatus,
      };

      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to update event.");
        return;
      }

      setEditModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error("Error updating event:", err);
      setActionError("A network error occurred while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to delete event.");
        return;
      }

      setDeleteModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      setActionError("A network error occurred while deleting.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleWard = (wardNo: number) => {
    if (formSelectedWards.includes(wardNo)) {
      setFormSelectedWards(formSelectedWards.filter((w) => w !== wardNo));
    } else {
      setFormSelectedWards([...formSelectedWards, wardNo]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Heading & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Civic Activities & Town Calendar</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">
            Events & Festivals Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Schedule civic programs, awareness camps, town festivals, and ward council meetings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/events"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Live Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Event</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block">Total Events</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
            {stats.total}
          </span>
          <span className="text-[11px] text-gray-400">All registered records</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
            Upcoming Programs
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats.upcoming}
          </span>
          <span className="text-[11px] text-gray-400">Scheduled for future dates</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block">Past Archives</span>
          <span className="text-2xl font-black text-gray-700 dark:text-gray-300 mt-1 block">
            {stats.past}
          </span>
          <span className="text-[11px] text-gray-400">Successfully conducted</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold block">
            Reg. Required
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {stats.registrationRequired}
          </span>
          <span className="text-[11px] text-gray-400">Pass / RSVP needed</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, venue, organizer..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
          </div>

          {/* Time Filter */}
          <div className="sm:col-span-2">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as "all" | "upcoming" | "past")}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="all">Time: All Dates</option>
              <option value="upcoming">Time: Upcoming Only</option>
              <option value="past">Time: Past Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "Published" | "Draft" | "Cancelled")}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="Published">Status: Published</option>
              <option value="Draft">Status: Draft</option>
              <option value="Cancelled">Status: Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">Category: All</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Ward Filter */}
          <div className="sm:col-span-2">
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">Ward: All Wards</option>
              {wardsData.map((w) => (
                <option key={w.wardNumber} value={`Ward ${String(w.wardNumber).padStart(2, "0")}`}>
                  Ward {String(w.wardNumber).padStart(2, "0")} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Table / List */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading municipal events records...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">No events found</h3>
            <p className="text-xs text-gray-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Location / Ward</th>
                  <th className="py-3 px-4">Admission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {events.map((ev) => {
                  const isPast = new Date(ev.eventDate) < new Date(new Date().toDateString());
                  return (
                    <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      {/* Event Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <Image
                              src={ev.imageUrl || DEFAULT_EVENT_IMAGE}
                              alt={ev.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-bold text-gray-900 dark:text-gray-100 truncate max-w-[240px]">
                              {ev.title}
                            </span>
                            <span className="text-[11px] text-gray-500 truncate block">
                              Org: {ev.organizer}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">{ev.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        {ev.category}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 dark:text-gray-100 block">
                          {ev.eventDate}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {ev.startTime} {ev.endTime ? `– ${ev.endTime}` : ""}
                        </span>
                        {isPast && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            (Archived)
                          </span>
                        )}
                      </td>

                      {/* Location / Ward */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate max-w-[180px]">
                          {ev.location}
                        </span>
                        <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium block">
                          {ev.wardRelevance}
                        </span>
                      </td>

                      {/* Admission */}
                      <td className="py-3.5 px-4">
                        {ev.isRegistrationRequired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            <Ticket className="w-3 h-3" /> Reg. Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                            Open for All
                          </span>
                        )}
                        {ev.capacity && (
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            Cap: {ev.capacity}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ev.status === "Published"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : ev.status === "Draft"
                              ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => populateEditForm(ev)}
                            className="p-1.5 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEvent(ev);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Schedule New Municipal Event
                </h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Lakshmeshwar Someshwara Jathra Utsava 2026"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Organizer *
                  </label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    placeholder="e.g. Town Municipal Council"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="e.g. 05:00 PM"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Someshwara Temple Premises, Ward 04"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              {/* Ward Scope */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300">
                  Target Audience / Ward Scope
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="wardScope"
                      checked={formWardScope === "All Wards"}
                      onChange={() => setFormWardScope("All Wards")}
                    />
                    <span>All Wards</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="wardScope"
                      checked={formWardScope === "Entire Municipality"}
                      onChange={() => setFormWardScope("Entire Municipality")}
                    />
                    <span>Entire Municipality</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="wardScope"
                      checked={formWardScope === "Specific Wards"}
                      onChange={() => setFormWardScope("Specific Wards")}
                    />
                    <span>Specific Ward(s)</span>
                  </label>
                </div>

                {formWardScope === "Specific Wards" && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                    <span className="text-[11px] text-gray-500 font-semibold block">
                      Select applicable wards:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {wardsData.map((w) => {
                        const isChecked = formSelectedWards.includes(w.wardNumber);
                        return (
                          <button
                            type="button"
                            key={w.wardNumber}
                            onClick={() => toggleWard(w.wardNumber)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                              isChecked
                                ? "bg-[#064E4A] text-white border-[#064E4A]"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                            }`}
                          >
                            W{String(w.wardNumber).padStart(2, "0")} - {w.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description & Program Agenda *
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the significance, schedule, and guidelines for citizens..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                />
              </div>

              {/* Registration Options */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={formIsRegistrationRequired}
                    onChange={(e) => setFormIsRegistrationRequired(e.target.checked)}
                    className="w-4 h-4 text-[#064E4A] rounded"
                  />
                  <span>Prior Registration / Entry Pass Required</span>
                </label>

                {formIsRegistrationRequired && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Registration Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={formRegistrationLink}
                        onChange={(e) => setFormRegistrationLink(e.target.value)}
                        placeholder="https://forms.gov.in/..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Attendee Capacity (Optional)
                      </label>
                      <input
                        type="number"
                        value={formCapacity}
                        onChange={(e) => setFormCapacity(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Published" | "Draft")}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <option value="Published">Published (Public immediately)</option>
                    <option value="Draft">Draft (Internal review)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Edit Municipal Event #{selectedEvent.id}
                </h2>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Organizer *
                  </label>
                  <input
                    type="text"
                    value={formOrganizer}
                    onChange={(e) => setFormOrganizer(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              {/* Ward Scope */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300">
                  Target Audience / Ward Scope
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="wardScopeEdit"
                      checked={formWardScope === "All Wards"}
                      onChange={() => setFormWardScope("All Wards")}
                    />
                    <span>All Wards</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="wardScopeEdit"
                      checked={formWardScope === "Entire Municipality"}
                      onChange={() => setFormWardScope("Entire Municipality")}
                    />
                    <span>Entire Municipality</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="wardScopeEdit"
                      checked={formWardScope === "Specific Wards"}
                      onChange={() => setFormWardScope("Specific Wards")}
                    />
                    <span>Specific Ward(s)</span>
                  </label>
                </div>

                {formWardScope === "Specific Wards" && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
                    <span className="text-[11px] text-gray-500 font-semibold block">
                      Select applicable wards:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {wardsData.map((w) => {
                        const isChecked = formSelectedWards.includes(w.wardNumber);
                        return (
                          <button
                            type="button"
                            key={w.wardNumber}
                            onClick={() => toggleWard(w.wardNumber)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                              isChecked
                                ? "bg-[#064E4A] text-white border-[#064E4A]"
                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                            }`}
                          >
                            W{String(w.wardNumber).padStart(2, "0")} - {w.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description & Agenda *
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                />
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={formIsRegistrationRequired}
                    onChange={(e) => setFormIsRegistrationRequired(e.target.checked)}
                    className="w-4 h-4 text-[#064E4A] rounded"
                  />
                  <span>Prior Registration / Entry Pass Required</span>
                </label>

                {formIsRegistrationRequired && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Registration Link
                      </label>
                      <input
                        type="url"
                        value={formRegistrationLink}
                        onChange={(e) => setFormRegistrationLink(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Attendee Capacity
                      </label>
                      <input
                        type="number"
                        value={formCapacity}
                        onChange={(e) => setFormCapacity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Event Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Published" | "Draft" | "Cancelled")}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#064E4A] hover:bg-[#0B6B63] text-white font-bold rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                Delete Municipal Event?
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently delete:
              </p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                "{selectedEvent.title}"
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
