"use client";

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Bell,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

interface NoticeCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function AdminNoticeCategoriesPage() {
  const [categories, setCategories] = useState<NoticeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<NoticeCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Toggle Confirm
  const [confirmToggle, setConfirmToggle] = useState<NoticeCategory | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notice-categories");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCategories(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load notice categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) {
      setAddError("Notice Category ID and Name are required.");
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      const res = await fetch("/api/admin/notice-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId.trim(),
          name: newName.trim(),
          description: newDesc.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAddError(data.error || "Failed to add notice category.");
        return;
      }

      setCategories((prev) => [...prev, data.data]);
      setIsAddOpen(false);
      setNewId("");
      setNewName("");
      setNewDesc("");
    } catch (err) {
      console.error("Error adding notice category:", err);
      setAddError("Connection error while adding notice category.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditOpen = (cat: NoticeCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || "");
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch("/api/admin/notice-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editName.trim(),
          description: editDesc.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditError(data.error || "Failed to update notice category.");
        return;
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? data.data : c))
      );
      setEditingCategory(null);
    } catch (err) {
      console.error("Error updating notice category:", err);
      setEditError("Connection error while updating notice category.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleActive = async (cat: NoticeCategory) => {
    try {
      const nextStatus = !cat.isActive;
      const res = await fetch("/api/admin/notice-categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, isActive: nextStatus }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextStatus } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle notice category:", err);
    } finally {
      setConfirmToggle(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#061F1D] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-teal-800/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Official Gazette Bulletins</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Notice Category Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-teal-300 mt-1">
            Manage categories for municipal council resolutions, emergency alerts, advisories and public gazettes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-600 dark:text-teal-300 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setIsAddOpen(true);
              setAddError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Notice Category</span>
          </button>
        </div>
      </div>

      {/* Grid of Notice Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-teal-950/40 animate-pulse" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-gray-500 dark:text-teal-300">
            No notice categories found.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#061F1D] border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                cat.isActive
                  ? "border-gray-200 dark:border-teal-800/60"
                  : "border-gray-300 dark:border-gray-800 opacity-60 bg-gray-50 dark:bg-gray-900/40"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
                      {cat.id}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cat.isActive
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {cat.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                {cat.description && (
                  <p className="text-xs text-gray-600 dark:text-teal-200/90 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-teal-800/40 flex items-center justify-between">
                <button
                  onClick={() => handleEditOpen(cat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 dark:hover:bg-teal-800 text-gray-700 dark:text-teal-200 text-xs font-bold border border-gray-300 dark:border-teal-700/60 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setConfirmToggle(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    cat.isActive
                      ? "bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                      : "bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  {cat.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-teal-800">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-gray-900 dark:text-white">
                  Add Notice Category
                </h2>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-teal-900/60 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-teal-200 mb-1">
                  Category ID (Lowercase code, e.g. "tender_notice")
                </label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. tender_notice, tax_advisory"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-teal-200 mb-1">
                  Category Title / Label
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Public Tender & Procurement Notice"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-teal-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Specify notification criteria and intended audience..."
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-teal-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 text-gray-700 dark:text-teal-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold flex items-center gap-1.5"
                >
                  {addLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Notice Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-teal-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-gray-900 dark:text-white">
                  Edit Category: {editingCategory.id}
                </h2>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-teal-900/60 text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-teal-200 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-teal-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-[#041211] border border-gray-300 dark:border-teal-800 text-gray-900 dark:text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-teal-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 text-gray-700 dark:text-teal-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold flex items-center gap-1.5"
                >
                  {editLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Confirm Modal */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#061F1D] border border-gray-200 dark:border-teal-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Confirm Status Change
                </h3>
                <p className="text-xs text-gray-500 dark:text-teal-300">{confirmToggle.name}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-teal-100 leading-relaxed">
              Are you sure you want to {confirmToggle.isActive ? "disable" : "enable"}{" "}
              <span className="font-bold">{confirmToggle.name}</span>?
              {confirmToggle.isActive &&
                " Disabling this notice category prevents municipal officers from filing new public circulars under this topic."}
            </p>

            <div className="pt-3 border-t border-gray-100 dark:border-teal-800 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-teal-900/60 hover:bg-gray-200 text-gray-700 dark:text-teal-200 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleActive(confirmToggle)}
                className={`px-4 py-2 rounded-xl text-white font-bold transition ${
                  confirmToggle.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm {confirmToggle.isActive ? "Disabling" : "Enabling"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
