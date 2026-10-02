"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Landmark,
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
  Award,
} from "lucide-react";
import {
  GovernmentScheme,
  SchemeStats,
  SchemeCategory,
  SCHEME_CATEGORIES,
  SCHEME_DEPARTMENTS,
} from "@/lib/types/schemes";

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<SchemeStats>({
    total: 0,
    active: 0,
    drafts: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Draft" | "Closed">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active item for Edit/Delete
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDepartment, setFormDepartment] = useState<string>(SCHEME_DEPARTMENTS[0]);
  const [formCategory, setFormCategory] = useState<SchemeCategory>(SCHEME_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState("");
  const [formEligibility, setFormEligibility] = useState("");
  const [formDocsText, setFormDocsText] = useState("");
  const [formApplicationProcess, setFormApplicationProcess] = useState("");
  const [formBenefits, setFormBenefits] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formOfficialLink, setFormOfficialLink] = useState("");
  const [formContactInfo, setFormContactInfo] = useState("Lakshmeshwar TMC Helpline: 08378-220034");
  const [formStatus, setFormStatus] = useState<"Active" | "Draft" | "Closed">("Active");

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (departmentFilter !== "ALL") params.set("department", departmentFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/admin/schemes?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const json = await res.json();
      if (json.success) {
        setSchemes(json.data);
        setTotal(json.total || 0);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to load admin schemes:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, departmentFilter, search]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const resetForm = () => {
    setFormName("");
    setFormDepartment(SCHEME_DEPARTMENTS[0]);
    setFormCategory(SCHEME_CATEGORIES[0]);
    setFormDescription("");
    setFormEligibility("");
    setFormDocsText("");
    setFormApplicationProcess("");
    setFormBenefits("");
    setFormDeadline("");
    setFormOfficialLink("");
    setFormContactInfo("Lakshmeshwar TMC Helpline: 08378-220034");
    setFormStatus("Active");
    setActionError(null);
  };

  const populateEditForm = (sc: GovernmentScheme) => {
    setSelectedScheme(sc);
    setFormName(sc.name);
    setFormDepartment(sc.department);
    setFormCategory(sc.category);
    setFormDescription(sc.description);
    setFormEligibility(sc.eligibility);
    setFormDocsText(sc.documentsRequired.join("\n"));
    setFormApplicationProcess(sc.applicationProcess);
    setFormBenefits(sc.benefits);
    setFormDeadline(sc.deadline || "");
    setFormOfficialLink(sc.officialLink || "");
    setFormContactInfo(sc.contactInfo);
    setFormStatus(sc.status);
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
    if (!formName.trim() || !formDescription.trim() || !formEligibility.trim() || !formApplicationProcess.trim() || !formBenefits.trim()) {
      setActionError("Name, Description, Eligibility, Application Process, and Benefits are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        department: formDepartment.trim(),
        category: formCategory,
        description: formDescription.trim(),
        eligibility: formEligibility.trim(),
        documentsRequired: docs,
        applicationProcess: formApplicationProcess.trim(),
        benefits: formBenefits.trim(),
        deadline: formDeadline.trim() || null,
        officialLink: formOfficialLink.trim() || null,
        contactInfo: formContactInfo.trim() || "Lakshmeshwar TMC Helpdesk: 08378-220034",
        status: formStatus,
      };

      const res = await fetch("/api/admin/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to create government scheme.");
        return;
      }

      setCreateModalOpen(false);
      resetForm();
      fetchSchemes();
    } catch (err) {
      console.error("Error creating scheme:", err);
      setActionError("A network error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;
    setActionError(null);

    const docs = parseDocs(formDocsText);
    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        department: formDepartment.trim(),
        category: formCategory,
        description: formDescription.trim(),
        eligibility: formEligibility.trim(),
        documentsRequired: docs,
        applicationProcess: formApplicationProcess.trim(),
        benefits: formBenefits.trim(),
        deadline: formDeadline.trim() || null,
        officialLink: formOfficialLink.trim() || null,
        contactInfo: formContactInfo.trim(),
        status: formStatus,
      };

      const res = await fetch(`/api/admin/schemes/${selectedScheme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to update scheme.");
        return;
      }

      setEditModalOpen(false);
      resetForm();
      fetchSchemes();
    } catch (err) {
      console.error("Error updating scheme:", err);
      setActionError("A network error occurred while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedScheme) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/schemes/${selectedScheme.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setActionError(json.error || "Failed to delete scheme.");
        return;
      }

      setDeleteModalOpen(false);
      setSelectedScheme(null);
      fetchSchemes();
    } catch (err) {
      console.error("Error deleting scheme:", err);
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
            <Landmark className="w-4 h-4" />
            <span>Citizen Welfare & Social Entitlements</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mt-1">
            Government Schemes Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage central, state, and municipal citizen assistance schemes, eligibility criteria, and application portals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/schemes"
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
            <span>Add Government Scheme</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block">Total Schemes</span>
          <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">
            {stats.total}
          </span>
          <span className="text-[11px] text-gray-400">All managed programs</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">
            Active for Citizens
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {stats.active}
          </span>
          <span className="text-[11px] text-gray-400">Applications currently open</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold block">Drafts</span>
          <span className="text-2xl font-black text-gray-700 dark:text-gray-300 mt-1 block">
            {stats.drafts}
          </span>
          <span className="text-[11px] text-gray-400">Under administrative review</span>
        </div>

        <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold block">
            Closed Schemes
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            {stats.closed}
          </span>
          <span className="text-[11px] text-gray-400">Expired or discontinued</span>
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
              placeholder="Search scheme name, department, benefits..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "Active" | "Draft" | "Closed")}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="Active">Status: Active</option>
              <option value="Draft">Status: Draft</option>
              <option value="Closed">Status: Closed</option>
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
              {SCHEME_CATEGORIES.map((c) => (
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
              {SCHEME_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw className="w-8 h-8 text-[#064E4A] dark:text-teal-400 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading government schemes catalog...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Landmark className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">No schemes found</h3>
            <p className="text-xs text-gray-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Scheme Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {schemes.map((sc) => (
                  <tr key={sc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    {/* Scheme Details */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="block font-bold text-gray-900 dark:text-gray-100 truncate max-w-[280px]">
                          {sc.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{sc.id}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {sc.category}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                      {sc.department}
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {sc.deadline || "Open / Ongoing"}
                    </td>

                    {/* Documents */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>{sc.documentsRequired.length} items</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sc.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : sc.status === "Draft"
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {sc.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => populateEditForm(sc)}
                          className="p-1.5 rounded-lg text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60 transition"
                          title="Edit Scheme"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedScheme(sc);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                          title="Delete Scheme"
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
                <Landmark className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Register New Government Scheme
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
                  Scheme Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Pradhan Mantri Awas Yojana (Urban 2.0)"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SCHEME_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SchemeCategory)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SCHEME_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Scheme Description *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Comprehensive summary of what the welfare program aims to accomplish..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Benefits & Entitlements *
                </label>
                <textarea
                  rows={2}
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  placeholder="e.g. ₹2.5 Lakh financial assistance for house construction..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  rows={3}
                  value={formEligibility}
                  onChange={(e) => setFormEligibility(e.target.value)}
                  placeholder="e.g. Resident of Lakshmeshwar TMC, annual family income below ₹3 Lakh..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mandatory Documents (One document per line)
                </label>
                <textarea
                  rows={3}
                  value={formDocsText}
                  onChange={(e) => setFormDocsText(e.target.value)}
                  placeholder="Aadhaar Card&#10;Ration Card / BPL Card&#10;Bank Passbook Copy&#10;Income & Caste Certificate"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A] font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Application Process Steps *
                </label>
                <textarea
                  rows={3}
                  value={formApplicationProcess}
                  onChange={(e) => setFormApplicationProcess(e.target.value)}
                  placeholder="Step 1: Visit Seva Sindhu or Lakshmeshwar TMC office...&#10;Step 2: Submit certified copies...&#10;Step 3: Verification by ward revenue inspector..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Application Deadline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    placeholder="e.g. 31 Dec 2026 or leave blank for Ongoing"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Official Online Portal Link
                  </label>
                  <input
                    type="url"
                    value={formOfficialLink}
                    onChange={(e) => setFormOfficialLink(e.target.value)}
                    placeholder="https://pmaymis.gov.in"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Helpline / Contact Information
                  </label>
                  <input
                    type="text"
                    value={formContactInfo}
                    onChange={(e) => setFormContactInfo(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Active" | "Draft" | "Closed")}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <option value="Active">Active (Visible to Citizens)</option>
                    <option value="Draft">Draft (Internal review)</option>
                    <option value="Closed">Closed</option>
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
                  <span>Save & Publish Scheme</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#064E4A] dark:text-teal-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Edit Scheme #{selectedScheme.id}
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
                  Scheme Name *
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
                    Department *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SCHEME_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as SchemeCategory)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    {SCHEME_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Scheme Description *
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
                  Benefits & Entitlements *
                </label>
                <textarea
                  rows={2}
                  value={formBenefits}
                  onChange={(e) => setFormBenefits(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Eligibility Criteria *
                </label>
                <textarea
                  rows={3}
                  value={formEligibility}
                  onChange={(e) => setFormEligibility(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mandatory Documents (One document per line)
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
                  Application Process Steps *
                </label>
                <textarea
                  rows={3}
                  value={formApplicationProcess}
                  onChange={(e) => setFormApplicationProcess(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="text"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Official Online Portal Link
                  </label>
                  <input
                    type="url"
                    value={formOfficialLink}
                    onChange={(e) => setFormOfficialLink(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Helpline / Contact Information
                  </label>
                  <input
                    type="text"
                    value={formContactInfo}
                    onChange={(e) => setFormContactInfo(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Scheme Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "Active" | "Draft" | "Closed")}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#064E4A]"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Closed">Closed</option>
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
      {deleteModalOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#071d1b] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                Delete Government Scheme?
              </h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently remove this scheme:
              </p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                "{selectedScheme.name}"
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
