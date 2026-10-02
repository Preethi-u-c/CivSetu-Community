"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Calendar,
  Building,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Send,
  Users,
  Filter,
  Check,
  ChevronDown,
  AlertTriangle,
  FileCheck2,
  Clock,
  Phone,
  Briefcase,
} from "lucide-react";
import {
  CitizenService,
  ServiceStats,
  ServiceCategory,
  SERVICE_CATEGORIES,
  SERVICE_DEPARTMENTS,
} from "@/lib/types/services";

export default function AdminServicesPage() {
  const [services, setServices] = useState<CitizenService[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<ServiceStats>({
    total: 0,
    active: 0,
    drafts: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Draft" | "Suspended">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active item for Edit/Delete
  const [selectedService, setSelectedService] = useState<CitizenService | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<ServiceCategory>(SERVICE_CATEGORIES[0]);
  const [formDepartment, setFormDepartment] = useState<string>(SERVICE_DEPARTMENTS[0]);
  const [formDescription, setFormDescription] = useState("");
  const [formEligibility, setFormEligibility] = useState("");
  const [formDocsText, setFormDocsText] = useState("");
  const [formProcedure, setFormProcedure] = useState("");
  const [formExpectedTimeline, setFormExpectedTimeline] = useState("7 Working Days");
  const [formContact, setFormContact] = useState("Lakshmeshwar TMC Helpline: 08378-220034");
  const [formOnlineApplicationLink, setFormOnlineApplicationLink] = useState("");
  const [formFee, setFormFee] = useState("Free of Cost");
  const [formStatus, setFormStatus] = useState<"Active" | "Draft" | "Suspended">("Active");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (departmentFilter !== "ALL") params.set("department", departmentFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/services?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      if (json.success) {
        setServices(json.data);
        setTotal(json.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load admin services:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, departmentFilter, search]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetForm = () => {
    setFormName("");
    setFormCategory(SERVICE_CATEGORIES[0]);
    setFormDepartment(SERVICE_DEPARTMENTS[0]);
    setFormDescription("");
    setFormEligibility("");
    setFormDocsText("");
    setFormProcedure("");
    setFormExpectedTimeline("7 Working Days");
    setFormContact("Lakshmeshwar TMC Helpline: 08378-220034");
    setFormOnlineApplicationLink("");
    setFormFee("Free of Cost");
    setFormStatus("Active");
    setActionError(null);
  };

  const populateEditForm = (srv: CitizenService) => {
    setSelectedService(srv);
    setFormName(srv.name);
    setFormCategory(srv.category);
    setFormDepartment(srv.department);
    setFormDescription(srv.description);
    setFormEligibility(srv.eligibility);
    setFormDocsText(srv.requiredDocuments.join("\n"));
    setFormProcedure(srv.procedure);
    setFormExpectedTimeline(srv.expectedTimeline);
    setFormContact(srv.contact);
    setFormOnlineApplicationLink(srv.onlineApplicationLink || "");
    setFormFee(srv.fee || "");
    setFormStatus(srv.status);
    setActionError(null);
    setEditModalOpen(true);
  };

  const parseDocs = (text: string): string[] => {
    return text
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const docs = parseDocs(formDocsText);
    if (!formName.trim() || !formDescription.trim() || !formEligibility.trim() || !formProcedure.trim() || !formExpectedTimeline.trim() || !formContact.trim()) {
      setActionError("Name, Description, Eligibility, Procedure, Timeline, and Contact are mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        department: formDepartment.trim(),
        description: formDescription.trim(),
        eligibility: formEligibility.trim(),
        requiredDocuments: docs,
        procedure: formProcedure.trim(),
        expectedTimeline: formExpectedTimeline.trim(),
        contact: formContact.trim(),
        onlineApplicationLink: formOnlineApplicationLink.trim() || null,
        fee: formFee.trim() || null,
        status: formStatus,
      };

      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to create citizen service.");
        return;
      }

      setCreateModalOpen(false);
      resetForm();
      fetchServices();
    } catch (err) {
      console.error("Error creating service:", err);
      setActionError("A network error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setActionError(null);

    const docs = parseDocs(formDocsText);
    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        category: formCategory,
        department: formDepartment.trim(),
        description: formDescription.trim(),
        eligibility: formEligibility.trim(),
        requiredDocuments: docs,
        procedure: formProcedure.trim(),
        expectedTimeline: formExpectedTimeline.trim(),
        contact: formContact.trim(),
        onlineApplicationLink: formOnlineApplicationLink.trim() || null,
        fee: formFee.trim() || null,
        status: formStatus,
      };

      const res = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to update citizen service.");
        return;
      }

      setEditModalOpen(false);
      resetForm();
      fetchServices();
    } catch (err) {
      console.error("Error updating service:", err);
      setActionError("A network error occurred while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedService) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to delete citizen service.");
        return;
      }

      setDeleteModalOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
      setActionError("A network error occurred while deleting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Heading & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Public Administration & Municipal Utilities</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">
            Citizen Services Directory Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure municipal utilities, SLA delivery deadlines, statutory document requirements, and application procedures.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/services"
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Live Public Directory</span>
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
            <span>Add Citizen Service</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block">Total Services</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
            {stats.total}
          </span>
          <span className="text-[11px] text-gray-400">All registered utilities</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
            Active for Citizens
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats.active}
          </span>
          <span className="text-[11px] text-gray-400">Available on public portal</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block">Drafts</span>
          <span className="text-2xl font-black text-gray-700 dark:text-gray-300 mt-1 block">
            {stats.drafts}
          </span>
          <span className="text-[11px] text-gray-400">Under review</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold block">
            Suspended
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            {stats.suspended}
          </span>
          <span className="text-[11px] text-gray-400">Temporarily paused</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search service name, procedure, department..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "Active" | "Draft" | "Suspended")}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="Active">Status: Active</option>
              <option value="Draft">Status: Draft</option>
              <option value="Suspended">Status: Suspended</option>
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
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-3">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">Department: All Departments</option>
              {SERVICE_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading citizen services records...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">No citizen services found</h3>
            <p className="text-xs text-gray-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Service Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Timeline (SLA)</th>
                  <th className="py-3 px-4">Prescribed Fee</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    {/* Service Details */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="block font-bold text-gray-900 dark:text-gray-100 truncate max-w-[260px]">
                          {srv.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{srv.id}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {srv.category}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-[180px] truncate">
                      {srv.department}
                    </td>

                    {/* Timeline */}
                    <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                      {srv.expectedTimeline}
                    </td>

                    {/* Fee */}
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                      {srv.fee || "Free of Cost"}
                    </td>

                    {/* Documents */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{srv.requiredDocuments.length} items</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          srv.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : srv.status === "Draft"
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {srv.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => populateEditForm(srv)}
                          className="p-1.5 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition"
                          title="Edit Service"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedService(srv);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <Layers className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Register New Municipal Citizen Service
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
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. New Piped Drinking Water Connection"
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
                    onChange={(e) => setFormCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SERVICE_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Service Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain what municipal utility is provided and its scope..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  rows={2}
                  value={formEligibility}
                  onChange={(e) => setFormEligibility(e.target.value)}
                  placeholder="e.g. Any registered property owner in Lakshmeshwar TMC..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mandatory Required Documents (One document per line)
                </label>
                <textarea
                  rows={3}
                  value={formDocsText}
                  onChange={(e) => setFormDocsText(e.target.value)}
                  placeholder="Latest Property Tax Paid Receipt&#10;Khata Extract (Form-3)&#10;Aadhaar Card of Applicant&#10;Passport size photograph"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Step-by-Step Procedure *
                </label>
                <textarea
                  rows={3}
                  value={formProcedure}
                  onChange={(e) => setFormProcedure(e.target.value)}
                  placeholder="Step 1: Fill out the application form...&#10;Step 2: On-site verification...&#10;Step 3: Payment of fees...&#10;Step 4: Activation of service."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Expected Timeline (SLA) *
                  </label>
                  <input
                    type="text"
                    value={formExpectedTimeline}
                    onChange={(e) => setFormExpectedTimeline(e.target.value)}
                    placeholder="e.g. 7 Working Days"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Prescribed Fee (Optional)
                  </label>
                  <input
                    type="text"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    placeholder="e.g. Free of Cost or ₹500"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact / Officer In-Charge *
                  </label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Online Application Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formOnlineApplicationLink}
                    onChange={(e) => setFormOnlineApplicationLink(e.target.value)}
                    placeholder="/applications?service=... or https://..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Active" | "Draft" | "Suspended")}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <option value="Active">Active (Visible to Public)</option>
                    <option value="Draft">Draft (Internal review)</option>
                    <option value="Suspended">Suspended</option>
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
                  <span>Publish Citizen Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Edit Citizen Service #{selectedService.id}
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
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
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
                    onChange={(e) => setFormCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SERVICE_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Service Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  rows={2}
                  value={formEligibility}
                  onChange={(e) => setFormEligibility(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mandatory Required Documents (One document per line)
                </label>
                <textarea
                  rows={3}
                  value={formDocsText}
                  onChange={(e) => setFormDocsText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Step-by-Step Procedure *
                </label>
                <textarea
                  rows={3}
                  value={formProcedure}
                  onChange={(e) => setFormProcedure(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Expected Timeline (SLA) *
                  </label>
                  <input
                    type="text"
                    value={formExpectedTimeline}
                    onChange={(e) => setFormExpectedTimeline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Prescribed Fee
                  </label>
                  <input
                    type="text"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact / Officer In-Charge *
                  </label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Online Application Link
                  </label>
                  <input
                    type="text"
                    value={formOnlineApplicationLink}
                    onChange={(e) => setFormOnlineApplicationLink(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Active" | "Draft" | "Suspended")}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Suspended">Suspended</option>
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
      {deleteModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                Delete Citizen Service?
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently remove this service:
              </p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                "{selectedService.name}"
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
