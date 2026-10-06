"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building,
  Mail,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  Layers,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";

interface AuthorityOfficer {
  id: string;
  fullName: string;
  designation: string;
  department: string;
  authorityLevel: "Local Authority" | "Block level" | "District Panchayat" | "District Administration";
  email: string;
  mobileNumber?: string;
  isActive: boolean;
  createdAt: string;
  complaintCount: number;
}

const CANONICAL_DEPARTMENTS = [
  "Water Supply",
  "Sanitation & Solid Waste",
  "Electricity & Streetlights",
  "Roads & Infrastructure",
  "Health & Medical",
  "Revenue & Property Tax",
  "Town Planning",
  "Public Grievance",
  "Education",
  "Women & Child Development"
];

const AUTHORITY_LEVELS = [
  "Local Authority",
  "Block level",
  "District Panchayat",
  "District Administration"
];

export default function AdminAuthoritiesPage() {
  const [authorities, setAuthorities] = useState<AuthorityOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editOfficer, setEditOfficer] = useState<AuthorityOfficer | null>(null);
  const [deleteOfficerId, setDeleteOfficerId] = useState<string | null>(null);
  
  const [confirmOfficer, setConfirmOfficer] = useState<{
    id: string;
    name: string;
    currentActive: boolean;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    department: CANONICAL_DEPARTMENTS[0],
    authorityLevel: AUTHORITY_LEVELS[0],
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/authorities");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setAuthorities(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load authorities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const handleToggleStatus = async (id: string, nextStatus: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/authorities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: nextStatus }),
      });

      if (res.ok) {
        setAuthorities((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isActive: nextStatus } : a))
        );
      }
    } catch (err) {
      console.error("Failed to update authority officer:", err);
    } finally {
      setUpdatingId(null);
      setConfirmOfficer(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteOfficerId) return;
    setUpdatingId(deleteOfficerId);
    try {
      const res = await fetch(`/api/admin/authorities/${deleteOfficerId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setAuthorities(prev => prev.filter(a => a.id !== deleteOfficerId));
      }
    } catch (err) {
      console.error("Failed to delete authority officer:", err);
    } finally {
      setUpdatingId(null);
      setDeleteOfficerId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      designation: "",
      department: CANONICAL_DEPARTMENTS[0],
      authorityLevel: AUTHORITY_LEVELS[0],
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: ""
    });
    setFormError("");
    setEditOfficer(null);
    setShowAddModal(false);
  };

  const openEditModal = (officer: AuthorityOfficer) => {
    setEditOfficer(officer);
    setFormData({
      fullName: officer.fullName,
      designation: officer.designation,
      department: officer.department,
      authorityLevel: officer.authorityLevel,
      email: officer.email,
      mobileNumber: officer.mobileNumber || "",
      password: "",
      confirmPassword: ""
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.fullName || !formData.designation || !formData.email) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (!editOfficer && (!formData.password || formData.password.length < 8)) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormLoading(true);
    try {
      const url = editOfficer 
        ? `/api/admin/authorities/${editOfficer.id}` 
        : "/api/admin/authorities";
      
      const method = editOfficer ? "PUT" : "POST";
      
      const payload: any = {
        fullName: formData.fullName,
        designation: formData.designation,
        department: formData.department,
        authorityLevel: formData.authorityLevel,
        email: formData.email,
        mobileNumber: formData.mobileNumber || undefined,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (editOfficer) {
          setAuthorities(prev => prev.map(a => a.id === data.data.id ? { ...a, ...data.data } : a));
        } else {
          fetchAuthorities();
        }
        resetForm();
      } else {
        setFormError(data.error || "Failed to save authority officer.");
      }
    } catch (err) {
      setFormError("An error occurred while saving.");
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  // Group by hierarchy tier
  const tiers: Array<{
    level: "Local Authority" | "Block level" | "District Panchayat" | "District Administration";
    title: string;
    badgeColor: string;
    description: string;
  }> = [
    {
      level: "Local Authority",
      title: "Tier 1: Local Authority (Lakshmeshwar TMC)",
      badgeColor: "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800",
      description: "First-line municipal officers handling ward-level water, sanitation, electrical and civil grievances.",
    },
    {
      level: "Block level",
      title: "Tier 2: Block Level (Lakshmeshwar Taluk Panchayat)",
      badgeColor: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800",
      description: "Taluk Executive Office oversight for grievances exceeding primary 48-hour local SLAs.",
    },
    {
      level: "District Panchayat",
      title: "Tier 3: District Panchayat (Gadag Zilla Panchayat)",
      badgeColor: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      description: "Zilla Panchayat Chief Executive Officer planning and development appellate tier.",
    },
    {
      level: "District Administration",
      title: "Tier 4: District Administration (DC Office Gadag)",
      badgeColor: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
      description: "Deputy Commissioner & District Magistrate supreme administrative authority.",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Hierarchy</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Authority Officers Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-teal-300 mt-1">
            Verified Karnataka Municipal & Panchayat hierarchy spanning Local, Taluk, Zilla, and District administrative tiers.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Officer</span>
          </button>
          
          <button
            onClick={fetchAuthorities}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 text-xs font-bold border border-gray-300 dark:border-teal-700/60 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Tiers Container */}
      <div className="space-y-6">
        {tiers.map((tier) => {
          const tierOfficers = authorities.filter((a) => a.authorityLevel === tier.level);

          return (
            <div
              key={tier.level}
              className="bg-white dark:bg-[#061F1D] rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm overflow-hidden"
            >
              {/* Tier Header */}
              <div className="p-4 sm:p-5 bg-gray-50 dark:bg-teal-950/60 border-b border-gray-200 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                      {tier.level}
                    </span>
                    <h2 className="font-bold text-sm text-gray-900 dark:text-white">
                      {tier.title}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-teal-300 mt-1">
                    {tier.description}
                  </p>
                </div>

                <span className="text-xs text-gray-500 dark:text-teal-300 font-semibold self-start sm:self-auto">
                  {tierOfficers.length} Officers Registered
                </span>
              </div>

              {/* Officers Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {tierOfficers.length === 0 ? (
                  <div className="col-span-2 p-6 text-center text-xs text-gray-400 dark:text-teal-400">
                    No active officers currently mapped to this tier.
                  </div>
                ) : (
                  tierOfficers.map((officer) => (
                    <div
                      key={officer.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                        officer.isActive
                          ? "bg-gray-50/60 dark:bg-teal-950/30 border-gray-200 dark:border-teal-800/80 hover:shadow-md"
                          : "bg-gray-100 dark:bg-gray-900/60 border-gray-300 dark:border-gray-800 opacity-60"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center shrink-0 border border-teal-300 dark:border-teal-700">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                {officer.fullName}
                              </h3>
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                                {officer.designation}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(officer)}
                              className="p-1.5 text-gray-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 bg-gray-100 hover:bg-teal-50 dark:bg-teal-900/40 dark:hover:bg-teal-800/60 rounded-md transition"
                              title="Edit Officer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteOfficerId(officer.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 hover:bg-red-50 dark:bg-gray-800/60 dark:hover:bg-red-900/40 rounded-md transition"
                              title="Delete Officer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 ${
                                officer.isActive
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {officer.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1.5 pt-2 border-t border-gray-100 dark:border-teal-800/40">
                          <p className="text-gray-700 dark:text-teal-100 font-medium">
                            {officer.department}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 dark:text-teal-300 text-[11px]">
                            <span className="flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              {officer.email}
                            </span>
                            {officer.mobileNumber && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                {officer.mobileNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-teal-800/40 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-400 dark:text-teal-400">
                          Staff ID: {officer.id}
                        </span>

                        <button
                          onClick={() =>
                            setConfirmOfficer({
                              id: officer.id,
                              name: officer.fullName,
                              currentActive: officer.isActive,
                            })
                          }
                          disabled={updatingId === officer.id}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                            officer.isActive
                              ? "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                              : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          {updatingId === officer.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : null}
                          <span>{officer.isActive ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-teal-800 flex items-center justify-between bg-gray-50 dark:bg-teal-950/40 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {editOfficer ? "Edit Authority Officer" : "Add New Officer"}
              </h3>
              <button 
                onClick={resetForm}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-teal-400 dark:hover:text-teal-200 rounded-full hover:bg-gray-200 dark:hover:bg-teal-900 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 rounded-xl flex items-center gap-2 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <form id="officer-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">Full Name *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">Designation *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      placeholder="e.g. Chief Engineer"
                      className="w-full px-3 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">Department *</label>
                    <div className="relative">
                      <select 
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full pl-3 pr-8 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                      >
                        {CANONICAL_DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">Authority Level *</label>
                    <div className="relative">
                      <select 
                        required
                        value={formData.authorityLevel}
                        onChange={(e) => setFormData({...formData, authorityLevel: e.target.value})}
                        className="w-full pl-3 pr-8 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                      >
                        {AUTHORITY_LEVELS.map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">Email Address *</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="officer@example.com"
                      className="w-full px-3 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">Mobile Number</label>
                    <input 
                      type="tel" 
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">
                      {editOfficer ? "New Password (Optional)" : "Password *"}
                    </label>
                    <input 
                      required={!editOfficer}
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={editOfficer ? "Leave blank to keep unchanged" : "Min. 8 characters"}
                      minLength={editOfficer && !formData.password ? undefined : 8}
                      className="w-full px-3 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-teal-200">
                      {editOfficer ? "Confirm New Password" : "Confirm Password *"}
                    </label>
                    <input 
                      required={!!(!editOfficer || formData.password)}
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Re-enter password"
                      minLength={editOfficer && !formData.password ? undefined : 8}
                      className="w-full px-3 py-2 bg-white dark:bg-[#041211] border border-gray-300 dark:border-teal-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 dark:text-white" 
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-teal-800 bg-gray-50 dark:bg-teal-950/40 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={resetForm}
                disabled={formLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-teal-200 hover:bg-gray-200 dark:hover:bg-teal-900 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                form="officer-form"
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-70"
              >
                {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                <span>{editOfficer ? "Save Changes" : "Create Officer"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Status Change) */}
      {confirmOfficer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Confirm Officer Status Change
                </h3>
                <p className="text-xs text-gray-500 dark:text-teal-300">
                  {confirmOfficer.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-teal-100 leading-relaxed">
              Are you sure you want to {confirmOfficer.currentActive ? "deactivate" : "activate"}{" "}
              <span className="font-bold">{confirmOfficer.name}</span>?
              {confirmOfficer.currentActive &&
                " Deactivating this officer suspends login credentials to the authority desk while preserving historical audit logs."}
            </p>

            <div className="pt-3 border-t border-gray-100 dark:border-teal-800 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmOfficer(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleToggleStatus(
                    confirmOfficer.id,
                    !confirmOfficer.currentActive
                  )
                }
                className={`px-4 py-2 rounded-xl text-white font-bold transition ${
                  confirmOfficer.currentActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm {confirmOfficer.currentActive ? "Deactivation" : "Activation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOfficerId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-red-900/60 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-900/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Delete Authority Officer
                </h3>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-teal-100 leading-relaxed">
              Are you sure you want to permanently delete this officer? This action cannot be undone and will erase their login records, though historic audit references may remain intact.
            </p>

            <div className="pt-3 border-t border-gray-100 dark:border-teal-800 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteOfficerId(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={updatingId === deleteOfficerId}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition disabled:opacity-70"
              >
                {updatingId === deleteOfficerId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple icon for the save button
function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  );
}
