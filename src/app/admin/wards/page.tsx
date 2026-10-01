"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Building,
  ShieldAlert,
  Loader2,
  X,
} from "lucide-react";

interface WardItem {
  wardNumber: number;
  name: string;
  population: number;
  citizenCount: number;
  complaintCount: number;
  isActive: boolean;
}

export default function AdminWardsPage() {
  const [wards, setWards] = useState<WardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingWard, setUpdatingWard] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    wardNumber: number;
    currentActive: boolean;
  } | null>(null);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wards");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setWards(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load wards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleToggleWardStatus = async (wardNumber: number, nextStatus: boolean) => {
    setUpdatingWard(wardNumber);
    try {
      const res = await fetch("/api/admin/wards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardNumber, isActive: nextStatus }),
      });

      if (res.ok) {
        setWards((prev) =>
          prev.map((w) =>
            w.wardNumber === wardNumber ? { ...w, isActive: nextStatus } : w
          )
        );
      }
    } catch (err) {
      console.error("Failed to update ward:", err);
    } finally {
      setUpdatingWard(null);
      setConfirmModal(null);
    }
  };

  const totalPopulation = wards.reduce((sum, w) => sum + (w.population || 0), 0);
  const totalCitizens = wards.reduce((sum, w) => sum + (w.citizenCount || 0), 0);
  const totalComplaints = wards.reduce((sum, w) => sum + (w.complaintCount || 0), 0);
  const activeCount = wards.filter((w) => w.isActive).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Territorial Jurisdiction</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Ward Management (23 Wards)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-teal-300 mt-1">
            Official administrative wards of Lakshmeshwar Town Municipal Council with demographic census & grievance densities.
          </p>
        </div>

        <button
          onClick={fetchWards}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 text-xs font-bold border border-gray-300 dark:border-teal-700/60 transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Wards</span>
        </button>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800/60 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-teal-300">Total Wards</span>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">23</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{activeCount} Active</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800/60 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-teal-300">Total Population</span>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            {totalPopulation.toLocaleString()}
          </p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Census Baseline</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800/60 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-teal-300">Registered Citizens</span>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            {totalCitizens.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Portal Users</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800/60 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-teal-300">Total Complaints</span>
          <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            {totalComplaints.toLocaleString()}
          </p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Lodged in Wards</span>
        </div>
      </div>

      {/* 23 Wards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-teal-950/40 animate-pulse" />
          ))
        ) : (
          wards.map((ward) => (
            <div
              key={ward.wardNumber}
              className={`p-5 rounded-2xl bg-white dark:bg-[#061F1D] border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                ward.isActive
                  ? "border-gray-200 dark:border-teal-800/60"
                  : "border-gray-300 dark:border-gray-800 opacity-60 bg-gray-50 dark:bg-gray-900/40"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-black text-sm flex items-center justify-center border border-teal-200 dark:border-teal-700">
                      W{ward.wardNumber}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        {ward.name}
                      </h3>
                      <span className="text-[11px] text-gray-500 dark:text-teal-300 font-medium">
                        Lakshmeshwar Municipal Council
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ward.isActive
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {ward.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-teal-800/40 text-center text-xs">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-teal-950/40">
                    <span className="text-[10px] text-gray-400 dark:text-teal-400 block font-semibold">Population</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {ward.population.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-teal-950/40">
                    <span className="text-[10px] text-gray-400 dark:text-teal-400 block font-semibold">Citizens</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">
                      {ward.citizenCount}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-teal-950/40">
                    <span className="text-[10px] text-gray-400 dark:text-teal-400 block font-semibold">Complaints</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {ward.complaintCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action Button */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-teal-800/40 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 dark:text-teal-400">
                  Ward Status: {ward.isActive ? "Operational" : "Suspended"}
                </span>

                <button
                  onClick={() =>
                    setConfirmModal({
                      wardNumber: ward.wardNumber,
                      currentActive: ward.isActive,
                    })
                  }
                  disabled={updatingWard === ward.wardNumber}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    ward.isActive
                      ? "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60"
                      : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                  }`}
                >
                  {updatingWard === ward.wardNumber ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  <span>{ward.isActive ? "Deactivate" : "Activate"}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Confirm Ward Status Change
                </h3>
                <p className="text-xs text-gray-500 dark:text-teal-300">
                  Ward {confirmModal.wardNumber}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-teal-100 leading-relaxed">
              Are you sure you want to {confirmModal.currentActive ? "deactivate" : "activate"}{" "}
              <span className="font-bold">Ward {confirmModal.wardNumber}</span>?
              {confirmModal.currentActive &&
                " Deactivating a ward hides it from the default citizen lodging options while preserving historical complaint records."}
            </p>

            <div className="pt-3 border-t border-gray-100 dark:border-teal-800 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleToggleWardStatus(
                    confirmModal.wardNumber,
                    !confirmModal.currentActive
                  )
                }
                className={`px-4 py-2 rounded-xl text-white font-bold transition ${
                  confirmModal.currentActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm {confirmModal.currentActive ? "Deactivation" : "Activation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
