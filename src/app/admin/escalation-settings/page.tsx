"use client";

import React, { useState, useEffect } from "react";
import {
  GitFork,
  Clock,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  X,
  ArrowDown,
  Layers,
  Info,
} from "lucide-react";

interface EscalationTier {
  tierLevel: string;
  title: string;
  targetAuthority: string;
  slaHours: number;
  nextTier: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminEscalationSettingsPage() {
  const [tiers, setTiers] = useState<EscalationTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [editingTier, setEditingTier] = useState<EscalationTier | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTargetAuthority, setEditTargetAuthority] = useState("");
  const [editSlaHours, setEditSlaHours] = useState(48);
  const [editNextTier, setEditNextTier] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmation modal for destructive toggle
  const [confirmToggleTier, setConfirmToggleTier] = useState<EscalationTier | null>(null);
  const [toggleSubmitting, setToggleSubmitting] = useState(false);

  const fetchEscalationSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/escalation-settings");
      if (!res.ok) {
        throw new Error(`Failed to load escalation settings (${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTiers(data.data);
      } else {
        throw new Error(data.error || "Unexpected response format");
      }
    } catch (err: unknown) {
      console.error("Escalation settings load error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalationSettings();
  }, []);

  const openEditModal = (tier: EscalationTier) => {
    setEditingTier(tier);
    setEditTitle(tier.title);
    setEditTargetAuthority(tier.targetAuthority);
    setEditSlaHours(tier.slaHours);
    setEditNextTier(tier.nextTier || "NONE");
    setEditIsActive(tier.isActive);
    setFormError(null);
  };

  const closeEditModal = () => {
    setEditingTier(null);
    setFormError(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    if (!editTitle.trim() || !editTargetAuthority.trim()) {
      setFormError("Role Title and Target Authority are required.");
      return;
    }

    if (isNaN(editSlaHours) || editSlaHours <= 0) {
      setFormError("SLA Hours must be a positive number.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/escalation-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierLevel: editingTier.tierLevel,
          title: editTitle.trim(),
          targetAuthority: editTargetAuthority.trim(),
          slaHours: editSlaHours,
          nextTier: editNextTier === "NONE" ? null : editNextTier,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update escalation tier");
      }

      setTiers((prev) =>
        prev.map((t) => (t.tierLevel === editingTier.tierLevel ? data.data : t))
      );
      closeEditModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error saving changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleConfirm = async () => {
    if (!confirmToggleTier) return;
    setToggleSubmitting(true);

    try {
      const targetState = !confirmToggleTier.isActive;
      const res = await fetch("/api/admin/escalation-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierLevel: confirmToggleTier.tierLevel,
          isActive: targetState,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle tier status");
      }

      setTiers((prev) =>
        prev.map((t) => (t.tierLevel === confirmToggleTier.tierLevel ? data.data : t))
      );
      setConfirmToggleTier(null);
    } catch (err) {
      console.error("Error toggling tier:", err);
      alert("Failed to toggle tier. Please try again.");
    } finally {
      setToggleSubmitting(false);
    }
  };

  const totalSla = tiers.reduce((acc, t) => acc + (t.isActive ? t.slaHours : 0), 0);
  const activeTiersCount = tiers.filter((t) => t.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
              <GitFork className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Grievance Escalation Hierarchy & SLA
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure statutory multi-tier grievance resolution deadlines and jurisdictional escalation chains for Lakshmeshwar TMC.
          </p>
        </div>

        <button
          onClick={fetchEscalationSettings}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-teal-800 hover:bg-gray-100 dark:hover:bg-teal-900/40 text-gray-700 dark:text-teal-200 transition"
          aria-label="Refresh escalation settings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#062422] p-4 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Tiers</span>
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{tiers.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Statutory levels</p>
        </div>

        <div className="bg-white dark:bg-[#062422] p-4 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Chain Steps</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{activeTiersCount} of {tiers.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Operational escalation nodes</p>
        </div>

        <div className="bg-white dark:bg-[#062422] p-4 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Cumulative SLA</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{totalSla} hrs</p>
          <p className="text-[11px] text-gray-400 mt-0.5">~{Math.round(totalSla / 24)} days full chain</p>
        </div>

        <div className="bg-white dark:bg-[#062422] p-4 rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Apex Authority</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-3 truncate">
            {tiers[tiers.length - 1]?.title || "District Magistrate"}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Gadag District Admin</p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 text-xs">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Karnataka Sakala & Municipal Grievance Redressal Protocol</p>
          <p className="text-teal-700 dark:text-teal-300">
            Complaints auto-escalate along this exact chain when resolution SLAs expire. Any adjustment to SLA hours directly updates citizen breach countdowns and authority alert thresholds.
          </p>
        </div>
      </div>

      {/* Main Hierarchy Card */}
      <div className="bg-white dark:bg-[#062422] rounded-xl border border-gray-200 dark:border-teal-900/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-teal-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Statutory 4-Tier Escalation Flow
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Hierarchy order is strictly sequential
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-amber-400" />
            <p className="text-sm text-gray-500 dark:text-teal-300 font-medium">
              Loading escalation hierarchy and SLA records...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400">
              Unable to Load Escalation Settings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchEscalationSettings}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tiers.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No Escalation Tiers Configured
            </p>
            <p className="text-xs text-gray-500">
              Check database seeding or run migrations.
            </p>
          </div>
        )}

        {/* Tiers List / Ladder */}
        {!loading && !error && tiers.length > 0 && (
          <div className="p-4 sm:p-6 space-y-4">
            {tiers.map((tier, index) => {
              const isLast = index === tiers.length - 1;

              return (
                <div key={tier.tierLevel} className="flex flex-col items-center">
                  {/* Tier Card */}
                  <div
                    className={`w-full rounded-xl border p-4 sm:p-5 transition ${
                      tier.isActive
                        ? "bg-gray-50 dark:bg-teal-950/30 border-gray-200 dark:border-teal-800/80 shadow-sm"
                        : "bg-gray-100/50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-60"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Tier Rank & Details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                            tier.isActive
                              ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                              : "bg-gray-300 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          T{index + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                              {tier.tierLevel}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                tier.isActive
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                  : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800"
                              }`}
                            >
                              {tier.isActive ? "Active" : "Disabled"}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            {tier.title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-teal-200/90 font-medium">
                            Jurisdiction:{" "}
                            <span className="text-gray-800 dark:text-white font-semibold">
                              {tier.targetAuthority}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Middle: SLA & Target Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="px-3 py-2 rounded-lg bg-white dark:bg-teal-900/40 border border-gray-200 dark:border-teal-800 flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Resolution SLA</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {tier.slaHours} hours{" "}
                              <span className="text-[11px] text-gray-500 font-normal">
                                (~{Math.round(tier.slaHours / 24)} days)
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="px-3 py-2 rounded-lg bg-white dark:bg-teal-900/40 border border-gray-200 dark:border-teal-800">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Escalates To</p>
                          <p className="text-xs font-semibold text-gray-800 dark:text-teal-200 truncate max-w-[180px]">
                            {tier.nextTier || "Apex / No Further Escalation"}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200 dark:border-teal-900/60 justify-end">
                        <button
                          onClick={() => openEditModal(tier)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 dark:bg-teal-900/60 hover:bg-teal-100 dark:hover:bg-teal-800 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-700 transition"
                          aria-label={`Edit ${tier.tierLevel}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>

                        <button
                          onClick={() => setConfirmToggleTier(tier)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                            tier.isActive
                              ? "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                              : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          }`}
                          aria-label={`${tier.isActive ? "Disable" : "Enable"} ${tier.tierLevel}`}
                        >
                          {tier.isActive ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Disable</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Enable</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow down to next step */}
                  {!isLast && (
                    <div className="my-2 flex flex-col items-center text-teal-600 dark:text-teal-400">
                      <div className="w-0.5 h-3 bg-teal-400/50 dark:bg-teal-700" />
                      <div className="p-1 rounded-full bg-teal-100 dark:bg-teal-900 border border-teal-300 dark:border-teal-700">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-0.5 h-3 bg-teal-400/50 dark:bg-teal-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#062422] rounded-2xl border border-gray-200 dark:border-teal-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-teal-900/60">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-teal-600 dark:text-amber-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Configure Escalation Tier: {editingTier.tierLevel}
                </h3>
              </div>
              <button
                onClick={closeEditModal}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
                aria-label="Close configuration modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-teal-300 mb-1">
                  Tier Level (Locked by Statutory Framework)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingTier.tierLevel}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-gray-100 dark:bg-teal-950/60 border border-gray-200 dark:border-teal-900 text-gray-500 dark:text-teal-400 cursor-not-allowed font-semibold"
                />
              </div>

              <div>
                <label htmlFor="tier-title" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-teal-200 mb-1">
                  Responsible Role Title *
                </label>
                <input
                  id="tier-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Local Municipal Engineer / Health Inspector"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="tier-authority" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-teal-200 mb-1">
                  Target Office / Authority Entity *
                </label>
                <input
                  id="tier-authority"
                  type="text"
                  required
                  value={editTargetAuthority}
                  onChange={(e) => setEditTargetAuthority(e.target.value)}
                  placeholder="e.g. Lakshmeshwar TMC Health Inspector Desk"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tier-sla" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-teal-200 mb-1">
                    Resolution SLA (Hours) *
                  </label>
                  <input
                    id="tier-sla"
                    type="number"
                    min="1"
                    max="720"
                    required
                    value={editSlaHours}
                    onChange={(e) => setEditSlaHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Equivalent: ~{(editSlaHours / 24).toFixed(1)} days
                  </span>
                </div>

                <div>
                  <label htmlFor="next-tier" className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-teal-200 mb-1">
                    Next Escalation Tier
                  </label>
                  <select
                    id="next-tier"
                    value={editNextTier}
                    onChange={(e) => setEditNextTier(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-teal-950 border border-gray-300 dark:border-teal-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="NONE">None (Apex Authority)</option>
                    <option value="Block level">Block level</option>
                    <option value="District Panchayat">District Panchayat</option>
                    <option value="District Administration">District Administration</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="tier-active"
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="tier-active" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Node is Active in the Automated Escalation Flow
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-teal-900/60">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-teal-800 text-gray-700 dark:text-teal-200 hover:bg-gray-100 dark:hover:bg-teal-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 shadow-md shadow-teal-900/20"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save SLA Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Destructive Toggle */}
      {confirmToggleTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#062422] rounded-2xl border border-gray-200 dark:border-teal-800 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Confirm {confirmToggleTier.isActive ? "Disabling" : "Enabling"} Tier
                </h3>
                <p className="text-xs text-gray-500 dark:text-teal-300">
                  {confirmToggleTier.tierLevel}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {confirmToggleTier.isActive
                ? `Disabling this escalation tier will prevent complaints from routing to ${confirmToggleTier.title}. Automated workflows will bypass this tier or halt. Are you sure you want to proceed?`
                : `Enabling this tier will restore automated SLA monitoring and ticket routing to ${confirmToggleTier.title}.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-teal-900/60">
              <button
                type="button"
                onClick={() => setConfirmToggleTier(null)}
                disabled={toggleSubmitting}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-teal-800 text-gray-700 dark:text-teal-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleConfirm}
                disabled={toggleSubmitting}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-md ${
                  confirmToggleTier.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {toggleSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  Confirm {confirmToggleTier.isActive ? "Deactivation" : "Activation"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
